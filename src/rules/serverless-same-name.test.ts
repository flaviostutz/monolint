import { discoverModules } from '../lint';
import { loadBaseConfig } from '../utils/config';

import rule from './serverless-same-name';

const baseDir = 'src/rules/test-cases/general';
const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
const modules = discoverModules(baseDir, baseConfig);

describe('serverless-same-name', () => {
  it('serverless with different service name is invalid', async () => {
    const results = rule.checkModules(modules, baseDir);
    expect(results).toHaveLength(4);
    if (results) {
      expect(results[0].resource.includes('serverless.yml')).toBeTruthy();
      expect(results[0].module?.name).toEqual('mod2-svc');
      expect(results[0].valid).toBeFalsy();

      expect(results[1].resource.includes('serverless.yml')).toBeTruthy();
      expect(results[1].module?.name).toEqual('mod4-svc');
      expect(results[1].valid).toBeTruthy();

      expect(results[2].resource.includes('serverless.yml')).toBeTruthy();
      expect(results[2].module?.name).toEqual('mod5-thx');
      expect(results[2].valid).toBeTruthy();
    }
  });
});
