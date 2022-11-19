import fg from 'fast-glob';

import { Module } from './types/Module';
import { Config } from './types/Config';
import { RuleConfig } from './types/RuleConfig';
import { loadIgnorePatterns } from './utils/ignorefile';
// when registry is imported, all rules are registered at bootstrap
import { enabledRules } from './rules/registry';
import { resolveModuleConfig } from './config/config-resolver';

const discoverModules = (baseDir: string, baseConfig: Config, configFileName: string): Module[] => {
  const patterns: string[] = [];

  const markers = baseConfig['module-markers'];
  if (!markers) {
    throw new Error('Base config should have "module-markers" config');
  }

  markers.forEach((elem) => {
    patterns.push(`${baseDir}/**/${elem}`);
  });

  let useGitIgnoreFile = false;
  if (baseConfig['use-gitignore']) {
    useGitIgnoreFile = baseConfig['use-gitignore'];
  }

  const ignorePatterns = loadIgnorePatterns(baseDir, useGitIgnoreFile);

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

    const modulePath = elem.substring(0, elem.lastIndexOf('/'));
    const moduleName = modulePath.substring(modulePath.lastIndexOf('/') + 1, elem.lastIndexOf('/'));

    // check if this module was already added before
    if (paths.includes(modulePath)) {
      continue;
    }
    paths.push(modulePath);

    const moduleConfig = resolveModuleConfig(modulePath, baseDir, configFileName);

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
      path: modulePath,
      name: moduleName,
      config: moduleConfig,
      enabledRules: ruleConfigs,
    });
  }

  // remove modules that aren't leaves (they have other modules inside them #55)
  const fmodules: Module[] = [];
  for (let aa = 0; aa < modules.length; aa += 1) {
    const candidateModule = modules[aa];
    let foundParent = false;
    for (let bb = 0; bb < modules.length; bb += 1) {
      const otherModule = modules[bb];
      if (otherModule.path !== candidateModule.path &&
        otherModule.path.startsWith(candidateModule.path)) {
        foundParent = true;
        break;
      }
    }
    if (!foundParent) {
      fmodules.push(candidateModule);
    }
  }

  // sort by module name ascending to make it previsible and easier to create
  // newer modules for tests without breaking existing tests and to debug in general
  fmodules.sort((aa, bb) => {
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

  return fmodules;
};

export { discoverModules };
