#!/usr/bin/env node
/**
 * Generate book shards from books-forgotten-realms.tsv and books-real.tsv
 * Output: src/gvars/configs/books/{forgotten_realms,real}_{a-z}.gvar
 */
const paths = require('./lib/paths');
const { readTsv } = require('./lib/read-tsv');
const { writeJsonGvar } = require('./lib/write-json-gvar');
const { LETTERS, letterFromName } = require('./lib/shard-by');
const { printManifest } = require('./lib/manifest');

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

  const contentLink = String(row.content_link ?? '').trim();
  if (contentLink) book.content_link = contentLink;

  return book;
}

function generateCorpus(corpus, tsvName) {
  const input = paths.assets(tsvName);
  console.log(`Reading ${input}`);

  const { rows } = readTsv(input, { normalizeHeaders: 'lower' });
  const books = rows.map(rowToBook).filter((b) => b.name.length > 0);

  const manifest = [];
  const outDir = 'src/gvars/configs/books';

  // Single shard until corpus is large enough to split by letter (content-pipeline)
  if (books.length === 0) {
    const name = `${corpus}_all`;
    const file = `${outDir}/${name}.gvar`;
    writeJsonGvar(paths.gvar(file), []);
    manifest.push({ name, file, count: 0 });
    return { manifest, total: 0 };
  }

  const LETTER_SHARD_THRESHOLD = 100;
  if (books.length < LETTER_SHARD_THRESHOLD) {
    const name = `${corpus}_all`;
    const file = `${outDir}/${name}.gvar`;
    writeJsonGvar(paths.gvar(file), books);
    manifest.push({ name, file, count: books.length });
    return { manifest, total: books.length };
  }

  for (const letter of LETTERS) {
    const name = `${corpus}_${letter}`;
    const file = `${outDir}/${name}.gvar`;
    const contents = books.filter((b) => letterFromName(b.name) === letter);
    writeJsonGvar(paths.gvar(file), contents);
    manifest.push({ name, file, count: contents.length });
  }

  return { manifest, total: books.length };
}

const forgottenRealms = generateCorpus('forgotten_realms', 'books-forgotten-realms.tsv');
const real = generateCorpus('real', 'books-real.tsv');

printManifest('Books (forgotten realms)', forgottenRealms.manifest);
console.log(`  (${forgottenRealms.total} total forgotten realms rows)`);
printManifest('Books (real)', real.manifest);
console.log(`  (${real.total} total real rows)`);
console.log('Books done.');
