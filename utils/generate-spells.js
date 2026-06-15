#!/usr/bin/env node
/**
 * Generate spell list from assets/spells.tsv
 * Output: src/gvars/utils/catalogues/spells/spells_list.gvar
 */
const paths = require('./lib/paths');
const { readTsv } = require('./lib/read-tsv');
const { writeJsonGvar } = require('./lib/write-json-gvar');
const { printManifest } = require('./lib/manifest');
const { ensureShardSlots } = require('./lib/sourcemap-shards');

const INPUT = paths.assets('spells.tsv');
const name = 'spells_list';
const file = 'src/gvars/utils/catalogues/spells/spells_list.gvar';

console.log(`Reading ${INPUT}`);

const { rows } = readTsv(INPUT);

const spells = rows
  .map((row) => ({
    name: row.name,
    level: Number(row.level),
    school: row.school,
  }))
  .filter(({ name: n }) => n && String(n).trim());

writeJsonGvar(paths.gvar(file), spells);

printManifest('Spells', [{ name, file, count: spells.length, required: true }], {
  failOnEmptyRequired: true,
});

const { added, skipped } = ensureShardSlots([{ name, file }]);
console.log(`Sourcemap: ${added} slot(s) added, ${skipped} already registered.`);
console.log('Spells done.');
