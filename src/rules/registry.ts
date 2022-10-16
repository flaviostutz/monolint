import { Rule } from '../types/Rule';
import { Config } from '../types/Config';

const rules:Rule[] = [];

const register = (rule:Rule):void => {
  rules.push(rule);
};

const enabledRules = (config:Config):Rule[] => {
  return rules.filter((rule) => {
    return config.rules[rule.name];
  });
};

export { rules, register, enabledRules };
