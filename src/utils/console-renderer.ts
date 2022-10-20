import chalk from 'chalk';

import { RuleResult } from '../types/RuleResult';

type ResourceResult = {
    resource: string,
    valid: boolean,
    ruleResults: RuleResult[],
}

const groupByResource = (ruleResults:RuleResult[]):ResourceResult[] => {

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
  const resourceList:ResourceResult[] = [];

  resourceResults.forEach((resResults: RuleResult[], res: string) => {
    // verify if all tests around this resoure were successfull
    let resValid = true;
    for (let j = 0; j < resResults.length; j += 1) {
      const rr = resResults[0];
      if (!rr.valid) {
        resValid = false;
      }
    }

    // verify

    resourceList.push({
      resource: res,
      valid: resValid,
      ruleResults: resResults,
    });
  });

  return resourceList;
};

const renderResultsConsole = (ruleResults:RuleResult[], verbose:boolean):void => {
  console.log('');

  const byRes = groupByResource(ruleResults);
  const ordByRes = byRes.sort((aa, bb) => {
    if (aa.valid === bb.valid) {
      if (aa.resource < bb.resource) { return 1; }
      if (aa.resource > bb.resource) { return -1; }
      return 0;
    }
    if (aa.valid) { return 1; }
    return -1;
  });


  const successRes = ordByRes.filter((rr) => {
    return rr.valid;
  });

  const failRes = ordByRes.filter((rr) => {
    return !rr.valid;
  });

  if (verbose) {
    successRes.forEach((rr) => {
      console.log(`${chalk.underline(rr.resource)}`);
      rr.ruleResults.forEach((ruleResult) => {
        console.log(`  ${chalk.green('success')} ${ruleResult.message} ${chalk.grey(ruleResult.rule)}`);
      });
      console.log('');
    });
  }

  failRes.forEach((rr) => {
    console.log(`${chalk.underline(rr.resource)}`);
    rr.ruleResults.forEach((ruleResult) => {
      console.log(`  ${chalk.red('error')} ${ruleResult.message} ${chalk.grey(ruleResult.rule)}`);
    });
    console.log('');
  });

  if (verbose) {
    console.log(`${chalk.bold.green('✓')} ${chalk.bold.green(successRes.length)} ${chalk.bold.green('checks successful')}`);
  }

  console.log(`${chalk.bold.red('✖')} ${chalk.bold.red(failRes.length)} ${chalk.bold.red('problems found')}`);

  if (failRes.length > 0) {
    process.exit(1);
  }
};

export { groupByResource, renderResultsConsole };
