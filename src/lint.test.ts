import { lint, discoverModules } from './lint';

const baseDir = 'src/rules/test-monorepo';

describe('lint', () => {

  it('discoverModules by marker', async () => {
        // const baseConfig = loadBaseConfig(baseDir);
    const config = {
      "module-markers": ["_thisisamodule"],
      rules: {},
    };
    const results = discoverModules(baseDir, config);
    expect(results).toHaveLength(1);
    expect(results[0].path.includes('group1')).toBeTruthy();
    expect(results[0].name).toEqual('mod3-svc');

    config['module-markers'] = [];
    const results2 = discoverModules(baseDir, config);
    expect(results2).toHaveLength(0);
  });

  it('discoverModules by marker considering duplicate and ignoring folders', async () => {
    // const baseConfig = loadBaseConfig(baseDir);
    const config = {
      "module-markers": ["package.json", "serverless.yml"],
      rules: {},
    };
    const results = discoverModules(baseDir, config);
    expect(results).toHaveLength(5);
  });

  it('lint test repo', async () => {
    const results = lint(baseDir);

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
