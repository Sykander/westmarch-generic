#!/usr/bin/env node
/**
 * Generate book shards from books-fiction.tsv and books-real.tsv
 * Output: src/gvars/catalogues/books/{fiction,real}_{a-z}.gvar
 */
const paths = require('./lib/paths');
const { readTsv } = require('./lib/read-tsv');
const { writeJsonGvar } = require('./lib/write-json-gvar');
const { LETTERS, letterFromName } = require('./lib/shard-by');
const { printManifest } = require('./lib/manifest');
const { ensureShardSlots } = require('./lib/sourcemap-shards');

function parseTags(s) {
  return String(s || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function rowToBook(row) {
  const name = String(row.name ?? '').trim();
  const type = String(row.type ?? 'original').trim().toLowerCase();
  const readRaw = String(row.read_bonus ?? '0').trim();
  const read_bonus = Number.parseInt(readRaw, 10);

  const book = {
    name,
    author: String(row.author ?? '').trim(),
    written: String(row.written ?? '').trim(),
    rarity: String(row.rarity ?? 'common').trim().toLowerCase(),
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

  return book;
}

function generateCorpus(corpus, tsvName) {
  const input = paths.assets(tsvName);
  console.log(`Reading ${input}`);

  const { rows } = readTsv(input, { normalizeHeaders: 'lower' });
  const books = rows.map(rowToBook).filter((b) => b.name.length > 0);

  const manifest = [];
  const sourcemapEntries = [];

  // Single shard until corpus is large enough to split by letter (content-pipeline)
  if (books.length === 0) {
    const name = `${corpus}_all`;
    const file = `src/gvars/catalogues/books/${name}.gvar`;
    writeJsonGvar(paths.gvar(file), []);
    manifest.push({ name, file, count: 0 });
    sourcemapEntries.push({ name, file });
    return { manifest, sourcemapEntries, total: 0 };
  }

  for (const letter of LETTERS) {
    const name = `${corpus}_${letter}`;
    const file = `src/gvars/catalogues/books/${name}.gvar`;
    const contents = books.filter((b) => letterFromName(b.name) === letter);
    writeJsonGvar(paths.gvar(file), contents);
    manifest.push({ name, file, count: contents.length });
    sourcemapEntries.push({ name, file });
  }

  return { manifest, sourcemapEntries, total: books.length };
}

const fiction = generateCorpus('fiction', 'books-fiction.tsv');
const real = generateCorpus('real', 'books-real.tsv');

printManifest('Books (fiction)', fiction.manifest);
console.log(`  (${fiction.total} total fiction rows)`);
printManifest('Books (real)', real.manifest);
console.log(`  (${real.total} total real rows)`);

const allEntries = [...fiction.sourcemapEntries, ...real.sourcemapEntries];
const { added, skipped } = ensureShardSlots(allEntries);
console.log(`Sourcemap: ${added} slot(s) added, ${skipped} already registered.`);
console.log('Books done.');
