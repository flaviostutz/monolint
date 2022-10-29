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

      const parentFolderPatternsList = rules['module-parent-folder'] as ConfigModuleParentFolder;
      if (parentFolderPatternsList.length === 0) {
        continue;
      }

      // then, get the parent folder name
      const parentFolderName = module.path.split('/').slice(-2)[0];
      // then, check if the parent folder matches any of the patterns
      const parentFolderMatches = parentFolderPatternsList.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(parentFolderName);
      });
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
    return '* Check whether all module folders has a parent folder, following the `glob` path pattern';
  },

  docExampleConfigs(): RuleExample[] {
    return [
      {
        description: 'Deactivates this rule',
        config: false,
      },
    ];
  },
};

export default rule;
