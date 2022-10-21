
import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';

const rule: Rule = {
  name: 'module-required-files',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    const results: RuleResult[] = [];

    return results;
  },
  check(): RuleResult[] | null {
    return null;
  },
  docMarkdown(): string {
    return '* Check if all the required files are present in the folder';
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
