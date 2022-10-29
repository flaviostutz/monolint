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
