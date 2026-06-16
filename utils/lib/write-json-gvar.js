const { writeFileSync, mkdirSync } = require('fs');
const { dirname } = require('path');

/**
 * Write a catalogue shard — raw JSON array body (westmarch convention).
 * @param {string} filePath absolute or repo-relative path
 * @param {unknown[]} rows
 * @param {{ pretty?: boolean }} [options]
 */
function writeJsonGvar(filePath, rows, options = {}) {
  const { pretty = false } = options;
  mkdirSync(dirname(filePath), { recursive: true });
  const body = pretty ? `${JSON.stringify(rows, null, 2)}\n` : JSON.stringify(rows);
  writeFileSync(filePath, body, 'utf8');
}

module.exports = { writeJsonGvar };
