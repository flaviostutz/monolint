import { discoverModules } from '../lint';
import { loadBaseConfig } from '../utils/config';

import rule from './module-unique-name';

const baseDir = 'src/rules/test-cases/general';
const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
const modules = discoverModules(baseDir, baseConfig);

describe('module-unique-name', () => {
  it('check if names are unique', async () => {
    const results = rule.checkModules(modules, baseDir);
    expect(results).toHaveLength(6);
    if (results) {
      expect(results[0].resource.includes('package.json')).toBeTruthy();
      expect(results[0].module?.name).toEqual('mod1-js');
      expect(results[0].valid).toBeFalsy();
    }
  });
});
