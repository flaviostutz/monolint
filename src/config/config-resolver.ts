import fs from 'fs';

import { Config } from '../types/Config';
import { getRule } from '../rules/registry';

import { loadExtension } from './extensions';

const resolveModuleConfig = (
  modulePath: string,
  baseDir: string,
  configFileName: string,
): Config => {
  // iterate over module path hierarchy
  const modulePaths = modulePath.split('/');
  let path = '';

  // starting point
  let moduleConfig: Config = {
    extends: ['monolint:recommended'],
    'use-gitignore': true,
  };

  // iterate over path parts of the module for creating a merged config
  for (let j = 0; j < modulePaths.length; j += 1) {
    const pathPart = modulePaths[j];

    if (path.length === 0) {
      path = `${pathPart}`;
    } else {
      path = `${path}/${pathPart}`;
    }

    // only evaluate dirs from 'baseDir' on
    if (path.length < baseDir.length) {
      continue;
    }

      // calculate merged config by looking at the module path hierarchy
    const configFile = `${path}/${configFileName}`;
    let loadedConfig:Config = {};

    if (fs.existsSync(configFile)) {
      const cf = fs.readFileSync(configFile);
      try {
        loadedConfig = JSON.parse(cf.toString()) as Config;
      } catch (err) {
        throw new Error(`Error loading ${configFile}. err=${err}`);
      }
    } else if (path !== baseDir) {
      continue;
    }

      // only root level configurations should have this
    if (loadedConfig['module-markers'] && path !== baseDir) {
      throw new Error("'module-markers' is only valid on monorepo root level configuration");
    }

      // use default 'extends' configuration for config at base (if not defined)
    if (!loadedConfig.extends && path === baseDir) {
      loadedConfig.extends = ['monolint:recommended'];
    }
    if (!loadedConfig.extends) {
      loadedConfig.extends = [];
    }

      // merge all configurations from "extends" into this one
    for (let aa = 0; aa < loadedConfig.extends.length; aa += 1) {
      const extend = loadedConfig.extends[aa];
      const extendConfig = loadExtension(extend);
      if (!extendConfig) {
        throw new Error(`Cannot find extension '${extend}' defined in ${configFile}`);
      }
      moduleConfig = mergeConfigs(moduleConfig, extendConfig);
    }

      // merge this configuration with previous configuration in path hierarchy
    moduleConfig = mergeConfigs(moduleConfig, loadedConfig);

    validateConfig(moduleConfig);
  }
  return moduleConfig;
};

const mergeConfigs = (parentConfig: Config, childConfig: Config): Config => {
  // merge markers
  let mergedMarkers = parentConfig['module-markers'];
  if (!mergedMarkers) {
    mergedMarkers = [];
  }
  if (childConfig['module-markers']) {
    mergedMarkers = mergedMarkers.concat(childConfig['module-markers']);
  }

  // merge rules
  const mergedRules = { ...parentConfig.rules, ...childConfig.rules };

  const config = <Config>{ ...parentConfig, ...childConfig };
  config['module-markers'] = mergedMarkers;
  config.rules = mergedRules;
  // eslint-disable-next-line no-undefined
  config.extends = undefined;
  return config;
};

const validateConfig = (config: Config): void => {
  if (!config.rules) {
    throw new Error('Config has no rule configurations');
  }
  for (const ruleName in config.rules) {
    if (Object.prototype.hasOwnProperty.call(config.rules, ruleName)) {
      const rule = getRule(ruleName);
      if (!rule) {
        throw new Error(`Rule '${ruleName}' is not valid`);
      }
    }
  }
};

const loadBaseConfig = (baseDir: string, configFileName: string): Config => {
  return resolveModuleConfig(baseDir, baseDir, configFileName);
};

export { mergeConfigs, validateConfig, resolveModuleConfig, loadBaseConfig };
