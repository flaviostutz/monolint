import * as fs from 'fs';

import jmespath from 'jmespath';

import { fullContentSimilarityPerc, loadContents, partialContentSimilarity } from '../utils/file';
import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';
import { ConfigModuleSameContents, ConfigModuleSameContentsFile } from '../types/Config';
import { quoteQuery } from '../utils/quoteQuery';

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

    // define the default reference module
    const defaultReferenceModule = getDefaultReferenceModule(modules);

    // check content similarity against reference modules
    for (let j = 0; j < modules.length; j += 1) {
      const targetModule = modules[j];

      // expand simple configuration format to complete format
      const { rules } = targetModule.config;
      if (!rules || !rules['module-same-contents']) {
        throw new Error('module-same-contents is not enabled for this rule');
      }
      const targetModuleRuleConfig = expandConfig(
        <boolean | ConfigModuleSameContents>rules['module-same-contents'],
      );

      let referenceModule = defaultReferenceModule;

      // specific reference module was set
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
        referenceModule = rms[0];
      }

      const mr = checkModule(referenceModule, targetModule, targetModuleRuleConfig);
      ruleResults.push(...mr);
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
    doc +=
      '* For partial contents, selectors can be used in yml, json or Makefile files. yml files will be converted to json before being checked against the jmespath rule and Makefiles will expose their "targets" as first level attributes to be checked\n';
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
          "Attributes 'provider.runtime' and 'provider.stackName' of serverless.yml and script 'test' of package.json must be equal among modules if exists (it won't check the whole file). Jmespath (jmespath.org) notation was used to select the attributes",
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
          "Attribute 'provider.runtime' is required and has to be equal reference module. Attribute 'provider.stackName' must be equal, but only if exists. Jmespath (jmespath.org) notation was used to select the attributes",
        config: {
          files: {
            'serverless.yml': {
              selectors: { 'provider.runtime': true, 'provider.stackName': false },
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
      {
        description:
          "Makefile targets 'build' and 'deploy' must have the same content in Makefiles around the monorepo. They still can have other targets at will.",
        config: {
          files: {
            Makefile: {
              selectors: ['build', 'deploy'],
            },
          },
        },
      },
      {
        description:
          'All targets that exists in both Makefiles from reference module and the target module will be checked for similarity',
        config: {
          files: {
            Makefile: {
              selectors: [''],
            },
          },
        },
      },
    ];
  },
};

const getDefaultReferenceModule = (modules: Module[]): Module => {
  let defaultReferenceModule: Module = modules[0];

  for (let j = 0; j < modules.length; j += 1) {
    const targetModule = modules[j];

    // expand simple configuration format to complete format
    const { rules } = targetModule.config;
    if (!rules || !rules['module-same-contents']) {
      throw new Error('module-same-contents is not enabled for this rule');
    }
    const targetModuleRuleConfig = expandConfig(
      <boolean | ConfigModuleSameContents>rules['module-same-contents'],
    );

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
        defaultReferenceModule = refModule;
      }
    }
  }

  return defaultReferenceModule;
};

const checkModule = (
  refModule: Module,
  targetModule: Module,
  targetModuleRuleConfig: ConfigModuleSameContents,
): RuleResult[] => {
  let results: RuleResult[] = [];

  // check each file in module against ref module file
  for (const filename in targetModuleRuleConfig.files) {
    // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unnecessary-condition
    if (!targetModuleRuleConfig.files || !targetModuleRuleConfig.files.hasOwnProperty(filename)) {
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
      for (const selconf in fileConfig.selectors) {
        // eslint-disable-next-line no-prototype-builtins
        if (!fileConfig.selectors.hasOwnProperty(selconf)) {
          continue;
        }
        let strictSelector = false;
        let selector = selconf;
        if (Array.isArray(fileConfig.selectors)) {
          selector = fileConfig.selectors[parseInt(selconf, 10)];
        } else {
          strictSelector = fileConfig.selectors[selconf];
        }
        const presults = checkPartialSimilarity({
          selector,
          strictSelector,
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
    // prettier-ignore
    const valid = (sp >= minSimilarity);
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

const checkPartialSimilarity = (pp: {
  selector: string;
  strictSelector: boolean;
  refFilePath: string;
  targetModule: Module;
  targetFilePath: string;
  minSimilarity: number;
  refModule: Module;
}): RuleResult[] => {
  const results: RuleResult[] = [];

  // check if contents exists on reference file
  const contentsRef = loadContents(pp.refFilePath);
  if (pp.selector !== '') {
    const partial1 = jmespath.search(contentsRef, quoteQuery(pp.selector));
    if (!partial1 && pp.strictSelector) {
      results.push({
        valid: false,
        resource: `${pp.refFilePath}[${pp.selector}]`,
        message: 'Required content on reference file not found',
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

  // minSim is NaN when content is not found in source file
  if (Number.isNaN(pp.minSimilarity) || Number.isNaN(sp._all)) {
    // when not strict, skip this validation
    if (!pp.strictSelector) {
      return results;
    }
    results.push({
      valid: false,
      resource: `${pp.targetFilePath}[${pp.selector}]`,
      message: `Required content not found at '${pp.refFilePath}[${pp.selector}]'`,
      rule: rule.name,
      module: pp.targetModule,
    });
    return results;
  }

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

  // generate detailed results for failed checks
  for (const key in sp) {
    if (key === '_all') {
      continue;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!sp.hasOwnProperty(key)) {
      continue;
    }

    if (sp[key] >= pp.minSimilarity) {
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
