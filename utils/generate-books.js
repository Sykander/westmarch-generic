#!/usr/bin/env node
/**
 * Generate book shards from books-forgotten-realms.tsv and books-real.tsv
 * Output: src/gvars/configs/books/forgotten_realms_{a-o,pq,r-t,v,w}.gvar.json
 * plus corpus all/letter shards as needed.
 */
const { readdirSync, unlinkSync } = require('fs');
const paths = require('./lib/paths');
const { readTsv } = require('./lib/read-tsv');
const { writeJsonGvar } = require('./lib/write-json-gvar');
const { LETTERS, letterFromName } = require('./lib/shard-by');
const { printManifest } = require('./lib/manifest');
const { ensureShardSlots } = require('./lib/sourcemap-shards');

const OUT_DIR = 'src/gvars/configs/books';
const LETTER_SHARD_THRESHOLD = 100;
const FORGOTTEN_REALMS_GROUPS = [
  ['a'],
  ['b'],
  ['c'],
  ['d'],
  ['e'],
  ['f'],
  ['g'],
  ['h'],
  ['i'],
  ['j'],
  ['k'],
  ['l'],
  ['m'],
  ['n'],
  ['o'],
  ['p', 'q'],
  ['r'],
  ['s'],
  ['t'],
  ['u'],
  ['v'],
  ['w'],
  ['x'],
  ['y'],
  ['z'],
];

function parseTags(s) {
  return String(s || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function rowToBook(row) {
  const name = String(row.name ?? '').trim();
  const type = String(row.type ?? 'original')
    .trim()
    .toLowerCase();
  const readRaw = String(row.read_bonus ?? '0').trim();
  const read_bonus = Number.parseInt(readRaw, 10);

  const book = {
    name,
    author: String(row.author ?? '').trim(),
    written: String(row.written ?? '').trim(),
    rarity: String(row.rarity ?? 'common')
      .trim()
      .toLowerCase(),
    language: String(row.language ?? '').trim(),
    type: type === 'commentary' ? 'commentary' : 'original',
  };

  const baseWork = String(row.base_work ?? '').trim();
  if (baseWork) book.base_work = baseWork;

  book.description = String(row.description ?? '').replace(/\\n/g, '\n');
  book.tags = parseTags(row.tags);
  book.read_bonus = Number.isFinite(read_bonus) ? read_bonus : 0;

  const image = String(row.image ?? '').trim();
  if (image) book.image = image;

  const contentLink = String(row.content_link ?? '').trim();
  if (contentLink) book.content_link = contentLink;

  return book;
}

function cleanCorpusOutputs(corpus) {
  const dir = paths.gvar(OUT_DIR);
  for (const filename of readdirSync(dir)) {
    if (filename.startsWith(`${corpus}_`) && filename.endsWith('.gvar.json')) {
      unlinkSync(paths.gvar(`${OUT_DIR}/${filename}`));
    }
  }
}

function shardGroups(corpus) {
  if (corpus === 'forgotten_realms') return FORGOTTEN_REALMS_GROUPS;
  return LETTERS.map((letter) => [letter]);
}

function groupSuffix(group) {
  return group.join('');
}

function generateCorpus(corpus, tsvName) {
  const input = paths.assets(tsvName);
  console.log(`Reading ${input}`);

  const { rows } = readTsv(input, { normalizeHeaders: 'lower' });
  const books = rows.map(rowToBook).filter((b) => b.name.length > 0);

  const manifest = [];
  const sourcemapEntries = [];
  cleanCorpusOutputs(corpus);

  // Single shard until corpus is large enough to split by letter (content-pipeline)
  if (books.length === 0) {
    const name = `${corpus}_all`;
    const file = `${OUT_DIR}/${name}.gvar.json`;
    writeJsonGvar(paths.gvar(file), []);
    manifest.push({ name, file, count: 0 });
    return { manifest, sourcemapEntries, total: 0 };
  }

  if (books.length < LETTER_SHARD_THRESHOLD) {
    const name = `${corpus}_all`;
    const file = `${OUT_DIR}/${name}.gvar.json`;
    writeJsonGvar(paths.gvar(file), books);
    manifest.push({ name, file, count: books.length });
    sourcemapEntries.push({ name, file });
    return { manifest, sourcemapEntries, total: books.length };
  }

  for (const group of shardGroups(corpus)) {
    const name = `${corpus}_${groupSuffix(group)}`;
    const file = `${OUT_DIR}/${name}.gvar.json`;
    const contents = books.filter((b) => group.includes(letterFromName(b.name)));
    writeJsonGvar(paths.gvar(file), contents);
    manifest.push({ name, file, count: contents.length });
    if (contents.length > 0) sourcemapEntries.push({ name, file });
  }

  return { manifest, sourcemapEntries, total: books.length };
}

const forgottenRealms = generateCorpus('forgotten_realms', 'books-forgotten-realms.tsv');
const real = generateCorpus('real', 'books-real.tsv');

printManifest('Books (forgotten realms)', forgottenRealms.manifest);
console.log(`  (${forgottenRealms.total} total forgotten realms rows)`);
printManifest('Books (real)', real.manifest);
console.log(`  (${real.total} total real rows)`);
const { added, skipped } = ensureShardSlots(forgottenRealms.sourcemapEntries);
console.log(`Sourcemap: ${added} slot(s) added, ${skipped} already registered.`);
console.log('Books done.');
