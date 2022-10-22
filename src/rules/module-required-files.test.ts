import fs from 'fs';

import { discoverModules } from '../lint';
import { loadBaseConfig } from '../utils/config';

import rule from './module-required-files';

describe('given a folder with non-strict config', () => {
  const baseDir = 'src/rules/test-cases/module-required-files/non-strict';

  describe('when required files not found in folder', () => {
    const testCaseDir = `${baseDir}/mod-non-strict-error-1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig);

    it('then should return error', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(3);
      if (results) {
        expect(results[0].resource.includes('README.md')).toBeTruthy();
        expect(results[1].resource.includes('serverless.yml')).toBeTruthy();
        expect(results[2].resource.includes('package.json')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod-non-strict-error-1');
        expect(results[1].module?.name).toEqual('mod-non-strict-error-1');
        expect(results[2].module?.name).toEqual('mod-non-strict-error-1');
        expect(results[0].valid).toBeFalsy();
        expect(results[1].valid).toBeTruthy();
        expect(results[2].valid).toBeTruthy();
      }
    });
  });

  describe('when required files not found in all child folders', () => {
    const testCaseDir = `${baseDir}/group-error-2`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig);

    it('then should return error', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(4);
      if (results) {
        expect(results[0].resource.includes('README.md')).toBeTruthy();
        expect(results[1].resource.includes('package.json')).toBeTruthy();
        expect(results[2].resource.includes('README.md')).toBeTruthy();
        expect(results[3].resource.includes('package.json')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod-e-ns-1');
        expect(results[1].module?.name).toEqual('mod-e-ns-1');
        expect(results[2].module?.name).toEqual('mod-e-ns-2');
        expect(results[3].module?.name).toEqual('mod-e-ns-2');
        expect(results[0].valid).toBeTruthy();
        expect(results[1].valid).toBeTruthy();
        expect(results[2].valid).toBeFalsy();
        expect(results[3].valid).toBeTruthy();
      }
    });
  });

  describe('when files in folder beyond the required', () => {
    const testCaseDir = `${baseDir}/mod-non-strict-success-1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig);

    it('then should return success', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(2);
      if (results) {
        expect(results[0].resource.includes('serverless.yml')).toBeTruthy();
        expect(results[1].resource.includes('package.json')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod-non-strict-success-1');
        expect(results[1].module?.name).toEqual('mod-non-strict-success-1');
        expect(results[0].valid).toBeTruthy();
        expect(results[1].valid).toBeTruthy();
      }
    });
  });

  describe('when files in folder exactly the required', () => {
    const testCaseDir = `${baseDir}/mod-non-strict-success-2`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig);

    it('then should return success', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(2);
      if (results) {
        expect(results[0].resource.includes('serverless.yml')).toBeTruthy();
        expect(results[1].resource.includes('package.json')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod-non-strict-success-2');
        expect(results[1].module?.name).toEqual('mod-non-strict-success-2');
        expect(results[0].valid).toBeTruthy();
        expect(results[1].valid).toBeTruthy();
      }
    });
  });
});

describe('given a folder with strict config', () => {
  const baseDir = 'src/rules/test-cases/module-required-files/strict';

  describe('when files beyond required found in folder', () => {
    const testCaseDir = `${baseDir}/mod-strict-error-1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig);

    it('then should return error', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(2);
      if (results) {
        expect(results[0].resource.includes('serverless.yml')).toBeTruthy();
        expect(results[1].resource.includes('package.json')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod-strict-error-1');
        expect(results[1].module?.name).toEqual('mod-strict-error-1');
        expect(results[0].valid).toBeTruthy();
        expect(results[1].valid).toBeFalsy();
      }
    });
  });

  describe('when required files not found in folder', () => {
    const testCaseDir = `${baseDir}/mod-strict-error-2`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig);

    it('then should return error', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(4);
      if (results) {
        expect(results[0].resource.includes('README.md')).toBeTruthy();
        expect(results[1].resource.includes('CONTRIBUTING.md')).toBeTruthy();
        expect(results[2].resource.includes('LICENSE')).toBeTruthy();
        expect(results[3].resource.includes('serverless.yml')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod-strict-error-2');
        expect(results[1].module?.name).toEqual('mod-strict-error-2');
        expect(results[2].module?.name).toEqual('mod-strict-error-2');
        expect(results[3].module?.name).toEqual('mod-strict-error-2');

        expect(results[0].valid).toBeFalsy();
        expect(results[1].valid).toBeFalsy();
        expect(results[2].valid).toBeFalsy();
        expect(results[3].valid).toBeFalsy();
      }
    });
  });

  describe('when required files found in folder', () => {
    const testCaseDir = `${baseDir}/mod-strict-success-1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig);
    // create node_modules to simulate the .gitignore behavior
    if (!fs.existsSync(`${testCaseDir}/node_modules`)) {
      fs.mkdirSync(`${testCaseDir}/node_modules`);
    }

    it('then should return success', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(1);
      if (results) {
        expect(results[0].resource.includes('serverless.yml')).toBeTruthy();
        expect(results[0].module?.name).toEqual('mod-strict-success-1');
        expect(results[0].valid).toBeTruthy();
      }
    });
  });
});
