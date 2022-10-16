import * as fs from 'fs';

import yaml from 'js-yaml';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';

const rule:Rule = {
  name: 'serverless-same-name',

  checkModule: (module: Module): RuleResult[]|null => {
    const results: RuleResult[] = [];

    const slsFile = `${module.path}/serverless.yml`;
    if (!fs.existsSync(slsFile)) {
      return null;
    }
    console.debug(`Checking ${slsFile}`);
    try {
      const cf = fs.readFileSync(slsFile, 'utf8');
      const loadedSls = <any>yaml.load(cf);
      if (loadedSls.service !== module.name) {
        results.push({
          valid: false,
          resource: slsFile,
          message: `"service" must be "${module.name}"`,
        });
        return results;
      }
      results.push({
        valid: true,
        resource: slsFile,
        message: '"service" is valid',
      });
    } catch (err) {
      results.push({
        valid: false,
        resource: slsFile,
        message: `Couldn't load file`,
      });
      return results;
    }
    return results;
  },
  check(): RuleResult[]|null {
    return null;
  },
};

export default rule;
