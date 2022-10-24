import * as fs from 'fs';

// import { config } from 'yargs';

import { similarityPerc } from '../utils/file';
import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
import { ConfigModuleSameContents, ConfigModuleSameContentsFile } from '../types/Config';
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
    const ruleResults:RuleResult[] = [];

    for (let j = 0; j < modules.length; j += 1) {
      const targetModule = modules[j];

      const { rules } = targetModule.config;
      if (!rules || !rules['module-same-contents']) {
        throw new Error('module-same-contents is not enabled for this rule');
      }
      const moduleConfig = rules['module-same-contents'] as ConfigModuleSameContents;

      let targetModuleRuleConfig:ConfigModuleSameContents = {};
      if (typeof moduleConfig !== 'boolean') {
        targetModuleRuleConfig = moduleConfig;
      }

      // reference module was set
      const refModuleName = targetModuleRuleConfig['reference-module'];
      if (refModuleName) {
        const rms = modules.filter((mm) => mm.name === refModuleName);
        if (rms.length > 1) {
          ruleResults.push({
            valid: false,
            resource: refModuleName,
            message: `Reference module '${refModuleName}' points to multiple modules`,
            rule: rule.name,
          });
          continue;
        }
        const refModule = rms[0];
        const mr = checkModule(refModule, targetModule, targetModuleRuleConfig);
        ruleResults.push(...mr);
        continue;
      }

      // reference module not set

      // find the module that have most of the reference files in it
      let bestFileCount = 0;
      let sameCountBestRefs: Module[] = [];
      for (let i = 0; i < modules.length; i += 1) {
        const rm = modules[i];
        // only check if module has ref files and return one result per file found
        const rr = checkModule(rm, rm, targetModuleRuleConfig);
        if (rr.length === bestFileCount) {
          sameCountBestRefs.push(rm);
        }
        if (rr.length > bestFileCount) {
          bestFileCount = rr.length;
          sameCountBestRefs = [rm];
        }
      }

      // untie among best ref modules
      let bestRefResults: RuleResult[] | null = null;
      for (let i = 0; i < sameCountBestRefs.length; i += 1) {
        const refModule = sameCountBestRefs[i];
        const rr = checkModule(refModule, targetModule, targetModuleRuleConfig);
        const irr = rr.filter((rrr) => !rrr.valid);
        const ibr = bestRefResults?.filter((rrr) => !rrr.valid);
        if (!bestRefResults || (ibr && irr.length < ibr.length)) {
          bestRefResults = rr;
        }
      }
      if (bestRefResults) {
        ruleResults.push(...bestRefResults);
      }
    }
    return ruleResults;
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

const checkModule = (
  refModule: Module,
  targetModule: Module,
  targetModuleRuleConfig:ConfigModuleSameContents,
): RuleResult[] => {
  const results: RuleResult[] = [];

  // expand simple configuration format to complete format
  let fconfig = targetModuleRuleConfig.files;
  if (!targetModuleRuleConfig.files) {
    targetModuleRuleConfig.files = defaultFiles;
  }
  console.log(JSON.stringify(targetModuleRuleConfig));
  if (Array.isArray(targetModuleRuleConfig.files)) {
    fconfig = targetModuleRuleConfig.files.reduce<Record<string, ConfigModuleSameContentsFile>>((fc, rf) => {
      fc[rf] = { enabled: true, 'min-similarity': 100 };
      return fc;
    }, {});
  }
  const fileConfigs = <Record<string, ConfigModuleSameContentsFile>>fconfig;

  // check each file in module against ref module file
  for (const filename in fileConfigs) {
    // eslint-disable-next-line no-prototype-builtins
    if (!fileConfigs.hasOwnProperty(filename)) {
      continue;
    }

    const targetFilePath = `${targetModule.path}/${filename}`;
    const refFilePath = `${refModule.path}/${filename}`;
    if (!(fs.existsSync(refFilePath) && fs.existsSync(targetFilePath))) {
      continue;
    }

    // reference module
    if (targetModule.path === refModule.path) {
      results.push({
        valid: true,
        resource: targetFilePath,
        message: 'Reference file for other modules',
        rule: rule.name,
        module: targetModule,
      });
      continue;
    }

    const fileConfig = fileConfigs[filename];

    if (!fileConfig.enabled) {
      continue;
    }

    // validate file config
    if (typeof fileConfig['min-similarity'] !== 'number') {
      throw new Error(`'min-similarity' config for file '${filename}' must be an integer`);
    }

    // check file similarity
    const sp = similarityPerc(targetFilePath, refFilePath);
    // eslint-disable-next-line @shopify/binary-assignment-parens
    const valid = sp >= fileConfig['min-similarity'];
    let message = `Similar to module ${refModule.name} (${sp}%)`;
    if (!valid) {
      message = `Different from '${refFilePath}' (${sp}%)`;
    }
    results.push({
      valid,
      resource: targetFilePath,
      message,
      rule: rule.name,
      module: targetModule,
    });

  }
  return results;
};

export default rule;
