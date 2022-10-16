import * as fs from 'fs';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';

const rule:Rule = {
  name: 'packagejson-same-name',

  checkModules: (modules: Module[]): RuleResult[]|null => {
    const results: RuleResult[] = [];

    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];

      let packageJsonFile = 'package.json';
      const trules = module.config.rules['packagejson-same-name'];
      if (typeof trules !== 'boolean') {
        if (trules['package-json-file']) {
          packageJsonFile = trules['package-json-file'];
        }
      }

      const packageFile = `${module.path}/${packageJsonFile}`;
      if (!fs.existsSync(packageFile)) {
        continue;
      }
      // console.debug(`Checking ${packageFile}`);
      try {
        const cf = fs.readFileSync(packageFile, 'utf8');
        const loadedPackage = JSON.parse(cf.toString());
        if (loadedPackage.name !== module.name) {
          results.push({
            valid: false,
            resource: packageFile,
            message: `"name" must be "${module.name}"`,
            rule: rule.name,
          });
          continue;
        }
        results.push({
          valid: true,
          resource: packageFile,
          message: '"name" is valid',
          rule: rule.name,
        });

      } catch (err) {
        results.push({
          valid: false,
          resource: packageFile,
          message: `Couldn't load file`,
          rule: rule.name,
        });
        continue;
      }
    }

    return results;
  },
  check(): RuleResult[]|null {
    return null;
  },
};

export default rule;
