import { loadBaseConfig } from '../config/config-resolver';
import { discoverModules } from '../lint';

import rule from './module-parent-folder';

const baseTestcaseDir = 'src/rules/test-cases/module-parent-folder';

describe('given a rule config specifying parent folder directly, without glob pattern', () => {
  test('when the parent folder exists, it should succeed', async () => {
    const testCaseDir = `${baseTestcaseDir}/success/mod1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(1);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-success-mod1');
      expect(results[0].valid).toBeTruthy();
    }
  });

  test('when the parent folder doest not exists in a non-nested scenario, it should fail', async () => {
    const testCaseDir = `${baseTestcaseDir}/error/mod1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(1);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-error-mod1-simple');
      expect(results[0].valid).toBeFalsy();
    }
  });

  test('when the parent folder doest not exists in a simple nested scenario, it should fail', async () => {
    const testCaseDir = `${baseTestcaseDir}/error/group1/mod2-g1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(2);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-error-mod1-simple');
      expect(results[0].valid).toBeFalsy();
      expect(results[1].module?.name).toEqual('mod-error-mod2-g1-2');
      expect(results[1].valid).toBeFalsy();
    }
  });

  test('when the parent folder doest not exists in a simple nested scenario with different folder names, it should fail', async () => {
    const testCaseDir = `${baseTestcaseDir}/error/group2`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(4);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-error-mod1-simple-lib-error-1');
      expect(results[0].valid).toBeFalsy();
      expect(results[1].module?.name).toEqual('mod-error-mod1-simple-lib-error-2');
      expect(results[1].valid).toBeFalsy();
      expect(results[2].module?.name).toEqual('mod-error-mod1-simple-service-ok-1');
      expect(results[2].valid).toBeTruthy();
      expect(results[3].module?.name).toEqual('mod-error-mod1-simple-web-ok-1');
      expect(results[3].valid).toBeTruthy();
    }
  });

  test('when the parent folder doest not exists in a complex nested scenario, it should fail', async () => {
    const testCaseDir = `${baseTestcaseDir}/error/group1/mods1-g1/mod2-s1-g1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(1);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-error-mods1-g1-mod2-s1-g1');
      expect(results[0].valid).toBeFalsy();
    }
  });
});

describe('given a rule config specifying parent folder directly with glob pattern', () => {
  test('when the glob expression doesnt match the path, it should fail', async () => {
    const testCaseDir = `${baseTestcaseDir}/error/group1/mods1-g1/mod1-s1-g1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(1);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-error-g1-mods1-s1-g1');
      expect(results[0].valid).toBeFalsy();
    }
  });

  test('when the glob expression match the path from anything until the parent, it should succeed', async () => {
    const testCaseDir = `${baseTestcaseDir}/success/group1/mod1-g1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(2);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-success-mod1-g1-1');
      expect(results[0].valid).toBeTruthy();
      expect(results[1].module?.name).toEqual('mod-success-mod1-g1-2');
      expect(results[1].valid).toBeTruthy();
    }
  });

  test('when the config specifies empty array of files, it should succeed', async () => {
    const testCaseDir = `${baseTestcaseDir}/success/group1/mod2-g1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(1);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-success-mod2-g1');
      expect(results[0].valid).toBeTruthy();
    }
  });

  test('when the config specifies a glob for one folder->anything->parent_folder, it should succeed', async () => {
    const testCaseDir = `${baseTestcaseDir}/success/group1/mods3-g1/mod3-s1-g1`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(2);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-success-mods3-g1-mod3-s1-g1-1');
      expect(results[0].valid).toBeTruthy();
      expect(results[1].module?.name).toEqual('mod-success-mods3-g1-mod3-s1-g1-2');
      expect(results[1].valid).toBeTruthy();
    }
  });

  test('when the config specifies a glob for one folder->anything, it should succeed', async () => {
    const testCaseDir = `${baseTestcaseDir}/success/group1/mods3-g1/mods3-s2-g2`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(3);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-success-mods3-g1-mod3-s1-g1-mod3-s2-mods1-1-1');
      expect(results[0].valid).toBeTruthy();
      expect(results[1].module?.name).toEqual('mod-success-mods3-g1-mod3-s1-g1-mod3-s2-mods1-1-2');
      expect(results[1].valid).toBeTruthy();
      expect(results[2].module?.name).toEqual('mod-success-mods3-g1-mod3-s1-g1-mod3-s2-mods1-2');
      expect(results[2].valid).toBeTruthy();
    }
  });

  test('when the config specifies a list of folder with one for glob, it should succeed', async () => {
    const testCaseDir = `${baseTestcaseDir}/success/group2`;
    const baseConfig = loadBaseConfig(testCaseDir, '.monolint.json');
    const modules = discoverModules(testCaseDir, baseConfig, '.monolint.json');

    const results = rule.checkModules(modules, testCaseDir);
    expect(results).toHaveLength(4);
    if (results) {
      expect(results[0].module?.name).toEqual('mod-error-mod1-simple-lib-success-1');
      expect(results[0].valid).toBeTruthy();
      expect(results[1].module?.name).toEqual('mod-error-mod1-simple-lib-success-2');
      expect(results[1].valid).toBeTruthy();
      expect(results[2].module?.name).toEqual('mod-success-mod1-simple-service-ok-1');
      expect(results[2].valid).toBeTruthy();
      expect(results[3].module?.name).toEqual('mod-success-mod1-simple-web-ok-1');
      expect(results[3].valid).toBeTruthy();
    }
  });
});
