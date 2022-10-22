import fs from 'fs';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
import { ModuleRequiredFilesConfig } from '../types/ModuleRequiredFilesConfig';

const rule: Rule = {
  name: 'module-required-files',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    const results: RuleResult[] = [];

    for (const module of modules) {
      // first, get the rule reference from the module
      const { rules } = module.config;
      if (!rules || !rules['module-required-files']) {
        continue;
      }

      // get the config for this rule
      const requiredFileRuleConfig = rules['module-required-files'] as ModuleRequiredFilesConfig;

      // get the list of required files specified on .monolint.json
      const { files, strict } = requiredFileRuleConfig;
      if (files.length === 0) {
        continue;
      }

      // build the required file paths relative to module path
      const { path } = module;
      const requiredFilesPaths = files.map((file) => `${path}/${file}`);

      for (const requiredFilePath of requiredFilesPaths) {
        // check if the file exists
        const fileExists = fs.existsSync(requiredFilePath);
        if (fileExists) {
          results.push({
            valid: true,
            resource: requiredFilePath,
            message: 'Required file exists',
            rule: rule.name,
            module,
          });
        } else {
          results.push({
            valid: false,
            resource: requiredFilePath,
            message: 'Required file does not exist',
            rule: rule.name,
            module,
          });
        }
      }

      // check the strict mode
      if (strict) {
        // if strict mode is enabled, check if there are any files that are not required
        // read .gitignore files to ignore them on the strict mode
        const ignoredFiles: string[] = ['.monolint.json', '.gitignore'];
        if (fs.existsSync(`${path}/.gitignore`)) {
          const gitignore = fs.readFileSync(`${path}/.gitignore`, 'utf8');
          ignoredFiles.push(...gitignore.split('\n'));
        }

        fs.readdirSync(path).forEach((file) => {
          if (ignoredFiles.includes(file)) {
            return;
          }
          // if there are files in the folder that are not required, add a result as invalid
          if (!files.find((fileName) => fileName === file)) {
            results.push({
              valid: false,
              resource: `${path}/${file}`,
              message: 'File not required by rule in strict mode',
              rule: rule.name,
              module,
            });
          }
        });

      }
    }
    return results;
  },
  check(): RuleResult[] | null {
    return null;
  },
  docMarkdown(): string {
    return '* Check whether all the required files are present in the modules folders';
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
