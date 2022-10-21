import chalk from 'chalk';

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
        console.log(
          `  ${chalk.green('success')} ${ruleResult.message} ${chalk.grey(ruleResult.rule)}`,
        );
      });
      console.log('');
    });
  }

  const failRes = ordByRes.filter((rr) => !rr.valid);

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
          console.log(
            `  ${chalk.green('success')} ${ruleResult.message} ${chalk.grey(ruleResult.rule)}`,
          );
        }
      } else {
        console.log(`  ${chalk.red('error')} ${ruleResult.message} ${chalk.grey(ruleResult.rule)}`);
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
  console.log(
    `${chalk.bold.red('✖')} ${chalk.bold.red(failc)} ${chalk.bold.red('problems found')}`,
  );

  if (failRes.length > 0) {
    process.exit(1);
  }
};

export { groupByResource, renderResultsConsole };
