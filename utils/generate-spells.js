#!/usr/bin/env node
/**
 * Generate spell list from assets/spells.tsv
 * Output: src/gvars/utils/catalogues/spells/spells_list.gvar.json
 */
const paths = require('./lib/paths');
const { readTsv } = require('./lib/read-tsv');
const { writeJsonGvar } = require('./lib/write-json-gvar');
const { printManifest } = require('./lib/manifest');

const INPUT = paths.assets('spells.tsv');
const name = 'spells_list';
const file = 'src/gvars/utils/catalogues/spells/spells_list.gvar.json';

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

console.log('Spells done.');
