import { discoverModules, loadBaseConfig } from '../lint';

import rule from './packagejson-same-name';

const baseDir = 'src/rules/test-monorepo';
const baseConfig = loadBaseConfig(baseDir);
const modules = discoverModules(baseDir, baseConfig);

describe('packagejson-same-name', () => {

  it('package.json with different name is invalid', async () => {
    const results = rule.checkModules(modules, baseDir);
    expect(results).toHaveLength(4);
    if (results) {
      expect(results[0].resource.includes('package.json')).toBeTruthy();
      expect(results[0].module?.name).toEqual('mod1-js');
      expect(results[0].valid).toBeFalsy();

      expect(results[1].resource.includes('package.json')).toBeTruthy();
      expect(results[1].module?.name).toEqual('mod4-svc');
      expect(results[1].valid).toBeTruthy();

      expect(results[2].resource.includes('package.json')).toBeTruthy();
      expect(results[2].module?.name).toEqual('mod5-thx');
      expect(results[2].valid).toBeTruthy();

      expect(results[3].resource.includes('package.json')).toBeTruthy();
      expect(results[3].module?.name).toEqual('mod5-thx');
      expect(results[3].valid).toBeFalsy();
}
  });

});
