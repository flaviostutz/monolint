import { loadBaseConfig } from './config';

const baseDir = 'src/rules/test-monorepo';

describe('utils', () => {
  it('loadBaseConfig .monolint.json', async () => {
    const config = loadBaseConfig(baseDir, null);
    expect(config['module-markers']).toEqual(['package.json', 'serverless.yml', 'go.mod']);
    expect(config.rules).toBeDefined();
    if (config.rules) {
      expect(config.rules['serverless-same-name']).toBeTruthy();
    }

    const config2 = loadBaseConfig(baseDir, '.monolint.json');
    expect(config).toEqual(config2);
  });

  it('loadBaseConfig .monolint2.json', async () => {
    const config = loadBaseConfig(baseDir, '.monolint2.json');
    expect(config['module-markers']).toEqual(['_thisisamodule']);
    expect(config.rules).toBeDefined();
    if (config.rules) {
      expect(config.rules).toEqual({
        'packagejson-same-name': true,
      });
    }
  });
});
