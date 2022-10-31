import * as fs from 'fs';

import { yamlParse } from 'yaml-cfn';
import jsonpointer from 'jsonpointer';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
import { FixType } from '../types/FixResult';

const rule: Rule = {
  name: 'serverless-same-name',

  checkModules: (modules: Module[], _: string, fix: boolean): RuleResult[] | null => {
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
        const loadedSls = yamlParse(cf);
        const service: string = jsonpointer.get(loadedSls, '/service');
        if (!service.endsWith(module.name)) {
          // will fix
          if (fix) {
            jsonpointer.set(loadedSls, '/service', module.name);
            fs.writeFileSync(slsFile, JSON.stringify(loadedSls, null, 2));
            results.push({
              valid: true,
              resource: slsFile,
              message: `Attribute 'service' should be '${module.name}'`,
              rule: rule.name,
              fixResult: { type: FixType.Fixed },
              module,
            });
            continue;
          }

          // won't fix
          results.push({
            valid: false,
            resource: slsFile,
            message: `Attribute 'service' should be '${module.name}'`,
            rule: rule.name,
            fixResult: { type: FixType.Possible },
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
          message: `Couldn't load yml file: ${err}`,
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
      },
    ];
  },
};

export default rule;
