#!/usr/bin/env node
/**
 * Run all catalogue generators in dependency order.
 * Regenerate env after: npm run generate-env (or make rebuild).
 */
const { spawnSync } = require('child_process');
const { join } = require('path');

const ROOT = join(__dirname, '..');
const scripts = [
  'generate-monsters.js',
  'generate-items.js',
  'generate-spells.js',
  'generate-books.js',
  'generate-recipes.js',
];

for (const script of scripts) {
  console.log(`\n=== ${script} ===`);
  const result = spawnSync(process.execPath, [join(__dirname, script)], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\n=== All catalogues generated ===');
console.log('Run: make rebuild   # refresh env.*.gvar and .varfile.json');
