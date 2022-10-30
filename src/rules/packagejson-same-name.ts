import * as fs from 'fs';

import jsonpointer from 'jsonpointer';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
import { ConfigPackageJsonSameName } from '../types/Config';
import { FixType } from '../types/FixResult';

const rule: Rule = {
  name: 'packagejson-same-name',

  checkModules: (modules: Module[], _: string, fix: boolean): RuleResult[] | null => {
    const results: RuleResult[] = [];

    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];

      let packageJsonFileToUse = 'package.json';
      if (!module.config.rules) {
        throw new Error('Config should have rules');
      }
      const trules = module.config.rules['packagejson-same-name'];
      if (typeof trules !== 'boolean') {
        const rulesAdvanced = trules as ConfigPackageJsonSameName;
        if (rulesAdvanced.packageJsonFile) {
          packageJsonFileToUse = rulesAdvanced.packageJsonFile;
        }
      }

      const packageFile = `${module.path}/${packageJsonFileToUse}`;
      if (!fs.existsSync(packageFile)) {
        continue;
      }

      try {
        const cf = fs.readFileSync(packageFile, 'utf8');
        const loadedPackage = JSON.parse(cf.toString());
        const name: string = jsonpointer.get(loadedPackage, '/name');
        if (!name.endsWith(module.name)) {
          // will fix
          if (fix) {
            jsonpointer.set(loadedPackage, '/name', module.name);
            fs.writeFileSync(packageFile, JSON.stringify(loadedPackage, null, 2));
            results.push({
              valid: true,
              resource: packageFile,
              message: `Attribute 'name' should be '${module.name}'`,
              rule: rule.name,
              fixResult: { type: FixType.Fixed },
              module,
            });
            continue;
          }

          // won't fix
          results.push({
            valid: false,
            resource: packageFile,
            message: `Attribute 'name' should be '${module.name}'`,
            rule: rule.name,
            fixResult: { type: FixType.Possible },
            module,
          });
          continue;
        }
        results.push({
          valid: true,
          resource: packageFile,
          message: '"name" is valid',
          rule: rule.name,
          module,
        });
      } catch (err) {
        results.push({
          valid: false,
          resource: packageFile,
          message: `Couldn't load json file: ${err}`,
          rule: rule.name,
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
    return '* Check if "name" attribute of the package.json file equals (or ends with) the name of the module';
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
