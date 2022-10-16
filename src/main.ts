import * as fs from 'fs';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { Config } from './types/Config';
import { mergeConfigs } from './utils';
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
    description: 'Monorepo base dir',
    default: '.',
  })
.parseSync();

if (!argv.verbose) {
    // console.debug = () => {};
}

if (!fs.existsSync(argv.baseDir)) {
  console.log(`Monorepo basedir ${argv.baseDir} not found`);
  process.exit(1);
}

const cfile = `${argv.baseDir}/.monolinter.json`;

let baseConfig = <Config>defaultConfig;

if (fs.existsSync(cfile)) {
  const cf = fs.readFileSync(cfile);
  const loadedConfig = JSON.parse(cf.toString());
  baseConfig = mergeConfigs(defaultConfig, loadedConfig);

} else {
  console.info(`File ".monolinter.json" not found in dir "${argv.baseDir}". Using default configurations`);
}

console.debug(`Base config=${JSON.stringify(baseConfig)}`);

const results = lint(argv.baseDir, baseConfig);

console.log(``);
console.log(`Results:`);
const presults = results.map((rr) => {
  return { resource: rr.resource, valid: rr.valid, message: rr.message, module: rr.module?.name };
});
presults.forEach((pr) => {
  console.log(`- ${JSON.stringify(pr)}`);
});

