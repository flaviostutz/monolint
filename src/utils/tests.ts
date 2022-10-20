import { discoverModules } from '../lint';
import { Module } from '../types/Module';

import { loadBaseConfig } from './config';

export const loadModulesForRule = (baseDir:string, baseConfigFileName:string, ruleName:string):Module[] => {
  const baseConfig = loadBaseConfig(baseDir, baseConfigFileName);
  const modules = discoverModules(baseDir, baseConfig);
  return modules.filter((module) => {
    return ruleName in module.enabledRules;
  });
};
