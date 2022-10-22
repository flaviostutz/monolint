import * as fs from 'fs';

import { similarityPerc } from '../utils/file';
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
    const minSimilarityPerc = 80;

    // reference module defined
    if (!refModuleName) {
      const fm = modules.filter((mm) => mm.name === refModuleName);
      if (fm.length !== 1) {
        return [{
          valid: false,
          resource: refModuleName,
          message: `Reference module '${refModuleName}' points to multiple modules`,
          rule: rule.name,
        }];
      }
      const refModule = fm[0];
      return checkModules(modules, refModule, refFiles, minSimilarityPerc);
    }

    // reference module not defined
    // try all modules as ref and use the one
    // that generates the least number of invalid resources
    let bestRuleResults:RuleResult[]|null = null;
    for (let i = 0; i < modules.length; i += 1) {
      const refModule = modules[i];
      const rr = checkModules(modules, refModule, refFiles, minSimilarityPerc);
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

const checkModules = (
    modules:Module[],
    refModule: Module,
    refFiles: string[],
    minSimilarityPerc:number,
):RuleResult[] => {

  const results:RuleResult[] = [];
  for (let j = 0; j < modules.length; j += 1) {
    const module = modules[j];
    if (module.path === refModule.path) {
      continue;
    }

    refFiles.forEach((refFile) => {
      const modFilePath = `${module.path}/${refFile}`;
      const refFilePath = `${refModule.path}/${refFile}`;
      if (!(fs.existsSync(refFilePath) && fs.existsSync(modFilePath))) {
        return;
      }
      const sp = similarityPerc(modFilePath, refFilePath);
      const valid = (sp >= minSimilarityPerc);
      let message = `Similar to module ${refModule.name} (${sp}%)`;
      if (!valid) {
        message = `Too different from '${refFilePath}' (${sp}%)`;
      }
      results.push({
        valid,
        resource: modFilePath,
        message,
        rule: rule.name,
        module,
      });
    });
  }
  return results;
};

export default rule;
