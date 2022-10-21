import { lint, discoverModules } from './lint';
import { loadBaseConfig } from './utils/config';

const baseDir = 'src/rules/test-monorepo';
const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
const baseConfig2 = loadBaseConfig(baseDir, '.monolint2.json');

describe('lint', () => {
  it('discoverModules by specific marker', async () => {
    const results = discoverModules(baseDir, baseConfig2);
    expect(results).toHaveLength(1);
    expect(results[0].path.includes('group1')).toBeTruthy();
    expect(results[0].name).toEqual('mod3-svc');
  });

  it("discoverModules don't find ignored modules", async () => {
    const results = discoverModules(baseDir, baseConfig);
    const rr = results.filter((elem) => elem.path.includes('node_modules'));
    expect(rr).toHaveLength(0);
  });

  it('discoverModules by marker considering duplicate and ignoring folders', async () => {
    const results = discoverModules(baseDir, baseConfig);
    expect(results).toHaveLength(7);
  });

  it('discoverModules and check config hierarchy', async () => {
    const results = discoverModules(baseDir, baseConfig);
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

    let checks = 5;

    for (let i = 0; i < results.length; i += 1) {
      const result = results[i];

      if (
        result.resource === 'src/rules/test-monorepo/modules/mod1-js' &&
        result.rule === 'module-name-regex'
      ) {
        expect(result.module?.name).toEqual('mod1-js');
        expect(result.valid).toBeTruthy();
        checks -= 1;
      }

      if (
        result.resource === 'src/rules/test-monorepo/modules/mod1-js/package.json' &&
        result.rule === 'packagejson-same-name'
      ) {
        expect(result.module?.name).toEqual('mod1-js');
        expect(result.valid).toBeFalsy();
        checks -= 1;
      }

      if (
        result.resource === 'src/rules/test-monorepo/modules/group3/group3a/mod7-xyz' &&
        result.rule === 'module-name-regex'
      ) {
        expect(result.module?.name).toEqual('mod7-xyz');
        expect(result.valid).toBeFalsy();
        checks -= 1;
      }

      if (
        result.resource === 'src/rules/test-monorepo/modules/group3/group3a/mod6-abc' &&
        result.rule === 'module-name-regex'
      ) {
        expect(result.module?.name).toEqual('mod6-abc');
        expect(result.valid).toBeTruthy();
        checks -= 1;
      }

      if (
        result.resource === 'src/rules/test-monorepo/modules/mod5-thx/serverless.yml' &&
        result.rule === 'serverless-same-name'
      ) {
        expect(result.module?.name).toEqual('mod5-thx');
        expect(result.valid).toBeTruthy();
        checks -= 1;
      }
    }
    expect(checks).toBe(0);
  });
});
