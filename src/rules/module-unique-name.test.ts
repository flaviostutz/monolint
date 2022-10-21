import { discoverModules } from '../lint';
import { loadBaseConfig } from '../utils/config';

import rule from './module-unique-name';

const baseDir = 'src/rules/test-cases/general';
const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
const modules = discoverModules(baseDir, baseConfig);

describe('module-unique-name', () => {
  it('check if names are unique', async () => {
    const results = rule.checkModules(modules, baseDir);
    const fresults = results?.filter((rr) => !rr.valid && rr.rule === 'module-unique-name');
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
