import { resolve } from 'path';

import { loadModulesForRule } from '../utils/tests';

import rule from './module-name-regex';

const baseDir = resolve('src/rules/test-cases/general');
const ruleModules = loadModulesForRule(baseDir, '.monolint.json', 'module-name-regex');

describe('module-name-regex', () => {
  it('check module names', async () => {
    const results = rule.checkModules(ruleModules, baseDir);
    expect(results).toHaveLength(6);
    if (results) {
      expect(results[0].resource.endsWith('mod1-js')).toBeTruthy();
      expect(results[0].module?.name).toEqual('mod1-js');
      expect(results[0].valid).toBeTruthy();

      expect(results[4].resource.endsWith('mod6-abc')).toBeTruthy();
      expect(results[4].module?.name).toEqual('mod6-abc');
      expect(results[4].valid).toBeTruthy();

      expect(results[5].resource.endsWith('mod7-xyz')).toBeTruthy();
      expect(results[5].module?.name).toEqual('mod7-xyz');
      expect(results[5].valid).toBeFalsy();
    }
  });
});
