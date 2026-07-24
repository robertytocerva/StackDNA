const db = require('../../config/database');
const githubService = require('../../services/githubService');
const osvService = require('../../services/osvService');
const geminiService = require('../../services/geminiService');
const catalogService = require('../catalog/catalog.service');

const CACHE_TTL_HOURS = 24;

class RepoAnalyzerService {
  async analyze(repoUrl) {
    const { owner, repo } = githubService.parseRepoUrl(repoUrl);
    const normalizedUrl = `https://github.com/${owner}/${repo}`;

    const cached = await this.getCached(normalizedUrl);
    if (cached) {
      return { ...cached, cached: true };
    }

    const accessible = await githubService.isAccessible(owner, repo);
    if (!accessible) {
      await this.saveResult(normalizedUrl, owner, repo, null, 'private');
      throw new AppError('Repository is private or inaccessible', 403);
    }

    await this.saveResult(normalizedUrl, owner, repo, null, 'pending');

    try {
      const repoData = await githubService.analyzeRepo(owner, repo);

      const depsForVulnCheck = repoData.dependencies
        .filter(d => d.version && d.version !== 'latest')
        .map(d => ({ name: d.name, version: d.version, ecosystem: d.ecosystem }));

      const vulnerabilities = await osvService.checkVulnerabilities(depsForVulnCheck);

      const geminiAnalysis = await geminiService.analyzeProject({
        ...repoData,
        vulnerabilities,
      });

      const catalogMatches = await this.matchCatalog(repoData.dependencies);

      const result = {
        repo: repoData.repo,
        stack: {
          languages: repoData.languages,
          dependencies: this.groupDependencies(repoData.dependencies),
        },
        vulnerabilities,
        structure: {
          directories: repoData.structure.directories,
          keyFiles: repoData.structure.keyFiles,
          totalFiles: repoData.structure.totalFiles,
        },
        analysis: geminiAnalysis,
        catalogMatches,
        analyzedAt: new Date().toISOString(),
      };

      await this.saveResult(normalizedUrl, owner, repo, result, 'completed');

      return { ...result, cached: false };
    } catch (err) {
      await this.saveResult(normalizedUrl, owner, repo, null, 'error');
      throw err;
    }
  }

  async getCached(repoUrl) {
    const cached = await db('repo_analyses')
      .where({ repo_url: repoUrl, status: 'completed' })
      .whereRaw(`created_at > NOW() - INTERVAL '${CACHE_TTL_HOURS} hours'`)
      .first();

    return cached ? cached.result : null;
  }

  async saveResult(repoUrl, owner, repo, result, status) {
    const existing = await db('repo_analyses').where({ repo_url: repoUrl }).first();

    if (existing) {
      await db('repo_analyses')
        .where('id', existing.id)
        .update({
          result: result ? JSON.stringify(result) : null,
          status,
          updated_at: db.fn.now(),
        });
    } else {
      await db('repo_analyses').insert({
        repo_url: repoUrl,
        owner,
        repo_name: repo,
        result: result ? JSON.stringify(result) : null,
        status,
      });
    }
  }

  groupDependencies(deps) {
    const grouped = { npm: [], pypi: [], maven: [], go: [], ruby: [], other: [] };

    for (const dep of deps) {
      switch (dep.ecosystem) {
        case 'npm':
          grouped.npm.push({ name: dep.name, version: dep.version, isDev: dep.isDev });
          break;
        case 'PyPI':
          grouped.pypi.push({ name: dep.name, version: dep.version, isDev: dep.isDev });
          break;
        case 'Maven':
          grouped.maven.push({ name: dep.name, version: dep.version, isDev: dep.isDev });
          break;
        case 'Go':
          grouped.go.push({ name: dep.name, version: dep.version, isDev: dep.isDev });
          break;
        case 'RubyGems':
          grouped.ruby.push({ name: dep.name, version: dep.version, isDev: dep.isDev });
          break;
        default:
          grouped.other.push({ name: dep.name, version: dep.version, isDev: dep.isDev, ecosystem: dep.ecosystem });
      }
    }

    for (const key of Object.keys(grouped)) {
      grouped[key] = grouped[key].slice(0, 100);
    }

    return grouped;
  }

  async matchCatalog(dependencies) {
    const matches = [];
    const seen = new Set();

    for (const dep of dependencies.slice(0, 30)) {
      const slug = dep.name.replace(/^@[^/]+\//, '').toLowerCase();
      if (seen.has(slug)) continue;
      seen.add(slug);

      const tech = await catalogService.getBySlug(slug);
      if (tech) {
        matches.push({
          slug: tech.slug,
          name: tech.nombre,
          matchScore: 1.0,
        });
      }
    }

    return matches;
  }

  async getHistory(limit = 10) {
    return db('repo_analyses')
      .select('id', 'repo_url', 'owner', 'repo_name', 'status', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(limit);
  }
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode;
  }
}

module.exports = new RepoAnalyzerService();
