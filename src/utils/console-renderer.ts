/* eslint-disable no-console */
import chalk from 'chalk';

import { FixType } from '../types/FixResult';
import { RuleResult } from '../types/RuleResult';

type ResourceResult = {
  resource: string;
  valid: boolean;
  ruleResults: RuleResult[];
};

const groupByResource = (ruleResults: RuleResult[]): ResourceResult[] => {
  // group results by resource
  const resourceResults = new Map<string, RuleResult[]>();
  for (let i = 0; i < ruleResults.length; i += 1) {
    const ruleResult = ruleResults[i];
    let rr = resourceResults.get(ruleResult.resource);
    if (rr) {
      rr.push(ruleResult);
    } else {
      rr = [ruleResult];
    }
    resourceResults.set(ruleResult.resource, rr);
  }

  // check each resource if pass or fail
  const resourceList: ResourceResult[] = [];

  resourceResults.forEach((resResults: RuleResult[], res: string) => {
    const invalids = resResults.filter((rr) => !rr.valid);
    resourceList.push({
      resource: res,
      valid: invalids.length === 0,
      ruleResults: resResults,
    });
  });

  return resourceList;
};

const renderResultsConsole = (
  ruleResults: RuleResult[],
  verbose: boolean,
  fixCount: number,
): number => {
  console.log('');

  const byRes = groupByResource(ruleResults);
  const ordByRes = byRes.sort((aa, bb) => {
    if (aa.resource < bb.resource) {
      return -1;
    }
    return 1;
  });

  if (verbose) {
    const successRes = byRes.filter((rr) => rr.valid);
    successRes.forEach((rr) => {
      console.log(`${chalk.underline(relativePath(rr.resource))}`);
      rr.ruleResults.forEach((ruleResult) => {
        let fixMessage = '';
        if (ruleResult.fixResult && ruleResult.fixResult.type === FixType.Fixed) {
          fixMessage = chalk.dim.yellow('fixed');
        }
        console.log(
          `  ${chalk.green('success')} ${relativePath(ruleResult.message)} ${chalk.grey(
            ruleResult.rule,
          )} ${fixMessage}`,
        );
      });
      console.log('');
    });
  }

  const failRes = ordByRes.filter((rr) => !rr.valid);

  let fixableProblems = 0;
  failRes.forEach((rr) => {
    console.log(`${chalk.underline(relativePath(rr.resource))}`);
    const sortRuleResults = rr.ruleResults.sort((aa, bb) => {
      if (aa.valid && !bb.valid) {
        return -1;
      }
      return 1;
    });
    sortRuleResults.forEach((ruleResult) => {
      if (ruleResult.valid) {
        if (verbose) {
          let fixMessage = '';
          if (ruleResult.fixResult && ruleResult.fixResult.type === FixType.Fixed) {
            fixMessage = chalk.dim.yellow('fixed');
          }
          console.log(
            `  ${chalk.green('success')} ${relativePath(ruleResult.message)} ${chalk.grey(
              ruleResult.rule,
            )} ${fixMessage}`,
          );
        }
      } else {
        let fixmsg = '';
        if (ruleResult.fixResult && ruleResult.fixResult.type === FixType.Possible) {
          fixableProblems += 1;
          fixmsg = chalk.dim.yellow('fixable');
        }
        console.log(
          `  ${chalk.red('error')} ${relativePath(ruleResult.message)} ${chalk.grey(
            ruleResult.rule,
          )} ${fixmsg}`,
        );
        if (
          verbose &&
          ruleResult.fixResult &&
          ruleResult.fixResult.type === FixType.Possible &&
          relativePath(ruleResult.fixResult.message)
        ) {
          console.log(`  ${chalk.grey(relativePath(ruleResult.fixResult.message))}`);
        }
      }
    });
    console.log('');
  });

  if (verbose) {
    const successc = ruleResults.filter((rr) => rr.valid).length;
    console.log(
      `${chalk.bold.green('✓')} ${chalk.bold.green(successc)} ${chalk.bold.green(
        'checks successful',
      )}`,
    );
  }

  const failc = ruleResults.filter((rr) => !rr.valid).length;
  let fixMessage = '';
  if (fixableProblems > 0) {
    fixMessage = chalk.dim.yellow(`(${fixableProblems} fixable)`);
  }
  if (fixCount > 0) {
    fixMessage = chalk.yellow(`(${fixCount} fixed)`);
  }
  console.log(
    `${chalk.bold.red('✖')} ${chalk.bold.red(failc)} ${chalk.bold.red(
      'problems found',
    )} ${fixMessage}`,
  );

  if (failRes.length > 0) {
    return 2;
  }

  return 0;
};

const relativePath = (message?: string): string | undefined => {
  if (!message) {
    return message;
  }
  return message.replace(`${process.cwd()}/`, '');
};

export { groupByResource, renderResultsConsole };
