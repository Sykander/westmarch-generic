/**
 * Group rows into shards keyed by string.
 * @template T
 * @param {T[]} rows
 * @param {(row: T) => string} keyFn
 * @returns {Map<string, T[]>}
 */
function shardBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
}

/** a–z shard keys for monster/book name indexing */
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

function letterFromName(name) {
  const first = String(name || '')
    .trim()
    .toLowerCase()[0];
  return first && first >= 'a' && first <= 'z' ? first : null;
}

module.exports = { shardBy, LETTERS, letterFromName };
