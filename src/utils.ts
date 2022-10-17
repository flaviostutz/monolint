import { Config } from './types/Config';
import { getRule } from './rules/registry';

const mergeConfigs = (parentConfig:Config, childConfig:Config):Config => {
  const mergedRules = { ...parentConfig.rules, ...childConfig.rules };
  const config = <Config>{ ...parentConfig, ...childConfig };
  config.rules = mergedRules;
  return config;
};


const validateConfig = (config: Config):void => {
  if (config.rules) {
    for (const ruleName in config.rules) {
      if (Object.prototype.hasOwnProperty.call(config.rules, ruleName)) {
        const rule = getRule(ruleName);
        if (!rule) {
          throw new Error(`Rule '${ruleName}' is not valid`);
        }
      }
    }
  }
};


export { mergeConfigs, validateConfig };
