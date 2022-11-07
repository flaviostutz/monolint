import { loadModulesForRule } from '../utils/tests';

import rule from './module-unique-name';

const baseDir = 'src/rules/test-cases/general';

describe('using default configurations on general monorepo', () => {
  const modules = loadModulesForRule(baseDir, '.monolint.json', 'module-unique-name');

  it('names should be unique', async () => {
    const results = rule.checkModules(modules, baseDir);
    const fresults = results?.filter((rr) => !rr.valid);
    expect(fresults).toHaveLength(2);
    if (fresults) {
      expect(fresults[0].module?.name).toEqual('mod5-thx');
      expect(fresults[0].valid).toBeFalsy();
      expect(fresults[1].module?.name).toEqual('mod5-thx');
      expect(fresults[1].valid).toBeFalsy();

      const m0p = fresults[0].module?.path;
      const m1p = fresults[1].module?.path;

      expect(m1p).toBeDefined();
      if (m1p) {
        expect(fresults[0].message?.includes(m1p));
      }
      expect(m0p).toBeDefined();
      if (m0p) {
        expect(fresults[1].message?.includes(m0p));
      }
    }
  });
});
