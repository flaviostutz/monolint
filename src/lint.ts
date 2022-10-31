import fs from 'fs';

import { RuleResult } from './types/RuleResult';
import { Module } from './types/Module';
// when registry is imported, all rules are registered at bootstrap
import { allRules, enabledRules } from './rules/registry';
import { resolveModuleConfig } from './config/config-resolver';
import { discoverModules } from './modules';

const lint = (baseDir: string, configFileName: string, fix: boolean): RuleResult[] => {
  if (!fs.existsSync(baseDir)) {
    throw new Error(`base-dir '${baseDir}' doesn't exist`);
  }
  const baseConfig = resolveModuleConfig(baseDir, baseDir, configFileName);
  const results: RuleResult[] = [];

  // check generic rules
  // Checking base rules (outside modules)
  const erules = enabledRules(baseConfig);
  for (let i = 0; i < erules.length; i += 1) {
    const rule = erules[i];
    const ruleResults = rule.check(baseDir, baseConfig, fix);
    if (ruleResults === null) {
      continue;
    }
    for (let j = 0; j < ruleResults.length; j += 1) {
      const ruleResult = ruleResults[j];
      ruleResult.rule = rule.name;
      results.push(ruleResult);
    }
  }

  // check modules
  const modules = discoverModules(baseDir, baseConfig, configFileName);

  // gather all modules for which a certain rule is enabled
  // Checking rules against modules
  for (let i = 0; i < allRules.length; i += 1) {
    const rule = allRules[i];
    const ruleModules: Module[] = modules.filter((module) => {
      return rule.name in module.enabledRules;
    });

    try {
      const ruleResults = rule.checkModules(ruleModules, baseDir, fix);
      if (ruleResults === null) {
        continue;
      }
      for (let kk = 0; kk < ruleResults.length; kk += 1) {
        const ruleResult = ruleResults[kk];
        ruleResult.rule = rule.name;
        results.push(ruleResult);
      }
    } catch (err) {
      throw new Error(`Error checking rule ${rule.name}: ${err}`);
    }
  }

  results.sort((aa, bb) => {
    if (aa.module && bb.module) {
      if (bb.module.name > aa.module.name) {
        return -1;
      }
      if (bb.module.name < aa.module.name) {
        return 1;
      }
    }
    // if module is the same, untie by rule name
    if (bb.rule > aa.rule) {
      return -1;
    }
    if (bb.rule < aa.rule) {
      return 1;
    }
    // if rule is the same, untie by resource path
    if (bb.resource > aa.resource) {
      return -1;
    }
    if (bb.resource < aa.resource) {
      return 1;
    }
    return 0;
  });

  return results;
};

export { lint };
