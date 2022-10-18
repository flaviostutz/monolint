#!/usr/bin/env node

// eslint-disable-next-line node/shebang
import * as fs from 'fs';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { lint } from './lint';
import { renderResultsConsole } from './utils/console-renderer';

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
    description: 'Config file. Defaults to \'.monolint.json\'',
    default: '.monolint.json',
  })
.parseSync();

if (!argv.verbose) {
    // console.debug = () => {};
}

if (!fs.existsSync(argv.baseDir)) {
  console.log(`Monorepo basedir ${argv.baseDir} not found`);
  process.exit(1);
}

// run linter
const results = lint(argv.baseDir, argv.config);

// show results
renderResultsConsole(results);
