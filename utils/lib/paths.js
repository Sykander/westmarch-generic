const { join } = require('path');

const ROOT = join(__dirname, '..', '..');

const paths = {
  root: ROOT,
  assets: (name) => join(ROOT, 'assets', name),
  gvar: (rel) => join(ROOT, rel),
  sourcemapDev: join(ROOT, 'utils', 'sourcemap.dev.json'),
  sourcemapProd: join(ROOT, 'utils', 'sourcemap.prod.json'),
};

module.exports = paths;
