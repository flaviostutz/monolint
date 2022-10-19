import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';

const rule:Rule = {
  name: 'module-name-regex',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    const results: RuleResult[] = [];

    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];

      const config = module.enabledRules['module-name-regex'].ruleConfig;

      let regex = '[a-z]+[a-z0-9-_]{4,12}';

      if (typeof config !== 'string' && typeof config !== 'boolean') {
        results.push({
          valid: false,
          resource: module.path,
          message: `Invalid config '${JSON.stringify(config)}'`,
          rule: rule.name,
          module,
        });
        continue;
      }

      if (typeof config === 'string') {
        regex = config;
      }

      const re = new RegExp(regex);
      if (!re.test(module.name)) {
        results.push({
          valid: false,
          resource: module.path,
          message: `Module name should match regex "${regex}"`,
          rule: rule.name,
          module,
        });
        continue;
      }

      results.push({
        valid: true,
        resource: module.path,
        message: 'Module name is valid',
        rule: rule.name,
        module,
      });
    }

    return results;
  },
  check(): RuleResult[] | null {
    return null;
  },
  docMarkdown(): string {
    return '* Check if "name" attribute of the package.json file equals (or ends with) the name of the module';
  },
  docExampleConfigs(): RuleExample[] {
    return [
      {
        description: 'Activates this rule with default regex "[a-z]+[a-z0-9-_]{4,12}"',
        config: true,
      },
      {
        description: 'Deactivates this rule',
        config: false,
      },
      {
        description: 'Module names should be sufixed by "-svc" or "web"',
        config: '.+(-svc|-web)',
      },
    ];
  },
};

export default rule;
