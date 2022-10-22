import * as fs from 'fs';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
import { ConfigPackageJsonSameName } from '../types/Config';

const rule: Rule = {
  name: 'packagejson-same-name',

  checkModules: (modules: Module[]): RuleResult[] | null => {
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
        if (!(<string>loadedPackage.name).endsWith(module.name)) {
          results.push({
            valid: false,
            resource: packageFile,
            message: `Attribute 'name' should be '${module.name}'`,
            rule: rule.name,
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
