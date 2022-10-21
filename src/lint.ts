import fs from 'fs';

import fg from 'fast-glob';

import { RuleResult } from './types/RuleResult';
import { Module } from './types/Module';
import { Config } from './types/Config';
import { RuleConfig } from './types/RuleConfig';
import { mergeConfigs, validateConfig, loadBaseConfig } from './utils/config';
import { loadIgnorePatterns } from './utils/ignorefile';
// when registry is imported, all rules are registered at bootstrap
import { allRules, enabledRules } from './rules/registry';

const lint = (baseDir: string, configFile: string | null): RuleResult[] => {
  const baseConfig = loadBaseConfig(baseDir, configFile);
  const results: RuleResult[] = [];

  // check generic rules
  // Checking base rules (outside modules)
  const erules = enabledRules(baseConfig);
  for (let i = 0; i < erules.length; i += 1) {
    const rule = erules[i];
    const ruleResults = rule.check(baseDir, baseConfig);
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
  const modules = discoverModules(baseDir, baseConfig);

  // gather all modules for which a certain rule is enabled
  // Checking rules against modules
  for (let i = 0; i < allRules.length; i += 1) {
    const rule = allRules[i];
    const ruleModules: Module[] = modules.filter((module) => {
      return rule.name in module.enabledRules;
    });

    try {
      const ruleResults = rule.checkModules(ruleModules, baseDir);
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

const discoverModules = (baseDir: string, baseConfig: Config): Module[] => {
  const patterns: string[] = [];
  const markers = baseConfig['module-markers'];
  if (!markers) {
    throw new Error('Base config should have "module-markers" config');
  }

  markers.forEach((elem) => {
    patterns.push(`${baseDir}/**/${elem}`);
  });

  const ignorePatterns = loadIgnorePatterns(baseDir);

  const entries = fg.sync(patterns, {
    dot: true,
    ignore: ignorePatterns,
    globstar: true,
    extglob: true,
  });

  const paths: string[] = [];
  const modules: Module[] = [];

  for (let i = 0; i < entries.length; i += 1) {
    const elem = entries[i];

    const baseModulePath = elem.substring(0, elem.lastIndexOf('/'));
    const moduleName = baseModulePath.substring(
      baseModulePath.lastIndexOf('/') + 1,
      elem.lastIndexOf('/'),
    );

    // check if this module was already added before
    if (paths.includes(baseModulePath)) {
      continue;
    }
    paths.push(baseModulePath);

    // // iterate over module path hierarchy
    const modulePaths = baseModulePath.split('/');
    let path = '';

    let moduleConfig = baseConfig;

    // iterate over path parts of the module for creating a merged config
    for (let j = 0; j < modulePaths.length; j += 1) {
      const pathPart = modulePaths[j];

      if (path.length === 0) {
        path = `${pathPart}`;
      } else {
        path = `${path}/${pathPart}`;
      }

      // only evaluate files one level deeper in the monorepo
      if (path.length < baseDir.length || path === baseDir) {
        continue;
      }

      // calculate merged config by looking at the module path hierarchy
      const configFile2 = `${path}/.monolint.json`;
      if (fs.existsSync(configFile2)) {
        const cf = fs.readFileSync(configFile2);
        try {
          const loadedConfig = JSON.parse(cf.toString());
          if (loadedConfig['module-markers']) {
            throw new Error("'module-markers' is only valid on monorepo root level configuration");
          }
          moduleConfig = mergeConfigs(moduleConfig, loadedConfig);
          validateConfig(moduleConfig);
        } catch (err) {
          throw new Error(`Error loading ${configFile2}. err=${err}`);
        }
      }
    }

    const erules = enabledRules(moduleConfig);
    const ruleConfigs: Record<string, RuleConfig> = {};
    for (let j = 0; j < erules.length; j += 1) {
      const erule = erules[j];
      if (!moduleConfig.rules) {
        throw new Error('Rules not found in config');
      }
      const moduleRuleConfig = moduleConfig.rules[erule.name];
      ruleConfigs[erule.name] = { rule: erules[j], ruleConfig: moduleRuleConfig };
    }

    modules.push({
      path: baseModulePath,
      name: moduleName,
      config: moduleConfig,
      enabledRules: ruleConfigs,
    });
  }

  // sort by module name ascending to make it previsible and easier to create
  // newer modules for tests without breaking existing tests and to debug in general
  modules.sort((aa, bb) => {
    if (bb.name > aa.name) {
      return -1;
    }
    if (bb.name < aa.name) {
      return 1;
    }
    // if name is the same, untie by path
    if (bb.path > aa.path) {
      return -1;
    }
    if (bb.path < aa.path) {
      return 1;
    }
    return 0;
  });

  return modules;
};

export { lint, discoverModules };
