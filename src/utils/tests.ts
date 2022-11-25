import { loadBaseConfig } from '../config/config-resolver';
import { discoverModules } from '../modules';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';

const getResultsByModule = (ruleResults: RuleResult[]): Record<string, RuleResult[]> => {
  return ruleResults.reduce((acc, result) => {
    const { module } = result;
    if (module) {
      if (!Array.isArray(acc[module.name])) {
        acc[module.name] = [];
      }

      acc[module.name].push(result);
    }
    return acc;
  }, {} as Record<string, RuleResult[]>);
};

const loadModulesForRule = (
  baseDir: string,
  baseConfigFileName: string,
  ruleName: string,
): Module[] => {
  const baseConfig = loadBaseConfig(baseDir, baseConfigFileName);
  const modules = discoverModules(baseDir, baseConfig, baseConfigFileName);
  return modules.filter((module) => {
    return ruleName in module.enabledRules;
  });
};

const expectAllResourcesRegexValid = (
  ruleResults: RuleResult[] | null,
  resourceRegex: string,
  expectValid: boolean,
  expectMessageRegex?: string,
): void => {
  if (!ruleResults) {
    throw new Error('ruleResults should be defined');
  }
  let prevResult = null;
  for (let j = 0; j < ruleResults.length; j += 1) {
    const rr = ruleResults[j];

    const regexp = new RegExp(resourceRegex);
    if (regexp.test(rr.resource)) {
      if (prevResult && prevResult.valid !== rr.valid) {
        const res1 = {
          valid: prevResult.valid,
          resource: prevResult.resource,
          message: prevResult.message,
        };
        const res2 = { valid: rr.valid, resource: rr.resource, message: rr.message };
        throw new Error(
          `Multiple rule results for '${resourceRegex}' found with different 'valid' results. res1=${JSON.stringify(
            res1,
          )}; res2=${JSON.stringify(res2)}`,
        );
      }

      if (expectMessageRegex) {
        const regexpm = new RegExp(expectMessageRegex);
        if (!rr.message || !regexpm.test(rr.message)) {
          throw new Error(`Message '${rr.message}' doesn't match regex`);
        }
      }

      prevResult = rr;
    }
  }

  if (!prevResult) {
    throw new Error(`No resources that match '${resourceRegex}' found in rule results`);
  }

  if (expectValid !== prevResult.valid) {
    throw new Error(
      `All rule results for resource ${resourceRegex} should be ${
        expectValid ? 'valid' : 'invalid'
      }. last=${JSON.stringify({
        valid: prevResult.valid,
        resource: prevResult.resource,
        message: prevResult.message,
      })}`,
    );
  }
};

const expectAllModuleResultsValid = (
  ruleResults: RuleResult[] | null,
  moduleName: string,
  expectValid: boolean,
): void => {
  if (!ruleResults) {
    throw new Error('ruleResults should be defined');
  }

  let foundResult = false;
  let validResult = false;
  for (let j = 0; j < ruleResults.length; j += 1) {
    const rr = ruleResults[j];

    if (moduleName === rr.module?.name) {
      if (foundResult && validResult !== rr.valid) {
        throw new Error(
          `Multiple rule results for module ${rr.module.name} found with different 'valid' results`,
        );
      }
      foundResult = true;
      validResult = rr.valid;
    }
  }

  if (!foundResult) {
    throw new Error(`No resources of module '${moduleName}' found in rule results`);
  }

  if (expectValid !== validResult) {
    throw new Error(
      `All rule results for module ${moduleName} should be ${expectValid ? 'valid' : 'invalid'}`,
    );
  }
};

export {
  loadModulesForRule,
  expectAllResourcesRegexValid,
  expectAllModuleResultsValid,
  getResultsByModule,
};
