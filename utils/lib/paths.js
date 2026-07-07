const { join } = require('path');

const ROOT = join(__dirname, '..', '..');

const paths = {
  root: ROOT,
  assets: (name) => join(ROOT, 'assets', name),
  gvar: (rel) => join(ROOT, rel),
};

module.exports = paths;
