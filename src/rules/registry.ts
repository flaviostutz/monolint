import { Rule } from '../types/Rule';
import { Config } from '../types/Config';

import r1 from './serverless-same-name';
import r2 from './packagejson-same-name';
import r3 from './module-name-regex';
import r4 from './module-unique-name';
import r5 from './module-required-files';
import r6 from './module-same-contents';
import r7 from './module-parent-folder';
import r8 from './module-folder-structure';
import r9 from './gh-workflow-module-prefix';

const allRules: Rule[] = [];

const register = (rule: Rule): void => {
  allRules.push(rule);
};

// register all rules available
register(r1);
register(r2);
register(r3);
register(r4);
register(r5);
register(r6);
register(r7);
register(r8);
register(r9);

const getRule = (name: string): Rule | null => {
  const rule = allRules.find(({ name: ruleName }) => {
    return ruleName === name;
  });
  return rule ?? null;
};

const enabledRules = (config: Config): Rule[] => {
  return allRules.filter((rule) => {
    return config.rules && config.rules[rule.name];
  });
};

export { allRules, register, enabledRules, getRule };
