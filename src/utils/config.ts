import fs from 'fs';

import { Config } from '../types/Config';
import { getRule } from '../rules/registry';
import { DefaultConfig } from '../defaultConfig';

const mergeConfigs = (parentConfig:Config, childConfig:Config):Config => {
  const mergedRules = { ...parentConfig.rules, ...childConfig.rules };
  const config = <Config>{ ...parentConfig, ...childConfig };
  config.rules = mergedRules;
  return config;
};

const validateConfig = (config: Config):void => {
  if (!config.rules) {
    throw new Error(`Config has no rule configurations`);
  }
  for (const ruleName in config.rules) {
    if (Object.prototype.hasOwnProperty.call(config.rules, ruleName)) {
      const rule = getRule(ruleName);
      if (!rule) {
        throw new Error(`Rule '${ruleName}' is not valid`);
      }
      // const ruleConfig = config.rules[ruleName];
      // rule.validateConfig(ruleConfig);
    }
  }
};

const loadBaseConfig = (baseDir:string, configFile:string|null):Config => {

  let cfile = configFile;
  if (cfile == null) {
    cfile = '.monolint.json';
  }

  if (fs.existsSync(`${baseDir}/${cfile}`)) {
    const cf = fs.readFileSync(`${baseDir}/${cfile}`);
    const loadedConfig = JSON.parse(cf.toString());
    // eslint-disable-next-line no-prototype-builtins
    if (!loadedConfig.hasOwnProperty('defaults') || loadedConfig.defaults) {
      return mergeConfigs(<Config>DefaultConfig, loadedConfig);
    }
    return loadedConfig;
  }

  if (cfile === '.monolint.json') {
    console.info(`File "${configFile}" not found. Using default configurations`);
    return <Config>DefaultConfig;
  }

  throw new Error(`File "${configFile}" not found`);
};

export { mergeConfigs, validateConfig, loadBaseConfig };
