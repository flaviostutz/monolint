#!/usr/bin/env node

// eslint-disable-next-line node/shebang
import * as fs from 'fs';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { discoverModules } from './modules';
import { lint } from './lint';
import { renderResultsConsole } from './utils/console-renderer';
import { loadBaseConfig } from './config/config-resolver';
import { RuleResult } from './types/RuleResult';
import { FixResult, FixType } from './types/FixResult';

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
    description: "Config file. Defaults to '.monolint.json'",
    default: '.monolint.json',
  })
  .option('fix', {
    alias: 'f',
    type: 'boolean',
    description: "Try to fix failed checks automatically by changing files. Defaults to 'false'",
    default: false,
  })
  .parseSync();

if (!argv.verbose) {
  // console.debug = () => {};
}

if (!fs.existsSync(argv.baseDir)) {
  console.log(`Monorepo basedir ${argv.baseDir} not found`);
  process.exit(1);
}

let { baseDir } = argv;
if (baseDir.endsWith('/')) {
  baseDir = baseDir.substring(0, baseDir.length - 1);
}

try {
  const fixed = new Map<string, FixResult>();
  // run linter and possibly fix issues
  let results: RuleResult[] = [];

  // one fix can cause other issues, so run this a bunch of times to check it
  for (let i = 0; i < 10; i += 1) {
    // check rules and possibly fix issues
    results = lint(baseDir, argv.config, argv.fix);

    // keep track of previously fixed issues to show afterwards
    const withFixResult = results.filter((rr) => rr.fixResult);
    withFixResult.forEach((wfr) => {
      const frkey = `${wfr.rule}:${wfr.resource}`;
      if (wfr.fixResult && !fixed.get(frkey)) {
        fixed.set(frkey, wfr.fixResult);
      }
    });

    const pendingIssues = results.filter((rr) => !rr.valid);
    if (pendingIssues.length === 0) {
      break;
    }
    if (!argv.fix) {
      break;
    }
  }

  // restore first fix results found for each resource
  let fixCount = 0;
  results.forEach((rr) => {
    const frkey = `${rr.rule}:${rr.resource}`;
    const fr = fixed.get(frkey);
    if (fr) {
      rr.fixResult = fr;
      if (rr.fixResult.type === FixType.Fixed) {
        fixCount += 1;
      }
    }
  });

  // show results
  if (argv.verbose) {
    const baseConfig = loadBaseConfig(baseDir, argv.config);
    const modules = discoverModules(baseDir, baseConfig, argv.config);
    console.log(`Found ${modules.length} modules: ${modules.map((mm) => mm.path).toString()}`);
  }

  renderResultsConsole(results, argv.verbose, fixCount);
} catch (err) {
  const err1 = err as Error;
  if (!argv.verbose && err1.message) {
    console.log(`Error: ${err1.message}`);
  } else {
    throw err;
  }
}
