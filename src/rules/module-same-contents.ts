// import * as fs from 'fs';

import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';

const defaultFiles = [
  'LICENSE',
  // common javascript configurations
  'jest.config.js', 'tsconfig.js', 'tsconfig.eslint.json', '.eslintrc.js', 'eslintignore', '.prettierrc.js', '.prettierignore',
];

const rule: Rule = {
  name: 'module-same-contents',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    const refModuleName:string|null = 'mod4-all-same';
    const refFiles = defaultFiles;
    const minSimilarity = 80;

    // reference module defined
    if (!refModuleName) {
      const fm = modules.filter((mm) => mm.name === refModuleName);
      if (fm.length !== 1) {
        return [{
          valid: false,
          resource: refModuleName,
          message: `Reference name '${refModuleName}' cannot be used because it points to two modules`,
          rule: rule.name,
        }];
      }
      const refModule = fm[0];
      return checkModules(refModule, modules, refFiles, minSimilarity);
    }

    // reference module not defined
    // try all modules as ref and use the one
    // that generates the least number of invalid resources
    let bestRuleResults:RuleResult[]|null = null;
    for (let i = 0; i < modules.length; i += 1) {
      const refModule = modules[i];
      const rr = checkModules(refModule, modules, refFiles, minSimilarity);
      const irr = rr.filter((rrr) => !rrr.valid);
      const ibr = bestRuleResults?.filter((rrr) => !rrr.valid);
      if (!bestRuleResults || (ibr && irr.length < ibr.length)) {
        bestRuleResults = rr;
      }
    }
    return bestRuleResults;
  },
  check(): RuleResult[] | null {
    return null;
  },
  docMarkdown(): string {
    return '* ';
  },
  docExampleConfigs(): RuleExample[] {
    return [
      {
        description: '',
        config: false,
      },
    ];
  },
};

const checkModules = (refModule: Module, modules:Module[], refFiles: string[], minSimilarity:int):RuleResult[] => {
  const results:RuleResult[] = [];
  for (let j = 0; j < modules.length; j += 1) {
    const module = modules[j];
    if (module.path === refModule.path) {
      continue;
    }

  }
  return results;
};


export default rule;
