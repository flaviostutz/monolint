import { resolve } from 'path';

import fs from 'fs-extra';

import { loadBaseConfig } from '../config/config-resolver';
import { discoverModules } from '../modules';
import { FixType } from '../types/FixResult';

import rule from './packagejson-same-name';

describe('packagejson-same-name', () => {
  const baseDir = resolve('src/rules/test-cases/general');
  const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
  const modules = discoverModules(baseDir, baseConfig, '.monolint.json');

  it('package.json with different name is invalid', async () => {
    const results = rule.checkModules(modules, baseDir);
    expect(results).toHaveLength(6);
    if (!results) throw new Error('shouldnt be null');
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
  });
});

describe('when fixing with packagejson-same-name', () => {
  it('should fix package name in file automatically and return success', async () => {
    // make a copy of test-case dir for fix tests
    const baseDir = resolve('src/rules/.tmp/psn/test-cases/general');
    fs.rmSync(baseDir, { recursive: true, force: true });
    fs.copySync('src/rules/test-cases/general', baseDir);

    const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
    const modules = discoverModules(baseDir, baseConfig, '.monolint.json');

    // check
    const checked1 = rule.checkModules(modules, baseDir, false);
    if (!checked1) {
      throw new Error("checked1 shouldn't be null");
    }
    expect(checked1.filter((rr) => !rr.valid).length).toBe(4);

    // fix
    const checked2 = rule.checkModules(modules, baseDir, true);
    if (!checked2) {
      throw new Error("checked2 shouldn't be null");
    }
    expect(checked2.filter((rr) => rr.fixResult?.type === FixType.Fixed).length).toBe(4);

    // check again
    const checked3 = rule.checkModules(modules, baseDir, false);
    if (!checked3) {
      throw new Error("checked3 shouldn't be null");
    }
    expect(checked3.filter((rr) => !rr.valid).length).toBe(0);
  });
});
