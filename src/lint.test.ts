import { lint, discoverModules } from './lint';

const baseDir = 'src/rules/test-monorepo';

describe('lint', () => {

  it('discoverModules by marker', async () => {
    const results = discoverModules(baseDir, '.monolinter2.json');
    expect(results).toHaveLength(1);
    expect(results[0].path.includes('group1')).toBeTruthy();
    expect(results[0].name).toEqual('mod3-svc');
  });

  it('discoverModules by marker considering duplicate and ignoring folders', async () => {
    const results = discoverModules(baseDir, null);
    expect(results).toHaveLength(7);
  });

  it('discoverModules and check config hierarchy', async () => {
    const results = discoverModules(baseDir, null);
    expect(results).toHaveLength(7);

    expect(results[5].config.rules).toBeDefined();
    if (results[5].config.rules) {
      expect(results[5].config.rules['serverless-same-name']).toBeFalsy();
      expect(results[5].config.rules['packagejson-same-name']).toBeFalsy();
    }

    expect(results[6].config.rules).toBeDefined();
    if (results[6].config.rules) {
      expect(results[6].config.rules['serverless-same-name']).toBeTruthy();
      expect(results[6].config.rules['packagejson-same-name']).toBeFalsy();
    }
  });

  it('lint test repo', async () => {
    const results = lint(baseDir, null);

    expect(results.length > 5).toBeTruthy();

    expect(results[0].resource.includes('package.json')).toBeTruthy();
    expect(results[0].module?.name).toEqual('mod1-js');
    expect(results[0].valid).toBeFalsy();

    expect(results[1].resource.includes('serverless.yml')).toBeTruthy();
    expect(results[1].module?.name).toEqual('mod2-svc');
    expect(results[1].valid).toBeFalsy();

    expect(results[2].resource.includes('package.json')).toBeTruthy();
    expect(results[2].module?.name).toEqual('mod4-svc');
    expect(results[2].valid).toBeTruthy();
  });

});
