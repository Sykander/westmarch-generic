#!/usr/bin/env node
/**
 * Generate monster letter shards from assets/monsters.tsv
 * Output:
 * - src/gvars/utils/catalogues/monsters/monsters_{a-z}.gvar.json
 */
const paths = require('./lib/paths');
const { readTsv } = require('./lib/read-tsv');
const { writeJsonGvar } = require('./lib/write-json-gvar');
const { LETTERS } = require('./lib/shard-by');
const { printManifest } = require('./lib/manifest');
const { assertShardSlots } = require('./lib/sourcemap-shards');

const INPUT = paths.assets('monsters.tsv');
const OUT_DIR = 'src/gvars/utils/catalogues/monsters';

console.log(`Reading ${INPUT}`);

const { rows } = readTsv(INPUT);

const processed = rows
  .map(
    ({
      Name: name,
      Source: source,
      CR: cr,
      Type: type_str,
      Size: size,
      PP: pp,
      Image: image_url,
      Token: token,
      Named: named,
    }) => ({
      name,
      source,
      cr: Number(cr),
      type_str,
      size,
      pp: pp ? Number(pp) : 10,
      image_url,
      token,
      named: named === 'TRUE',
    }),
  )
  .filter(({ name }) => name && String(name).trim());

const manifest = [];
const sourcemapEntries = [];

for (const letter of LETTERS) {
  const name = `monsters_${letter}`;
  const file = `${OUT_DIR}/${name}.gvar.json`;
  const abs = paths.gvar(file);
  const contents = processed.filter(({ name: n }) => String(n).toLowerCase().startsWith(letter));
  writeJsonGvar(abs, contents);
  manifest.push({ name, file, count: contents.length });
  sourcemapEntries.push({ name, file });
}

printManifest('Monsters', manifest);

const { registered } = assertShardSlots(sourcemapEntries);
console.log(`Sourcemap: ${registered} slot(s) already registered.`);
console.log('Monsters done.');
