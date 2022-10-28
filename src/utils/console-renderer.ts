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

const renderResultsConsole = (ruleResults: RuleResult[], verbose: boolean): void => {
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
      console.log(`${chalk.underline(rr.resource)}`);
      rr.ruleResults.forEach((ruleResult) => {
        let fixMessage = '';
        if (ruleResult.fixResult?.type === FixType.Fixed) {
          fixMessage = chalk.dim.yellow('fixed');
        }
        console.log(
          `  ${chalk.green('success')} ${ruleResult.message} ${chalk.grey(
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
    console.log(`${chalk.underline(rr.resource)}`);
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
          if (ruleResult.fixResult?.type === FixType.Fixed) {
            fixMessage = chalk.dim.yellow('fixed');
          }
          console.log(
            `  ${chalk.green('success')} ${ruleResult.message} ${chalk.grey(
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
          `  ${chalk.red('error')} ${ruleResult.message} ${chalk.grey(ruleResult.rule)} ${fixmsg}`,
        );
        if (
          verbose &&
          ruleResult.fixResult &&
          ruleResult.fixResult.type === FixType.Possible &&
          ruleResult.fixResult.message
        ) {
          console.log(`  ${chalk.grey(ruleResult.fixResult.message)}`);
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
  let fixableMessage = '';
  if (fixableProblems > 0) {
    fixableMessage = chalk.dim.yellow(`(${fixableProblems} fixable)`);
  }
  console.log(
    `${chalk.bold.red('✖')} ${chalk.bold.red(failc)} ${chalk.bold.red(
      'problems found',
    )} ${fixableMessage}`,
  );

  if (failRes.length > 0) {
    process.exit(1);
  }
};

export { groupByResource, renderResultsConsole };
