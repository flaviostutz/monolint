import fs from 'fs';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
import { Config, ConfigGhWorkflowModulePrefix } from '../types/Config';

const rule: Rule = {
  name: 'gh-workflow-module-prefix',

  checkModules: (modules: Module[], baseDir:boolean, fix:boolean, baseConfig: Config): RuleResult[] | null => {
    const ghBaseDir = `${baseDir}/.github/workflows`;
    let workflowFiles:string[] = [];

    if (fs.existsSync(ghBaseDir)) {
      workflowFiles = fs.readdirSync(ghBaseDir);
    }

    // check existing workflow file names
    const results = checkExistingWorkflowNames(ghBaseDir, baseConfig, workflowFiles, modules);

    // check required workflow files for each module
    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];
      const config = module.enabledRules['gh-workflow-module-prefix'].ruleConfig;

      const expConfig = expandConfig(config);

      if (!expConfig || !expConfig.required) {
        continue;
      }

      for (let j = 0; j < expConfig.suffixes.length; j += 1) {
        const suffix = expConfig.suffixes[j];
        const fnRegex = `^${module.name}.*${suffix}.yml$`;
        const fnRe = new RegExp(fnRegex);
        const requiredFile = `${ghBaseDir}/${module.name}${suffix}.yml`;

        let found = false;
        for (let aa = 0; aa < workflowFiles.length; aa += 1) {
          const wf = workflowFiles[aa];
          if (fnRe.test(wf)) {
            results.push({
              valid: true,
              resource: `${ghBaseDir}/${wf}`,
              message: 'Required gh workflow file found',
              rule: rule.name,
              module,
            });
            found = true;
            break;
          }
        }

        if (!found) {
          results.push({
            valid: false,
            resource: requiredFile,
            message: 'Missing required gh workflow file',
            rule: rule.name,
            module,
          });
        }
      }
    }

    return results;
  },
  check(): RuleResult[] | null {
    return null;
  },
  docMarkdown(): string {
    return '* ';
  },
  docExampleConfigs(): RuleExample[] {
    return [
      {
        description: '',
        config: true,
      },
      {
        description: 'Deactivates this rule',
        config: false,
      },
      {
        description: '',
        config: '',
      },
    ];
  },
};

const expandConfig = (
  config?: any,
): ConfigGhWorkflowModulePrefix | null => {

  // default values
  let econfig = {
    required: false,
    suffixes: [''],
  } as ConfigGhWorkflowModulePrefix;

  if (typeof config === 'boolean') {
    if (config) {
      return econfig;
    }
    return null;

  }

  const mconfig = config as ConfigGhWorkflowModulePrefix;
  econfig = { ...econfig, ...mconfig };

  return econfig;
};

const checkExistingWorkflowNames =
  (ghBaseDir:string,
    baseConfig:Config,
    workflowFiles:string[],
    modules:Module[]): RuleResult[] => {

    if (!baseConfig.rules) {
      return [];
    }
    const expConfig = expandConfig(baseConfig.rules['gh-workflow-module-prefix']);
    if (!expConfig) {
      return [];
    }

    const results:RuleResult[] = [];
    for (let aa = 0; aa < workflowFiles.length; aa += 1) {
      const wf = workflowFiles[aa];
      let found = false;
      let foundModule;
      let validSuffix = false;

      // check if name prefix is a module name
      for (let i = 0; i < modules.length; i += 1) {
        const module = modules[i];
        if (wf.startsWith(module.name)) {
          found = true;
          foundModule = module;
          // check if name suffix is one of the allowed
          for (let j = 0; j < expConfig.suffixes.length; j += 1) {
            if (expConfig.suffixes[j] === '' || wf.endsWith(`${expConfig.suffixes[j]}.yml`)) {
              validSuffix = true;
              break;
            }
          }
        }
      }

      if (!found) {
        results.push({
          valid: false,
          resource: `${ghBaseDir}/${wf}`,
          message: 'File should have the name of a module as prefix',
          rule: rule.name,
        });
        continue;
      }

      if (!validSuffix) {
        results.push({
          valid: false,
          resource: `${ghBaseDir}/${wf}`,
          message: `File name suffix should be one of ${expConfig.suffixes}`,
          rule: rule.name,
        });
        continue;
      }

      results.push({
        valid: true,
        resource: `${ghBaseDir}/${wf}`,
        message: 'Workflow file name is correct',
        rule: rule.name,
        module: foundModule,
      });
    }
    return results;
  };

export default rule;
