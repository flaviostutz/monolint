import { discoverModules } from '../lint';
import { loadBaseConfig } from '../utils/config';

import rule from './module-same-contents';

const baseDir = 'src/rules/test-monorepo';
const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
const modules = discoverModules(baseDir, baseConfig);

describe('module-same-contents', () => {
  it('check file contents with defaults', async () => {
    const results = rule.checkModules(modules, baseDir);
    const sresults = results?.filter((rr) => rr.valid && rr.rule === 'module-same-contents');

    expect(sresults).toHaveLength(1);
    if (sresults) {
      expect(sresults[0].module?.name).toEqual('mod5-thx');
      expect(sresults[0].valid).toBeFalsy();
    }

    const fresults = results?.filter((rr) => !rr.valid && rr.rule === 'module-same-contents');
    expect(fresults).toHaveLength(1);
    if (fresults) {
      expect(fresults[0].module?.name).toEqual('mod5-thx');
      expect(fresults[0].valid).toBeFalsy();
    }

  });
});
