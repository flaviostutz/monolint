import * as fs from 'fs';

import yaml from 'js-yaml';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';

const rule:Rule = {
  name: 'serverless-same-name',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    const results: RuleResult[] = [];

    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];

      const slsFile = `${module.path}/serverless.yml`;
      if (!fs.existsSync(slsFile)) {
        continue;
      }
      // console.debug(`Checking ${slsFile}`);
      try {
        const cf = fs.readFileSync(slsFile, 'utf8');
        const loadedSls = <any>yaml.load(cf);
        if (!(<string>loadedSls.service).endsWith(module.name)) {
          results.push({
            valid: false,
            resource: slsFile,
            message: `Attribute 'service' should be '${module.name}'`,
            rule: rule.name,
            module,
          });
          continue;
        }
        results.push({
          valid: true,
          resource: slsFile,
          message: '"service" is valid',
          rule: rule.name,
          module,
        });
      } catch (err) {
        results.push({
          valid: false,
          resource: slsFile,
          message: 'Couldn\'t load file',
          rule: rule.name,
          module,
        });
        continue;
      }
    }
    return results;
  },
  check(): RuleResult[] | null {
    return null;
  },
  docMarkdown(): string {
    return '* Check if "service" attribute of the serverless.yml file equals (or ends with) the name of the module';
  },
  docExampleConfigs(): RuleExample[] {
    return [
      {
        description: 'Deactivates this rule',
        config: false,
      }];
  },
};

export default rule;
