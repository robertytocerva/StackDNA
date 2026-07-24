const axios = require('axios');

const OSV_API = 'https://api.osv.dev/v1';

const ECOSYSTEM_MAP = {
  npm: 'npm',
  pypi: 'PyPI',
  PyPI: 'PyPI',
  Maven: 'Maven',
  Go: 'Go',
  RubyGems: 'RubyGems',
  Packagist: 'Packagist',
  'crates.io': 'crates.io',
};

async function queryBatch(packages) {
  if (!packages.length) return [];

  const queries = packages.map(pkg => ({
    package: {
      name: pkg.name,
      ecosystem: ECOSYSTEM_MAP[pkg.ecosystem] || pkg.ecosystem,
    },
    version: pkg.version,
  }));

  try {
    const { data } = await axios.post(`${OSV_API}/querybatch`, {
      queries,
    }, {
      timeout: 30000,
    });

    const results = [];

    for (let i = 0; i < data.results.length; i++) {
      const result = data.results[i];
      if (result.vulns && result.vulns.length > 0) {
        for (const vuln of result.vulns) {
          results.push({
            id: vuln.id,
            summary: vuln.summary || vuln.details || 'No description',
            severity: extractSeverity(vuln),
            aliases: vuln.aliases || [],
            references: (vuln.references || []).map(r => r.url).filter(Boolean),
            fixedVersion: extractFixedVersion(vuln, packages[i]),
            package: packages[i].name,
            ecosystem: packages[i].ecosystem,
            currentVersion: packages[i].version,
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.error('OSV batch query error:', err.message);
    return [];
  }
}

async function querySingle(pkg) {
  try {
    const { data } = await axios.post(`${OSV_API}/query`, {
      package: {
        name: pkg.name,
        ecosystem: ECOSYSTEM_MAP[pkg.ecosystem] || pkg.ecosystem,
      },
      version: pkg.version,
    }, {
      timeout: 10000,
    });

    return (data.vulns || []).map(vuln => ({
      id: vuln.id,
      summary: vuln.summary || vuln.details || 'No description',
      severity: extractSeverity(vuln),
      aliases: vuln.aliases || [],
      references: (vuln.references || []).map(r => r.url).filter(Boolean),
      fixedVersion: extractFixedVersion(vuln, pkg),
      package: pkg.name,
      ecosystem: pkg.ecosystem,
      currentVersion: pkg.version,
    }));
  } catch {
    return [];
  }
}

function extractSeverity(vuln) {
  if (vuln.database_specific?.severity) {
    return vuln.database_specific.severity;
  }
  if (vuln.severity) {
    const sev = Array.isArray(vuln.severity) ? vuln.severity[0] : vuln.severity;
    if (sev.score) {
      const cvss = parseFloat(sev.score);
      if (cvss >= 9) return 'critical';
      if (cvss >= 7) return 'high';
      if (cvss >= 4) return 'medium';
      return 'low';
    }
  }
  if (vuln.affected) {
    for (const affected of vuln.affected) {
      if (affected.ranges) {
        for (const range of affected.ranges) {
          if (range.events) {
            for (const event of range.events) {
              if (event.fixed) return 'fixed';
            }
          }
        }
      }
    }
  }
  return 'unknown';
}

function extractFixedVersion(vuln, pkg) {
  if (!vuln.affected) return null;

  for (const affected of vuln.affected) {
    if (affected.package && affected.package.name === pkg.name) {
      if (affected.ranges) {
        for (const range of affected.ranges) {
          if (range.events) {
            for (const event of range.events) {
              if (event.fixed) return event.fixed;
            }
          }
        }
      }
    }
  }
  return null;
}

async function checkVulnerabilities(packages) {
  if (!packages.length) return [];

  const BATCH_SIZE = 50;
  const allVulns = [];

  for (let i = 0; i < packages.length; i += BATCH_SIZE) {
    const batch = packages.slice(i, i + BATCH_SIZE);
    const vulns = await queryBatch(batch);
    allVulns.push(...vulns);
  }

  const uniqueVulns = [];
  const seen = new Set();

  for (const vuln of allVulns) {
    const key = `${vuln.id}-${vuln.package}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueVulns.push(vuln);
    }
  }

  return uniqueVulns;
}

module.exports = {
  querySingle,
  queryBatch,
  checkVulnerabilities,
};
