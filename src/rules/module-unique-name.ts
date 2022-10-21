import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';

const rule: Rule = {
  name: 'module-unique-name',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    const results: RuleResult[] = [];

    for (let i = 0; i < modules.length; i += 1) {
      // const module = modules[i];
      // results.push({
      //   valid: false,
      //   resource: slsFile,
      //   message: `Attribute 'service' should be '${module.name}'`,
      //   rule: rule.name,
      //   module,
      // });
      // results.push({
      //   valid: true,
      //   resource: slsFile,
      //   message: '"service" is valid',
      //   rule: rule.name,
      //   module,
      // });
      // }
    }
    return results;
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

export default rule;
