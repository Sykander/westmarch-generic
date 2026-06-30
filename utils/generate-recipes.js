#!/usr/bin/env node
/**
 * Generate recipe catalogue from assets/recipes.tsv
 * Output: src/gvars/configs/recipes/recipes_list.gvar.json (JSON array)
 */
const paths = require('./lib/paths');
const { readTsv } = require('./lib/read-tsv');
const { writeJsonGvar } = require('./lib/write-json-gvar');
const { printManifest } = require('./lib/manifest');
const { ensureShardSlots } = require('./lib/sourcemap-shards');

const INPUT = paths.assets('recipes.tsv');
const name = 'recipes_list';
const file = 'src/gvars/configs/recipes/recipes_list.gvar.json';

function parseMaterialList(raw) {
  const s = String(raw || '').trim();
  if (!s) return [];
  return s.split(';').map((part) => {
    const idx = part.lastIndexOf(':');
    if (idx === -1) return { item: part.trim(), qty: 1 };
    const item = part.slice(0, idx).trim();
    const qty = Number.parseInt(part.slice(idx + 1).trim(), 10);
    return { item, qty: Number.isFinite(qty) ? qty : 1 };
  });
}

function parseCsvList(raw) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseOptionalFloat(raw) {
  const s = String(raw || '').trim();
  if (!s) return undefined;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

console.log(`Reading ${INPUT}`);

const { rows } = readTsv(INPUT);

const recipes = rows
  .map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind,
    workdays: Number.parseInt(row.workdays, 10) || 0,
    gold: parseOptionalFloat(row.gold),
    consumed: parseMaterialList(row.consumed),
    required: parseMaterialList(row.required),
    spells: parseCsvList(row.spells),
    tools: parseCsvList(row.tools),
    tags: parseCsvList(row.tags),
    description: String(row.description || '').replace(/\\n/g, '\n'),
  }))
  .filter(({ id }) => id && String(id).trim());

writeJsonGvar(paths.gvar(file), recipes);

printManifest('Recipes', [{ name, file, count: recipes.length }]);
const { added, skipped } = ensureShardSlots([{ name, file }]);
console.log(`Sourcemap: ${added} slot(s) added, ${skipped} already registered.`);
console.log('Recipes done.');
