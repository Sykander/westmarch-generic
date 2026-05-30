const { readFileSync } = require('fs');

const DELIM = '\t';

/**
 * Parse a TSV file into an array of row objects (keys from header row).
 * @param {string} filePath
 * @param {{ normalizeHeaders?: 'lower' | 'preserve' }} [options]
 */
function readTsv(filePath, options = {}) {
  const { normalizeHeaders = 'preserve' } = options;
  const raw = readFileSync(filePath, 'utf8');
  let lines = raw.split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === '') {
    lines = lines.slice(0, -1);
  }

  if (!lines.length) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0].split(DELIM).map((h) => {
    const cleaned = h.replace(/\r/g, '').trim();
    return normalizeHeaders === 'lower' ? cleaned.toLowerCase() : cleaned;
  });

  const rows = [];

  lines.slice(1).forEach((line, index) => {
    const lineNum = index + 2;
    const values = line.split(DELIM).map((v) => v.replace(/\r/g, ''));

    if (values.length === 1 && values[0] === '') return;

    if (values.length !== headers.length) {
      console.warn(
        `${filePath}:${lineNum}: expected ${headers.length} columns, got ${values.length} — skipping`,
      );
      return;
    }

    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    rows.push(row);
  });

  return { headers, rows };
}

module.exports = { readTsv, DELIM };
