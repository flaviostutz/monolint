import { Rule } from '../types/Rule';
import { Module } from '../types/Module';
import { RuleResult } from '../types/RuleResult';
import { RuleExample } from '../types/RuleExample';

const rule: Rule = {
  name: 'module-unique-name',

  checkModules: (modules: Module[]): RuleResult[] | null => {
    const results: RuleResult[] = [];

    const modulesMap: Record<string, Module[] | undefined> = {};

    // map all
    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];
      if (!modulesMap[module.name]) {
        modulesMap[module.name] = [];
      }
      modulesMap[module.name]?.push(module);
    }

    // check all
    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];
      const sameNames = modulesMap[module.name];
      const otherModule = sameNames?.filter((mm) => mm.path !== module.path);
      if (otherModule && otherModule.length > 0) {
        results.push({
          valid: false,
          resource: module.path,
          message: `Module has the same name as '${otherModule[0].path}'`,
          rule: rule.name,
          module,
        });
        continue;
      }
      results.push({
        valid: true,
        resource: module.path,
        message: 'Module name is unique',
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
    return '* Checks if the name of the modules are unique in the entire monorepo, regardless of the which folder it is present';
  },
  docExampleConfigs(): RuleExample[] {
    return [
      {
        description: 'Disable this rule',
        config: false,
      },
    ];
  },
};

export default rule;
