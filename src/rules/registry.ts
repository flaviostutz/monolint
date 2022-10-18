import { Rule } from '../types/Rule';
import { Config } from '../types/Config';

import r1 from './serverless-same-name';
import r2 from './packagejson-same-name';

const allRules:Rule[] = [];

const register = (rule:Rule):void => {
  allRules.push(rule);
};

// register all rules available
register(r1);
register(r2);

const getRule = (name:string):Rule|null => {
  const fr = allRules.filter((rule) => {
    return rule.name === name;
  });
  if (fr.length !== 0) {
    return fr[0];
  }
  return null;
};

const enabledRules = (config:Config):Rule[] => {
  return allRules.filter((rule) => {
    return config.rules && config.rules[rule.name];
  });
};

export { allRules, register, enabledRules, getRule };