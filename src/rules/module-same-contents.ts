import * as fs from 'fs';

// import { config } from 'yargs';

import { similarityPerc } from '../utils/file';
import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
// import { ConfigModuleSameContents } from '../types/Config';

const defaultFiles = [
  'LICENSE',
  // common javascript configurations
  'jest.config.js',
  'tsconfig.json',
  'tsconfig.eslint.json',
  '.eslintrc.js',
  'eslintignore',
  '.prettierrc.js',
  '.prettierignore',
];

const rule: Rule = {
  name: 'module-same-contents',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    // const refModuleName:string|null = null;

    // // look for the reference module name among configurations
    // for (let i = 0; i < modules.length; i += 1) {
    //   const mm = modules[i];
    //   const { rules } = mm.config;
    //   if (!rules || !rules['module-same-contents']) {
    //     continue;
    //   }

    //   // get the config for this rule
    //   const ruleConfig = rules['module-same-contents'] as ConfigModuleSameContents;

    // }

    const refFiles = defaultFiles;
    const minSimilarityPerc = 100;

    // reference module defined
    // if (refModuleName) {
    //   const fm = modules.filter((mm) => mm.name === refModuleName);
    //   if (fm.length !== 1) {
    //     return [{
    //       valid: false,
    //       resource: refModuleName,
    //       message: `Reference module '${refModuleName}' points to multiple modules`,
    //       rule: rule.name,
    //     }];
    //   }
    //   const refModule = fm[0];
    //   return checkModules(modules, refModule, refFiles, minSimilarityPerc);
    // }

    // reference module not defined
    // find the module that have most of the reference files in it
    // if two modules tie, use the one that creates less invalid checks
    let bestFileCount = 0;
    let sameCountBests: Module[] = [];
    for (let i = 0; i < modules.length; i += 1) {
      const rm = modules[i];
      // only check if module has ref files and return one result per file found
      const rr = checkModules([rm], rm, refFiles, minSimilarityPerc);
      if (rr.length === bestFileCount) {
        sameCountBests.push(rm);
      }
      if (rr.length > bestFileCount) {
        bestFileCount = rr.length;
        sameCountBests = [rm];
      }
    }

    let bestRuleResults: RuleResult[] | null = null;
    for (let i = 0; i < sameCountBests.length; i += 1) {
      const refModule = sameCountBests[i];
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
    let doc = '* Checks if specified files have the same content among the different modules\n';
    doc +=
      "* It doesn't complain or checks for files that aren't present on modules. If you need this, use rule 'module-required-files'\n";
    doc += '* Default behavior:\n';
    doc +=
      "  * It will try to select the module with most files as the reference module and check the other modules's files against it";
    doc += `  * Files checked: ${JSON.stringify(defaultFiles)}`;
    doc += '  * Files must have the be exactly the same contents (min-similarity=100%)';
    doc +=
      '* With advanced configurations you can change which files are checked and the similarity threshold';
    return doc;
  },
  docExampleConfigs(): RuleExample[] {
    return [
      {
        description: 'Deactivate this rule',
        config: false,
      },
      {
        description:
          "Overwrites default checked files with a new set of files that must be 100% similar and forces reference module to be 'my-best-module'",
        config: {
          'reference-module': 'my-best-module',
          files: ['special.txt', 'src/index.js'],
        },
      },
      {
        description:
          "File 'README.md' must be at least 70% and 'src/config.js' must be 98% similar to the same files on reference module. 'tsconfig.json' won't be checked anymore. All other default files will continue to be checked",
        config: {
          files: {
            'README.md': {
              'min-similarity': 70,
            },
            'src/config.js': {
              'min-similarity': 98,
            },
            'tsconfig.json': {
              enabled: false,
            },
          },
        },
      },
    ];
  },
};

const checkModules = (
  modules: Module[],
  refModule: Module,
  refFiles: string[],
  minSimilarityPerc: number,
): RuleResult[] => {
  const results: RuleResult[] = [];
  for (let j = 0; j < modules.length; j += 1) {
    const module = modules[j];

    refFiles.forEach((refFile) => {
      const modFilePath = `${module.path}/${refFile}`;
      const refFilePath = `${refModule.path}/${refFile}`;
      if (!(fs.existsSync(refFilePath) && fs.existsSync(modFilePath))) {
        return;
      }

      // reference module
      if (module.path === refModule.path) {
        results.push({
          valid: true,
          resource: modFilePath,
          message: 'Reference file for other modules',
          rule: rule.name,
          module,
        });
        return;
      }

      // other modules
      const sp = similarityPerc(modFilePath, refFilePath);
      // eslint-disable-next-line @shopify/binary-assignment-parens
      const valid = sp >= minSimilarityPerc;
      let message = `Similar to module ${refModule.name} (${sp}%)`;
      if (!valid) {
        message = `Different from '${refFilePath}' (${sp}%)`;
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
