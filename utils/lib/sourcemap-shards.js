const { readFileSync } = require('fs');
const paths = require('./paths');

/**
 * Assert catalogue shard slots already exist in dev + prod sourcemaps.
 * @param {{ name: string, file: string }[]} entries — repo-relative file paths
 */
function assertShardSlots(entries) {
  if (!entries.length) return { registered: 0 };

  const dev = JSON.parse(readFileSync(paths.sourcemapDev, 'utf8'));
  const prod = JSON.parse(readFileSync(paths.sourcemapProd, 'utf8'));
  const devByName = new Map(dev.gvars.map((gvar) => [gvar.name, gvar]));
  const prodByName = new Map(prod.gvars.map((gvar) => [gvar.name, gvar]));
  const errors = [];

  for (const { name, file } of entries) {
    const devEntry = devByName.get(name);
    const prodEntry = prodByName.get(name);

    if (!devEntry) {
      errors.push(`${name}: missing from utils/sourcemap.dev.json`);
    } else if (devEntry.file !== file) {
      errors.push(`${name}: dev sourcemap points at ${devEntry.file}, expected ${file}`);
    }

    if (!prodEntry) {
      errors.push(`${name}: missing from utils/sourcemap.prod.json`);
    } else if (prodEntry.file !== file) {
      errors.push(`${name}: prod sourcemap points at ${prodEntry.file}, expected ${file}`);
    }
  }

  if (errors.length) {
    console.error('Missing or mismatched sourcemap shard slots:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    console.error('Allocate UUIDs from unused_gvars.md and edit both sourcemaps manually.');
    process.exit(1);
  }

  return { registered: entries.length };
}

/**
 * List generated shard paths missing from dev sourcemap.
 * @param {{ name: string, file: string }[]} entries
 */
function listMissingFromSourcemap(entries) {
  const dev = JSON.parse(readFileSync(paths.sourcemapDev, 'utf8'));
  const names = new Set(dev.gvars.map((g) => g.name));
  return entries.filter((e) => !names.has(e.name));
}

module.exports = { assertShardSlots, listMissingFromSourcemap };
