import { loadBaseConfig } from './utils';

const baseDir = 'src/rules/test-monorepo';

describe('utils', () => {

  it('loadBaseConfig .monolinter.json', async () => {
    const config = loadBaseConfig(baseDir, null);
    expect(config['module-markers']).toEqual(['package.json', 'serverless.yml', 'go.mod']);
    expect(config.rules).toBeDefined();
    if (config.rules) {
      expect(config.rules['serverless-same-name']).toBeTruthy();
    }

    const config2 = loadBaseConfig(baseDir, '.monolinter.json');
    expect(config).toEqual(config2);
  });

  it('loadBaseConfig .monolinter2.json', async () => {
    const config = loadBaseConfig(baseDir, '.monolinter2.json');
    expect(config['module-markers']).toEqual(['_thisisamodule']);
    expect(config.rules).toBeDefined();
    if (config.rules) {
      expect(config.rules).toEqual({
        'packagejson-same-name': true,
      });
    }
  });

});
