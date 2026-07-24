const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

function getHeaders() {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function parseRepoUrl(url) {
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/,
    /^([^/]+)\/([^/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }

  throw new Error('Invalid GitHub URL format. Use: https://github.com/owner/repo or owner/repo');
}

async function isAccessible(owner, repo) {
  try {
    await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: getHeaders(),
      timeout: 10000,
    });
    return true;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 403)) {
      return false;
    }
    throw err;
  }
}

async function getRepoInfo(owner, repo) {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
    timeout: 10000,
  });

  return {
    owner: data.owner.login,
    name: data.name,
    description: data.description || '',
    stars: data.stargazers_count,
    forks: data.forks_count,
    language: data.language,
    license: data.license?.spdx_id || null,
    url: data.html_url,
    homepage: data.homepage || null,
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at,
    openIssues: data.open_issues_count,
    topics: data.topics || [],
    size: data.size,
  };
}

async function getFileTree(owner, repo, branch = 'main') {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
    headers: getHeaders(),
    timeout: 15000,
  });

  const files = (data.tree || [])
    .filter(item => item.type === 'blob')
    .map(item => item.path);

  const directories = [...new Set(
    files
      .map(f => f.split('/').slice(0, -1).join('/'))
      .filter(d => d)
  )].slice(0, 100);

  const keyFiles = files.filter(f =>
    /^(package\.json|requirements\.txt|pyproject\.toml|pom\.xml|build\.gradle|go\.mod|Gemfile|composer\.json|Cargo\.toml|README\.md|LICENSE|\.gitignore|tsconfig\.json|webpack\.config|vite\.config|docker-compose|Dockerfile|\.env\.example)$/i.test(f.split('/').pop())
  ).slice(0, 50);

  return {
    files: files.slice(0, 500),
    directories,
    keyFiles,
    totalFiles: files.length,
  };
}

async function getFileContent(owner, repo, path) {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers: getHeaders(),
      timeout: 10000,
    });

    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch {
    return null;
  }
}

async function getLanguages(owner, repo) {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
      headers: getHeaders(),
      timeout: 10000,
    });

    const total = Object.values(data).reduce((a, b) => a + b, 0);
    return Object.entries(data).map(([lang, bytes]) => ({
      name: lang,
      percentage: Math.round((bytes / total) * 100),
    }));
  } catch {
    return [];
  }
}

function parsePackageJson(content) {
  try {
    const pkg = JSON.parse(content);
    const deps = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
      name,
      version: version.replace(/[\^~>=<]/g, ''),
      ecosystem: 'npm',
      isDev: false,
    }));
    const devDeps = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
      name,
      version: version.replace(/[\^~>=<]/g, ''),
      ecosystem: 'npm',
      isDev: true,
    }));
    return { dependencies: deps, devDependencies: devDeps, name: pkg.name };
  } catch {
    return { dependencies: [], devDependencies: [], name: null };
  }
}

function parseRequirementsTxt(content) {
  const deps = [];
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('-'));

  for (const line of lines) {
    const match = line.match(/^([a-zA-Z0-9_.-]+)\s*[=><!~]+\s*([^\s#]+)/);
    if (match) {
      deps.push({
        name: match[1].toLowerCase().replace(/_/g, '-'),
        version: match[2],
        ecosystem: 'PyPI',
        isDev: false,
      });
    }
  }
  return deps;
}

function parsePyprojectToml(content) {
  const deps = [];
  const depSection = content.match(/\[project\]\s*dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (depSection) {
    const depLines = depSection[1].split('\n').filter(l => l.trim().startsWith('"'));
    for (const line of depLines) {
      const match = line.match(/"([a-zA-Z0-9_.-]+)\s*[=><!~]+\s*([^"]+)"/);
      if (match) {
        deps.push({
          name: match[1].toLowerCase().replace(/_/g, '-'),
          version: match[2],
          ecosystem: 'PyPI',
          isDev: false,
        });
      }
    }
  }
  return deps;
}

function parsePomXml(content) {
  const deps = [];
  const depRegex = /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*<version>([^<]+)<\/version>/g;
  let match;

  while ((match = depRegex.exec(content)) !== null) {
    deps.push({
      name: `${match[1]}:${match[2]}`,
      version: match[3].replace(/\$\{[^}]+\}/g, ''),
      ecosystem: 'Maven',
      isDev: false,
    });
  }
  return deps;
}

function parseGoMod(content) {
  const deps = [];
  const requireSection = content.match(/require\s*\(([\s\S]*?)\)/);
  if (requireSection) {
    const lines = requireSection[1].split('\n').filter(l => l.trim());
    for (const line of lines) {
      const match = line.match(/^([^\s]+)\s+([^\s]+)/);
      if (match && !match[1].includes('//')) {
        deps.push({
          name: match[1],
          version: match[2].replace(/^v/, ''),
          ecosystem: 'Go',
          isDev: false,
        });
      }
    }
  }
  return deps;
}

function parseGemfile(content) {
  const deps = [];
  const gemRegex = /gem\s+['"]([^'"]+)['"](?:,\s+['"]([^'"]+)['"])?/g;
  let match;

  while ((match = gemRegex.exec(content)) !== null) {
    deps.push({
      name: match[1],
      version: match[2] || 'latest',
      ecosystem: 'RubyGems',
      isDev: false,
    });
  }
  return deps;
}

async function getManifestFiles(owner, repo) {
  const manifestPaths = [
    'package.json',
    'requirements.txt',
    'pyproject.toml',
    'pom.xml',
    'build.gradle',
    'go.mod',
    'Gemfile',
    'composer.json',
    'Cargo.toml',
  ];

  const manifests = {};

  for (const path of manifestPaths) {
    const content = await getFileContent(owner, repo, path);
    if (content) {
      manifests[path] = content;
    }
  }

  return manifests;
}

function parseAllManifests(manifests) {
  const allDeps = [];
  let projectName = null;

  if (manifests['package.json']) {
    const parsed = parsePackageJson(manifests['package.json']);
    allDeps.push(...parsed.dependencies, ...parsed.devDependencies);
    projectName = parsed.name;
  }

  if (manifests['requirements.txt']) {
    allDeps.push(...parseRequirementsTxt(manifests['requirements.txt']));
  }

  if (manifests['pyproject.toml']) {
    allDeps.push(...parsePyprojectToml(manifests['pyproject.toml']));
  }

  if (manifests['pom.xml']) {
    allDeps.push(...parsePomXml(manifests['pom.xml']));
  }

  if (manifests['go.mod']) {
    allDeps.push(...parseGoMod(manifests['go.mod']));
  }

  if (manifests['Gemfile']) {
    allDeps.push(...parseGemfile(manifests['Gemfile']));
  }

  if (manifests['composer.json']) {
    try {
      const composer = JSON.parse(manifests['composer.json']);
      const deps = Object.entries(composer.require || {}).map(([name, version]) => ({
        name,
        version: version.replace(/[\^~>=<]/g, ''),
        ecosystem: 'Packagist',
        isDev: false,
      }));
      allDeps.push(...deps);
    } catch {}
  }

  if (manifests['Cargo.toml']) {
    const tomlDeps = [];
    const depSection = manifests['Cargo.toml'].match(/\[dependencies\]([\s\S]*?)(?:\[|$)/);
    if (depSection) {
      const lines = depSection[1].split('\n').filter(l => l.trim());
      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']?([^"'\s]+)["']?/);
        if (match) {
          tomlDeps.push({
            name: match[1],
            version: match[2].replace(/[~^>=<]/g, ''),
            ecosystem: 'crates.io',
            isDev: false,
          });
        }
      }
    }
    allDeps.push(...tomlDeps);
  }

  return { dependencies: allDeps, projectName };
}

async function analyzeRepo(owner, repo) {
  const repoInfo = await getRepoInfo(owner, repo);
  
  const [tree, languages, manifests] = await Promise.all([
    getFileTree(owner, repo, repoInfo.defaultBranch),
    getLanguages(owner, repo),
    getManifestFiles(owner, repo),
  ]);

  const readme = await getFileContent(owner, repo, 'README.md');
  const { dependencies, projectName } = parseAllManifests(manifests);

  return {
    repo: repoInfo,
    structure: tree,
    languages,
    manifests: Object.keys(manifests),
    dependencies,
    projectName: projectName || repoInfo.name,
    readme: readme ? readme.slice(0, 5000) : null,
  };
}

module.exports = {
  parseRepoUrl,
  isAccessible,
  getRepoInfo,
  getFileTree,
  getFileContent,
  getLanguages,
  getManifestFiles,
  parseAllManifests,
  analyzeRepo,
};
