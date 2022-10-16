import { Rule } from './types/Rule';
import { Config } from './types/Config';

const allRules:Rule[] = [];

const register = (rule:Rule):void => {
  allRules.push(rule);
};

const enabledRules = (config:Config):Rule[] => {
  return allRules.filter((rule) => {
    return config.rules[rule.name];
  });
};

export { allRules, register, enabledRules };
