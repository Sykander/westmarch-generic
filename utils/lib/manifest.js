/**
 * Log shard write summary; optionally fail on required empty shards.
 * @param {string} label
 * @param {{ name: string, file: string, count: number, required?: boolean }[]} shards
 * @param {{ failOnEmptyRequired?: boolean }} [options]
 */
function printManifest(label, shards, options = {}) {
  const { failOnEmptyRequired = false } = options;
  console.log(`\n${label}:`);
  let failed = false;

  for (const { name, file, count, required = false } of shards) {
    const flag = count === 0 ? (required ? 'EMPTY' : 'empty') : `${count} rows`;
    console.log(`  ${name.padEnd(24)} ${String(count).padStart(6)}  ${file}  [${flag}]`);
    if (required && count === 0) failed = true;
  }

  if (failed && failOnEmptyRequired) {
    console.error(`\n${label}: required shard(s) empty — aborting.`);
    process.exit(1);
  }

  return shards;
}

module.exports = { printManifest };
