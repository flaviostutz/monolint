import * as fs from 'fs';

import jsonpointer from 'jsonpointer';

import { fullContentSimilarityPerc, loadContents, partialContentSimilarity } from '../utils/file';
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

      // expand simple configuration format to complete format
      const targetModuleRuleConfig = expandConfig(<boolean | ConfigModuleSameContents>rules['module-same-contents']);

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
      '* With expanded configurations you can change which files are checked and the similarity threshold';
    doc +=
      '* Use jsonpointer selectors (https://www.rfc-editor.org/rfc/rfc6901) to define which parts of the file must be equal among files using attribute "selector". Supported file types are yml and json (yml files are transformed into json before being checked)';
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
      {
        description:
          "Attributes 'provider.runtime' and 'provider/stackName' of serverless.yml and script 'test' of package.json must be equal among modules (it won't check the whole file). Jsonpointer (https://www.rfc-editor.org/rfc/rfc6901) notation was used to select the attributes",
        config: {
          files: {
            'serverless.yml': {
              selectors: ['/provider/runtime', '/provider/stackName', '/plugins/0'],
            },
            'package.json': {
              selectors: ['/scripts/dist', '/repository/type'],
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

  // check each file in module against ref module file
  for (const filename in targetModuleRuleConfig.files) {
    // eslint-disable-next-line no-prototype-builtins
    if (!targetModuleRuleConfig.files.hasOwnProperty(filename)) {
      continue;
    }

    const targetFilePath = `${targetModule.path}/${filename}`;
    const refFilePath = `${refModule.path}/${filename}`;
    if (!(fs.existsSync(refFilePath) && fs.existsSync(targetFilePath))) {
      continue;
    }

    // we will always have the expanded form here
    const fileConfigs = <Record<string, ConfigModuleSameContentsFile>>targetModuleRuleConfig.files;
    const fileConfig = fileConfigs[filename];

    if (!fileConfig.enabled) {
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

    // validate file config
    if (typeof fileConfig['min-similarity'] !== 'number') {
      throw new Error(`'min-similarity' config for file '${filename}' must be an integer`);
    }
    const minSimilarity = fileConfig['min-similarity'];


    // partial content comparison by jsonpointer selector
    if (fileConfig.selectors) {
      if (!Array.isArray(fileConfig.selectors) || fileConfig.selectors.length === 0 || (typeof fileConfig.selectors[0] !== 'string')) {
        throw new Error(`'selectors' config for file '${filename}' must be an array of jsonpointer expressions`);
      }

      for (let i = 0; i < fileConfig.selectors.length; i += 1) {
        const selector = fileConfig.selectors[i];

        const contentsRef = loadContents(refFilePath);
        const partial1 = jsonpointer.get(contentsRef, selector);
        if (!partial1) {
          results.push({
            valid: false,
            resource: `${refFilePath}[${selector}]`,
            message: 'Config error: selector points to an unexisting content on reference file',
            rule: rule.name,
            module: targetModule,
          });
        }

        const sp = partialContentSimilarity(targetFilePath, selector, refFilePath, selector);

        // eslint-disable-next-line @shopify/binary-assignment-parens
        const valid = sp >= minSimilarity;
        let message = `Similar to module ${refModule.name} (${sp}%)`;
        if (!valid) {
          message = `Different from '${refFilePath}[${selector}]' (${sp}%)`;
        }
        results.push({
          valid,
          resource: `${targetFilePath}[${selector}]`,
          message,
          rule: rule.name,
          module: targetModule,
        });
      }
      continue;
    }


    // full content comparison
    const sp = fullContentSimilarityPerc(targetFilePath, refFilePath);
    // eslint-disable-next-line @shopify/binary-assignment-parens
    const valid = sp >= minSimilarity;
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

const expandConfig = (moduleConfig: boolean | ConfigModuleSameContents): ConfigModuleSameContents => {
  let targetModuleRuleConfig:ConfigModuleSameContents = {};

  // some custom configuration was passed, not only a boolean for activating the module
  if (typeof moduleConfig !== 'boolean') {
    targetModuleRuleConfig = moduleConfig;
  }

  // files wasn't defined, so use default files
  let fileConfigs = targetModuleRuleConfig.files;
  if (!fileConfigs) {
    fileConfigs = defaultFiles;
  }

  // only an array of files was used, not the expanded full format, so expand it
  if (Array.isArray(fileConfigs)) {
    fileConfigs = fileConfigs.reduce<Record<string, ConfigModuleSameContentsFile>>((fc, rf) => {
      fc[rf] = { enabled: true, 'min-similarity': 100 };
      return fc;
    }, {});
  }

  for (const fc in fileConfigs) {
    // eslint-disable-next-line no-prototype-builtins
    if (!fileConfigs.hasOwnProperty(fc)) {
      continue;
    }
    const fileConfig = fileConfigs[fc];
    if (typeof fileConfig['min-similarity'] !== 'number') {
      fileConfig['min-similarity'] = 100;
    }
    if (typeof fileConfig.enabled !== 'boolean') {
      fileConfig.enabled = true;
    }
  }
  targetModuleRuleConfig.files = fileConfigs;
  return targetModuleRuleConfig;
};

export default rule;
