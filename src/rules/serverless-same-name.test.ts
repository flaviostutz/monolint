import fs from 'fs-extra';

import { loadBaseConfig } from '../config/config-resolver';
import { discoverModules } from '../modules';
import { FixType } from '../types/FixResult';

import rule from './serverless-same-name';

describe('when only checking serverless-same-name', () => {
  const baseDir = 'src/rules/test-cases/general';
  const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
  const modules = discoverModules(baseDir, baseConfig, '.monolint.json');

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

describe('when fixing with serverless-same-name', () => {
  it('should fix serverless "service" attribute in file automatically and return success', async () => {
    // make a copy of test-case dir for fix tests
    const baseDir = 'src/rules/.tmp/ssn/test-cases/general';
    fs.rmSync(baseDir, { recursive: true, force: true });
    fs.copySync('src/rules/test-cases/general', baseDir);

    const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
    const modules = discoverModules(baseDir, baseConfig, '.monolint.json');

    // check
    const checked1 = rule.checkModules(modules, baseDir, false);
    if (!checked1) {
      throw new Error("checked1 shouldn't be null");
    }
    console.log(JSON.stringify(checked1));
    expect(checked1.filter((rr) => !rr.valid).length).toBe(2);

    // fix
    const checked2 = rule.checkModules(modules, baseDir, true);
    if (!checked2) {
      throw new Error("checked2 shouldn't be null");
    }
    console.log(JSON.stringify(checked2));
    expect(checked2.filter((rr) => rr.fixResult?.type === FixType.Fixed).length).toBe(2);

    // check again
    const checked3 = rule.checkModules(modules, baseDir, false);
    if (!checked3) {
      throw new Error("checked3 shouldn't be null");
    }
    console.log(JSON.stringify(checked3));
    expect(checked3.filter((rr) => !rr.valid).length).toBe(0);
  });
});
