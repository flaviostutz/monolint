import * as fs from 'fs';

import { Config } from '../types/Config';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';

const rule = {
  name: 'serverless-same-name',
  check: (config:Config, modules:Module[]):RuleResult[] => {
    const results:RuleResult[] = [];

    modules.forEach((module) => {
      const packageFile = `${module.path}/package.json`;
      if (fs.existsSync(packageFile)) {
        console.debug(`Checking ${packageFile}`);
        const cf = fs.readFileSync(packageFile);
        try {
          const loadedPackage = JSON.parse(cf.toString());
          if (loadedPackage.name !== module.name) {
            results.push({
              valid: false,
              resource: packageFile,
              message: `"name" must be "${module.name}"`,
            });
          }
        } catch (err) {
          results.push({
            valid: false,
            resource: packageFile,
            message: `Couldn't load file`,
          });
        }
      }
    });

    return results;
  },
};

export default rule;
