import fg from 'fast-glob';

import { ConfigModuleParentFolder } from '../types/Config';
import { Module } from '../types/Module';
import { Rule } from '../types/Rule';
import { RuleExample } from '../types/RuleExample';
import { RuleResult } from '../types/RuleResult';

const rule: Rule = {
  name: 'module-parent-folder',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    const results: RuleResult[] = [];
    for (const module of modules) {
      // first, get the rule reference from the module
      const { rules } = module.config;
      if (!rules || !rules['module-parent-folder']) {
        continue;
      }

      const parentFolderPatternsListOriginal = rules[
        'module-parent-folder'
      ] as ConfigModuleParentFolder;
      if (parentFolderPatternsListOriginal.length === 0) {
        continue;
      }

      const parentFolderPatternsList = parentFolderPatternsListOriginal.map((pattern) => {
        let patternAug = pattern;
        if (!patternAug.startsWith('**/')) {
          patternAug = `**/${patternAug}`;
        }
        if (!patternAug.endsWith('/*')) {
          patternAug = `${patternAug}/*/*`;
        }
        return patternAug;
      });

      // then, get the parent folder name
      const parentFolderName = module.path.split('/').slice(-2)[0];
      // then, check if the parent folder matches any of the patterns
      const entries = fg.sync(parentFolderPatternsList, {
        dot: true,
        globstar: true,
        extglob: true,
      });

      const parentFolderMatches = entries.some((pattern) => {
        const patternParts = pattern.split('/');
        const patternPartsLength = patternParts.length;
        const parentFolderNamePattern = patternParts[patternPartsLength - 3];
        return parentFolderNamePattern === parentFolderName;
      });
      // const parentFolderMatches = parentFolderPatternsList.some((pattern) => {
      //   const regex = new RegExp(pattern);
      //   return regex.test(parentFolderName);
      // });
      if (parentFolderMatches) {
        results.push({
          valid: true,
          resource: module.path,
          message: 'Module parent folder name is valid',
          rule: rule.name,
          module,
        });
      } else {
        results.push({
          valid: false,
          resource: module.path,
          message: `Module parent folder name does not match any of the patterns: ${parentFolderPatternsList.join(
            // eslint-disable-next-line comma-dangle
            ', '
          )}`,
          rule: rule.name,
          module,
        });
      }
    }

    return results;
  },

  check(): RuleResult[] | null {
    return null;
  },

  docMarkdown(): string {
    return '* Check whether all module folders has a parent folder, allowing the usage of `glob` path pattern';
  },

  docExampleConfigs(): RuleExample[] {
    return [
      {
        description: 'Deactivates this rule',
        config: false,
      },
      {
        description:
          "All modules should have the following possible parent folders: 'packages', 'apps', 'libs', 'services'",
        config: {
          'module-parent-folder': ['packages', 'apps', 'libs', 'services'],
        },
      },
      {
        description:
          "All modules should be in a folder named 'package' that is a descendant of a folder named 'apps'",
        config: {
          'module-parent-folder': ['apps/**/packages'],
        },
      },
      {
        description: "All modules should have a parent folder named 'modules'",
        config: {
          'module-parent-folder': ['modules'],
        },
      },
    ];
  },
};

export default rule;
