import { Config } from './types/Config';

const mergeConfigs = (parentConfig:Config, childConfig:Config):Config => {
  const mergedRules = { ...parentConfig.rules, ...childConfig.rules };
  const config = <Config>{ ...parentConfig, ...childConfig };
  config.rules = mergedRules;
  return config;
};

export { mergeConfigs };
