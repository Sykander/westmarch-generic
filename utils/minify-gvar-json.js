const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const gvarsRoot = join(root, 'src', 'gvars');
const suffix = '.gvar.json';

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(path));
    } else if (entry.isFile() && entry.name.endsWith(suffix)) {
      files.push(path);
    }
  }

  return files;
}

function minify(file) {
  const before = readFileSync(file, 'utf8');
  const after = JSON.stringify(JSON.parse(before));

  if (before !== after) {
    writeFileSync(file, after, 'utf8');
  }

  return {
    changed: before !== after,
    before: before.length,
    after: after.length,
  };
}

let changed = 0;
let saved = 0;

for (const file of walk(gvarsRoot)) {
  const result = minify(file);
  if (result.changed) {
    changed += 1;
    saved += result.before - result.after;
  }
}

console.log(`Minified ${changed} ${suffix} files, saved ${saved} bytes.`);
