import * as fs from 'fs';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { mergeConfigs } from './config';
import defaultConfig from './defaultConfig.json';
import { lint } from './lint';


const argv = yargs(hideBin(process.argv))
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
    default: false,
  })
  .option('base-dir', {
    alias: 'r',
    type: 'string',
    description: 'Monorepo root dir',
    default: '.',
  })
.parseSync();

if (!argv.verbose) {
    // console.debug = () => {};
}

const cfile = `${argv.baseDir}/.monolinter.json`;

if (!fs.existsSync(cfile)) {
  console.log(`File ".monolinter.json" not found in dir "${argv.rootDir}"`);
  process.exit(1);
}

const cf = fs.readFileSync(cfile);
const loadedConfig = JSON.parse(cf.toString());
const baseConfig = mergeConfigs(defaultConfig, loadedConfig);

console.debug(`Base config=${JSON.stringify(baseConfig)}`);

const results = lint(argv.baseDir, baseConfig);

console.log(``);
console.log(`Results:`);
const presults = results.map((rr) => {
  return { module: rr.module?.name, resource: rr.resource, valid: rr.valid };
});
presults.forEach((pr) => {
  console.log(`-${JSON.stringify(pr)}`);
});

