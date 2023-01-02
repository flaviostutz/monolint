import * as fs from 'fs';

import jmespath from 'jmespath';

import { fullContentSimilarityPerc, loadContents, partialContentSimilarity } from '../utils/file';
import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
import { ConfigModuleSameContents, ConfigModuleSameContentsFile } from '../types/Config';
import { quoteQuery } from '../utils/quoteQuery';
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
    const ruleResults: RuleResult[] = [];

    for (let j = 0; j < modules.length; j += 1) {
      const targetModule = modules[j];

      const { rules } = targetModule.config;
      if (!rules || !rules['module-same-contents']) {
        throw new Error('module-same-contents is not enabled for this rule');
      }

      // expand simple configuration format to complete format
      const targetModuleRuleConfig = expandConfig(
        <boolean | ConfigModuleSameContents>rules['module-same-contents'],
      );

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
    let doc = '* Checks if specified files have the same content among different modules\n';
    doc +=
      "* It doesn't complain or checks for files that aren't present on modules. If you need this, use rule 'module-required-files'\n";
    doc += '* Default behavior:\n';
    doc +=
      "  * It will try to select the module with most files as the reference module and check the other modules's files against it";
    doc += `  * Files checked if nothing is specified: ${JSON.stringify(defaultFiles)}`;
    doc += '  * Files must have the be exactly the same contents (min-similarity=100%)';
    doc += '* Expanded configuration:\n';
    doc +=
      '  * With expanded configurations you can change which files are checked and the similarity threshold';
    doc +=
      '  * Use jmespath queries (https://jmespath.org) to define which parts of the file must be equal among files using attribute "selector". Supported file types are yml and json (yml files are transformed into json before being checked)';
    doc +=
      '  * If jmespath query resolves to a primitive attribute value, its similarity will be compared\n';
    doc +=
      '  * If jmespath query resolves to an object with attributes, only the attributes that are present in both modules/files will be checked\n';
    doc +=
      "  * If jmespath is '', all matching attributes of the file will be checked against similarity\n";
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
          "Attributes 'provider.runtime' and 'provider.stackName' of serverless.yml and script 'test' of package.json must be equal among modules (it won't check the whole file). Jmespath (jmespath.org) notation was used to select the attributes",
        config: {
          files: {
            'serverless.yml': {
              selectors: ['provider.runtime', 'provider.stackName', 'plugins[0]'],
            },
            'package.json': {
              selectors: ['scripts.dist', 'repository.type'],
            },
          },
        },
      },
      {
        description:
          "The attributes inside 'dependencies' present both in reference and in the other modules must match, if exists. In this example, it will enforce all dependencies that exists in both reference module and the other modules to have the same version, but will ignore all other dependencies that are not in both modules.",
        config: {
          files: {
            'package.json': {
              selectors: ['dependencies'],
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
  targetModuleRuleConfig: ConfigModuleSameContents,
): RuleResult[] => {
  let results: RuleResult[] = [];

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

    // partial content comparison by jmespath selector
    if (fileConfig.selectors) {
      if (
        !Array.isArray(fileConfig.selectors) ||
        fileConfig.selectors.length === 0 ||
        typeof fileConfig.selectors[0] !== 'string'
      ) {
        throw new Error(
          `'selectors' config for file '${filename}' must be an array of jmespath queries`,
        );
      }

      for (let i = 0; i < fileConfig.selectors.length; i += 1) {
        const selector = fileConfig.selectors[i];
        const presults = checkPartialSimilarity({
          selector,
          refFilePath,
          targetModule,
          targetFilePath,
          minSimilarity,
          refModule,
        });
        results = [...results, ...presults];
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

const expandConfig = (
  moduleConfig: boolean | ConfigModuleSameContents,
): ConfigModuleSameContents => {
  let targetModuleRuleConfig: ConfigModuleSameContents = {};

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

// const getDiffMessage = (refFilePath: string, dselector: string,
//     similarityResults: Record<string, number>): {dmessage:string, dselector:string} => {
//   let dmessage = `Different from '${refFilePath}[${dselector}]' (${similarityResults._all}%)`;

//   // add more details, if exists
//   let worstSimilarity = 100;
//   let worstKey = null;
//   for (const key in similarityResults) {
//     if (key === '_all') {
//       continue;
//     }
//     // eslint-disable-next-line no-prototype-builtins
//     if (similarityResults.hasOwnProperty(key)) {
//       if (similarityResults[key] <= worstSimilarity) {
//         worstSimilarity = similarityResults[key];
//         worstKey = key;
//       }
//     }
//   }
//   if (worstKey) {
//     dmessage = `Different from '${refFilePath}[${dselector}.${worstKey}]' (${worstSimilarity}%)`;
//     return { dmessage, dselector: `${dselector}.${worstKey}` };
//   }

//   return { dmessage, dselector };
// };

const checkPartialSimilarity = (pp: {
  selector: string;
  refFilePath: string;
  targetModule: Module;
  targetFilePath: string;
  minSimilarity: number;
  refModule: Module;
}): RuleResult[] => {
  const results: RuleResult[] = [];
  const contentsRef = loadContents(pp.refFilePath);
  if (pp.selector !== '') {
    const partial1 = jmespath.search(contentsRef, quoteQuery(pp.selector));
    if (!partial1) {
      results.push({
        valid: false,
        resource: `${pp.refFilePath}[${pp.selector}]`,
        message: 'Config error: selector points to an unexisting content on reference file',
        rule: rule.name,
        module: pp.targetModule,
      });
    }
  }

  const sp = partialContentSimilarity(
    pp.targetFilePath,
    pp.selector,
    pp.refFilePath,
    pp.selector,
    true,
  );

  // eslint-disable-next-line @shopify/binary-assignment-parens
  const valid = sp._all >= pp.minSimilarity;
  let message = `Similar to module ${pp.refModule.name} (${sp._all}%)`;
  let selectorMsg = `[${pp.selector}]`;
  if (!pp.selector) {
    selectorMsg = '';
  }

  if (!valid) {
    message = `Different from '${pp.refFilePath}${selectorMsg}' (${sp._all}%)`;
  }

  results.push({
    valid,
    resource: `${pp.targetFilePath}${selectorMsg}`,
    message,
    rule: rule.name,
    module: pp.targetModule,
  });

  if (valid) {
    return results;
  }

  // generate results for failed checks
  for (const key in sp) {
    if (key === '_all') {
      continue;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!sp.hasOwnProperty(key)) {
      continue;
    }
    if (pp.selector) {
      selectorMsg = `[${pp.selector}.${key}]`;
    } else {
      selectorMsg = `[${key}]`;
    }
    message = `Different from '${pp.refFilePath}${selectorMsg}' (${sp[key]}%)`;

    results.push({
      valid,
      resource: `${pp.targetFilePath}${selectorMsg}`,
      message,
      rule: rule.name,
      module: pp.targetModule,
    });
  }

  return results;
};

export default rule;
