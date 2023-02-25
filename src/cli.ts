#!/usr/bin/env node

/* eslint-disable no-console */
import * as fs from 'fs';
import { resolve } from 'path';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { discoverModules } from './modules';
import { lint } from './lint';
import { renderResultsConsole } from './utils/console-renderer';
import { loadBaseConfig } from './config/config-resolver';
import { RuleResult } from './types/RuleResult';
import { FixResult, FixType } from './types/FixResult';

const run = async (processArgs: string[]): Promise<number> => {
  const args = yargs(hideBin(processArgs))
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
      alias: 'x',
      type: 'boolean',
      description: "Try to fix failed checks automatically by changing files. Defaults to 'false'",
      default: false,
    })
    .option('filter', {
      alias: 'f',
      type: 'string',
      description: 'Regex expression for filtering results by resource name',
      default: '',
    });

  const argv = args.parseSync();

  if (!fs.existsSync(argv.baseDir)) {
    console.log(`Monorepo basedir ${argv.baseDir} not found`);
    return 1;
  }

  if (argv._[0]) {
    console.log(await args.getHelp());
    return 1;
  }

  let { baseDir } = argv;
  if (baseDir.endsWith('/')) {
    baseDir = baseDir.substring(0, baseDir.length - 1);
  }
  baseDir = resolve(baseDir);

  if (argv.verbose) {
    console.log(`Running with ${JSON.stringify(argv)}`);
  }

  const fixed = new Map<string, FixResult>();
  // run linter and possibly fix issues
  let results: RuleResult[] = [];

  // one fix can cause other issues, so run this a bunch of times to check it
  for (let i = 0; i < 10; i += 1) {
    if (argv.verbose) {
      console.log('Checking rules...');
    }

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
    const rrr = rr;
    const frkey = `${rr.rule}:${rr.resource}`;
    const fr = fixed.get(frkey);
    if (fr) {
      rrr.fixResult = fr;
      if (rrr.fixResult.type === FixType.Fixed) {
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

  let fresults = results;
  const { filter } = argv;
  if (filter) {
    const fregex = new RegExp(filter);
    fresults = results.filter((rr: RuleResult): boolean => {
      const rres = fregex.exec(rr.resource);
      return rres !== null;
    });
  }

  const exitCode = renderResultsConsole(fresults, argv.verbose, fixCount);
  return exitCode;
};

export { run };
