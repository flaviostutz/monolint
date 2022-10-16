
import fg from 'fast-glob';

import { RuleResult } from './types/RuleResult';
import { Module } from './types/Module';
import { Config } from './types/Config';
// when these rules are imported, they are registered in registry
import r1 from './rules/serverless-same-name';
import { register, enabledRules } from './rules/registry';

const lint = (config:Config):RuleResult[] => {

  const modules = discoverModules(config);
  console.debug(`Modules found: ${JSON.stringify(modules)}`);

  register(r1);

  const erules = enabledRules(config);

  const results:RuleResult[] = [];
  erules.forEach((rule) => {
    console.log(`Running rule '${rule.name}'...`);
    const result = rule.check(config, modules);
    result.forEach((ruleResult) => {
      ruleResult.rule = rule.name;
      results.push(ruleResult);
    });
  });

  return results;
};

const discoverModules = (config:Config):Module[] => {
  const patterns:string[] = [];
  config['module-markers'].forEach((elem) => {
    patterns.push(`${config['base-dir']}/**/${elem}`);
  });

  const entries = fg.sync(
    patterns, { dot: true },
  );

  const paths:string[] = [];
  const modules:Module[] = [];
  entries.forEach((elem) => {
    const baseModulePath = elem.substring(0, elem.lastIndexOf("/"));
    const moduleName = baseModulePath.substring(baseModulePath.lastIndexOf("/") + 1, elem.lastIndexOf("/"));
    if (paths.includes(baseModulePath)) {
      return;
    }
    paths.push(baseModulePath);
    modules.push({
      path: baseModulePath,
      name: moduleName,
    });
  });
  return modules;
};

export { lint, discoverModules };
