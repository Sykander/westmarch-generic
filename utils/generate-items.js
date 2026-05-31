#!/usr/bin/env node
/**
 * Generate item catalogue shards from public/assets/items.tsv
 * Output: items_list, potions_list, magic_items_list
 */
const paths = require('./lib/paths');
const { readTsv } = require('./lib/read-tsv');
const { writeJsonGvar } = require('./lib/write-json-gvar');
const { printManifest } = require('./lib/manifest');
const { ensureShardSlots } = require('./lib/sourcemap-shards');

const INPUT = paths.assets('items.tsv');
const OUT_DIR = 'src/gvars/utils/catalogues/items';

const RARITIES = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
const POTION_PRICES = ['250 gp', '500 gp', '1,000 gp', '10,000 gp', '100,000 gp'];
const MAGIC_PRICES = ['1000 gp', '2000 gp', '10000 gp', '100000 gp', '1000000 gp'];

console.log(`Reading ${INPUT}`);

const { rows } = readTsv(INPUT);

const processed = rows
  .map(({ name, value, type }) => {
    let newValue = value;
    let rarity = null;

    switch (type) {
      case 'Potion':
        if (RARITIES.includes(newValue)) {
          const idx = RARITIES.indexOf(newValue);
          rarity = newValue;
          newValue = POTION_PRICES[idx];
        }
        break;
      case 'Item':
        rarity = 'mundane';
        break;
      case 'Magic Item':
        if (RARITIES.includes(newValue)) {
          const idx = RARITIES.indexOf(newValue);
          rarity = newValue;
          newValue = MAGIC_PRICES[idx];
        }
        break;
      default:
        break;
    }

    return { name, rarity, type, value: newValue };
  })
  .filter(({ name }) => name && String(name).trim());

const shards = [
  { name: 'items_list', type: 'Item' },
  { name: 'potions_list', type: 'Potion' },
  { name: 'magic_items_list', type: 'Magic Item' },
];

const manifest = [];
const sourcemapEntries = [];

for (const { name, type } of shards) {
  const file = `${OUT_DIR}/${name}.gvar`;
  const contents = processed.filter((row) => row.type === type);
  writeJsonGvar(paths.gvar(file), contents);
  manifest.push({ name, file, count: contents.length, required: true });
  sourcemapEntries.push({ name, file });
}

printManifest('Items', manifest, { failOnEmptyRequired: true });

const { added, skipped } = ensureShardSlots(sourcemapEntries);
console.log(`Sourcemap: ${added} slot(s) added, ${skipped} already registered.`);
console.log('Items done.');
