const { readFileSync, writeFileSync } = require('fs');
const paths = require('./paths');

/**
 * Ensure catalogue shard slots exist in dev + prod sourcemaps.
 * Consumes UUIDs from unused_gvars.md (two per new shard).
 * @param {{ name: string, file: string }[]} entries — repo-relative file paths
 */
function ensureShardSlots(entries) {
  if (!entries.length) return { added: 0, skipped: 0 };

  const pool = readFileSync(paths.unusedGvars, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const dev = JSON.parse(readFileSync(paths.sourcemapDev, 'utf8'));
  const prod = JSON.parse(readFileSync(paths.sourcemapProd, 'utf8'));

  let added = 0;
  let skipped = 0;

  for (const { name, file } of entries) {
    const inDev = dev.gvars.some((g) => g.name === name);
    const inProd = prod.gvars.some((g) => g.name === name);

    if (inDev && inProd) {
      skipped++;
      continue;
    }

    if (pool.length < 2) {
      console.error(
        `unused_gvars.md: need 2 UUIDs for "${name}" but only ${pool.length} left`,
      );
      process.exit(1);
    }

    const devId = pool.shift();
    const prodId = pool.shift();

    if (!inDev) {
      dev.gvars.push({ name, file, id: devId });
      added++;
    }
    if (!inProd) {
      prod.gvars.push({ name, file, id: prodId });
      added++;
    }
  }

  // Stable sort: env first, then alphabetical by name
  const sortGvars = (gvars) =>
    [...gvars].sort((a, b) => {
      if (a.name === 'env') return -1;
      if (b.name === 'env') return 1;
      return a.name.localeCompare(b.name);
    });

  dev.gvars = sortGvars(dev.gvars);
  prod.gvars = sortGvars(prod.gvars);

  writeFileSync(paths.sourcemapDev, `${JSON.stringify(dev, null, 2)}\n`);
  writeFileSync(paths.sourcemapProd, `${JSON.stringify(prod, null, 2)}\n`);
  writeFileSync(paths.unusedGvars, pool.length ? `${pool.join('\n')}\n` : '');

  return { added, skipped };
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

module.exports = { ensureShardSlots, listMissingFromSourcemap };
