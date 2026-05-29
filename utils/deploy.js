const { deploy } = require('publish-avrae');
const prodSourceMap = require('./sourcemap.prod.json');
const devSourceMap = require('./sourcemap.dev.json');

const sourceMap =
  process.env.ENVIRONMENT === 'Production' ? prodSourceMap : devSourceMap;

console.log('Starting Deployment');
deploy(sourceMap)
  .then(() => console.log('Deployment Sucessful'))
  .catch((e) => {
    console.error(e);
    console.log('Deployment Failed');
    process.exit(1);
  });
