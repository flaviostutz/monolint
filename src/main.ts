import * as fs from 'fs';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { Config } from './types/Config';
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
const defaultConfig = {
  'base-dir': argv.baseDir,
  'module-markers': ['package.json', 'serverless.yml'],
  rules: {
    'serverless-same-name': true,
  },
};

if (!fs.existsSync(cfile)) {
  console.log(`File ".monolinter.json" not found in dir "${argv.rootDir}"`);
}

console.debug('Reading .monolinter.json');
const cf = fs.readFileSync(cfile);
const loadedConfig = JSON.parse(cf.toString());

const mergedRules = { ...defaultConfig.rules, ...loadedConfig.rules };
const config = <Config>{ ...defaultConfig, ...loadedConfig };
config.rules = mergedRules;
console.debug(`Using config ${JSON.stringify(config)}`);

const results = lint(config);

console.log(``);
console.log(`Results:`);
console.log(`${JSON.stringify(results)}`);

// yconfig.parse();

