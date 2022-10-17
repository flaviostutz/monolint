import * as fs from 'fs';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

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
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Config file. Defaults to \'.monolinter.json\'',
    default: '.monolinter.json',
  })
.parseSync();

if (!argv.verbose) {
    // console.debug = () => {};
}

if (!fs.existsSync(argv.baseDir)) {
  console.log(`Monorepo basedir ${argv.baseDir} not found`);
  process.exit(1);
}

const results = lint(argv.baseDir, argv.config);

console.log(``);
console.log(`Results:`);
const presults = results.map((rr) => {
  return { resource: rr.resource, valid: rr.valid, message: rr.message, module: rr.module?.name };
});
presults.forEach((pr) => {
  console.log(`- ${JSON.stringify(pr)}`);
});

