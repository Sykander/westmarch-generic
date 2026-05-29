/**
 * This script takes the gvars listed in the sourcemap
 * and quickly converts them all into a dictionary for use in the
 * var file
 */
const { readFileSync, writeFileSync } = require('fs');
const prodSourceMap = require('./sourcemap.prod.json');
const devSourceMap = require('./sourcemap.dev.json');

const environmentToUpdate =
  process.env.ENVIRONMENT === 'Production' ? 'Production' : 'Development';

console.log(`${environmentToUpdate} starting update of var file.`);

const varFile = '.varfile.json';

const { gvars } =
  environmentToUpdate === 'Production' ? prodSourceMap : devSourceMap;

const varDict = gvars.reduce((acc, { file, id }) => {
  acc[id] = { filePath: file };
  return acc;
}, {});

const newVarFileContents = JSON.stringify({ gvars: varDict }, null, 4);
writeFileSync(varFile, newVarFileContents);

console.log(`${environmentToUpdate} var file updated.`);
