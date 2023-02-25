import { resolve } from 'path';

import { Config, ConfigModuleSameContents } from '../types/Config';

import { loadBaseConfig, mergeConfigs, resolveModuleConfig } from './config-resolver';

describe('when merging two configurations', () => {
  it('module-markers should be concated', async () => {
    const config1: Config = {
      'module-markers': ['file1', 'file2'],
    };
    const config2: Config = {
      'module-markers': ['file3', 'file2'],
    };
    const config3 = mergeConfigs(config1, config2);
    expect(config3['module-markers']?.includes('file1')).toBeTruthy();
    expect(config3['module-markers']?.includes('file2')).toBeTruthy();
    expect(config3['module-markers']?.includes('file3')).toBeTruthy();
  });

  it('parent should be overriten by child', async () => {
    const config1: Config = {
      'use-gitignore': false,
    };
    const config2: Config = {
      'use-gitignore': true,
    };
    const config3 = mergeConfigs(config1, config2);
    expect(config3['use-gitignore']).toBeTruthy();
  });

  it('parent rules should be merged to child', async () => {
    const config1: Config = {
      rules: {
        rule1: true,
        rule2: true,
        rulea: {
          'reference-module': 'test1',
        } as ConfigModuleSameContents,
      },
    };
    const config2: Config = {
      rules: {
        rule2: false,
        rule3: true,
        rulea: {
          'reference-module': 'test2',
        } as ConfigModuleSameContents,
      },
    };
    const config3 = mergeConfigs(config1, config2);

    const rulea = config3.rules?.rulea as ConfigModuleSameContents;
    expect(config3.rules?.rule1).toBeTruthy();
    expect(config3.rules?.rule2).toBeFalsy();
    expect(config3.rules?.rule3).toBeTruthy();
    expect(rulea['reference-module']).toEqual('test2');
  });

  it("extends shouldn't be merged to avoid duplication in tree", async () => {
    const config1: Config = {
      extends: ['abc', 'xyz'],
    };
    const config2: Config = {
      extends: ['wyz'],
    };
    const config3 = mergeConfigs(config1, config2);
    expect(config3.extends).toBeUndefined();
  });
});

const baseDir = resolve('src/rules/test-cases/config-resolver');

describe('when loading base config with default contents', () => {
  it('loadBaseConfig .monolint.json', async () => {
    const config = loadBaseConfig(baseDir, '.monolint.json');
    expect(config['module-markers']).toEqual(['package.json', 'serverless.yml']);
    expect(config['use-gitignore']).toBeTruthy();
    expect(config.rules).toBeDefined();
    if (!config.rules) throw new Error('shouldnt be null');
    expect(config.rules['serverless-same-name']).toBeTruthy();

    const config2 = loadBaseConfig(baseDir, '.monolint.json');
    expect(config).toEqual(config2);
  });

  it('loadBaseConfig .monolint2.json with no default extensions', async () => {
    const config = loadBaseConfig(baseDir, '.monolint2.json');
    expect(config['module-markers']).toEqual(['go.mod']);
    expect(config['use-gitignore']).toBeFalsy();
    expect(config.rules).toBeDefined();
    if (!config.rules) throw new Error('shouldnt be null');
    expect(config.rules).toEqual({
      'packagejson-same-name': true,
    });
  });
});

describe('when loading config for a module', () => {
  it('base with existing config file should extend monolint:recommended', async () => {
    const config = resolveModuleConfig(baseDir, baseDir, '.monolint.json');
    if (!config.rules) {
      throw new Error('rules should be defined');
    }
    expect(config.rules['module-name-regex']).toBeTruthy();
    expect(config.rules['module-same-contents']).toBeTruthy();
    expect(config.rules['serverless-same-name']).toBeTruthy();
  });

  it('base without config file should extend monolint:recommended', async () => {
    const config = resolveModuleConfig(baseDir, baseDir, '.monolint111.json');
    if (!config.rules) {
      throw new Error('default rules should be present');
    }
    expect(config.rules['module-name-regex']).toBeTruthy();
    expect(config.rules['module-same-contents']).toBeTruthy();
    expect(config.rules['serverless-same-name']).toBeTruthy();
  });

  it('/mod1 should include monolint:serverless configs', async () => {
    const config = resolveModuleConfig(`${baseDir}/mod1`, baseDir, '.monolint.json');
    if (!config.rules) {
      throw new Error('rules should be defined');
    }
    expect(config.rules['module-name-regex']).toBeTruthy();
    expect(config.rules['module-same-contents']).toBeFalsy();
    expect(config.rules['serverless-same-name']).toBeTruthy();
  });

  it('/mod1/mod2 should be the same as /mod1', async () => {
    const config1 = resolveModuleConfig(`${baseDir}/mod1`, baseDir, '.monolint.json');
    const config2 = resolveModuleConfig(`${baseDir}/mod1/mod2`, baseDir, '.monolint.json');
    expect(config1).toEqual(config2);
  });

  it('/mod1/mod2/mod3 should have serverless, but disable module-name-regex', async () => {
    const config = resolveModuleConfig(`${baseDir}/mod1/mod2/mod3`, baseDir, '.monolint.json');
    if (!config.rules) {
      throw new Error('rules should be defined');
    }
    expect(config.rules['module-name-regex']).toBeFalsy();
    expect(config.rules['module-same-contents']).toBeFalsy();
    expect(config.rules['serverless-same-name']).toBeTruthy();
  });
});
