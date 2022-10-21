import { discoverModules } from '../lint';
import { loadBaseConfig } from '../utils/config';

import rule from './module-required-files';

describe('given a folder with non-strict config', () => {

  const baseDir = 'src/rules/test-cases/module-requrired-files/non-strict';

  describe('when required files not found in folder', () => {
    const baseConfig = loadBaseConfig(`${baseDir}/mod-error-1`, '.monolint.json');
    const modules = discoverModules(baseDir, baseConfig);

    it('then should return error', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(6);
      if (results) {
        expect(results[0].resource.includes('package.json')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod1-js');
        expect(results[0].valid).toBeFalsy();
      }
    });
  });

  describe('when files in folder beyond the required', () => {
    const baseConfig = loadBaseConfig(`${baseDir}/mod-success-1`, '.monolint.json');
    const modules = discoverModules(baseDir, baseConfig);

    it('then should return success', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(6);
      if (results) {
        expect(results[0].resource.includes('package.json')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod1-js');
        expect(results[0].valid).toBeFalsy();
      }
    });
  });

  describe('when files in folder exactly the required', () => {
    const baseConfig = loadBaseConfig(`${baseDir}/mod-success-2`, '.monolint.json');
    const modules = discoverModules(baseDir, baseConfig);

    it('then should return success', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(6);
      if (results) {
        expect(results[0].resource.includes('package.json')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod1-js');
        expect(results[0].valid).toBeFalsy();
      }
    });

  });
});
