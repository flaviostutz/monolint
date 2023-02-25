/* eslint-disable jest/expect-expect */
import { resolve } from 'path';

import { lint } from './lint';
import { expectAllModuleResultsValid, expectAllResourcesRegexValid } from './utils/tests';

describe('when running lint in a repo without .monolint.json config', () => {
  const baseDir = resolve('src/rules/test-cases/general/modules/group1');
  it('default module discovery marks and rules should be used', async () => {
    const results = lint(baseDir, '.monolint.json', false);

    expect(results.filter((rr) => rr.rule === 'module-name-regex').length).toBeGreaterThan(0);
    expect(results.filter((rr) => rr.rule === 'module-unique-name').length).toBeGreaterThan(0);
    expect(results.filter((rr) => rr.rule === 'packagejson-same-name').length).toBeGreaterThan(0);
    expect(results.filter((rr) => rr.rule === 'serverless-same-name').length).toBeGreaterThan(0);

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'module-name-regex'),
      '.*/mod2-svc',
      true,
    );

    expectAllModuleResultsValid(results, 'mod4-svc', true);

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'module-name-regex'),
      '.*/mod2-svc',
      true,
    );
  });
});

describe('when running lint', () => {
  const baseDir = resolve('src/rules/test-cases/general');
  it('lint test repo', async () => {
    const results = lint(baseDir, '.monolint.json', false);

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'module-name-regex'),
      'src/rules/test-cases/general/modules/mod1-js',
      true,
    );

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'packagejson-same-name'),
      'src/rules/test-cases/general/modules/mod1-js/package.json',
      false,
    );

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'module-name-regex'),
      'src/rules/test-cases/general/modules/group3/group3a/mod7-xyz',
      false,
    );

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'module-name-regex'),
      'src/rules/test-cases/general/modules/group3/group3a/mod6-abc',
      true,
    );

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'serverless-same-name'),
      'src/rules/test-cases/general/modules/mod5-thx/serverless.yml',
      true,
    );
  });
});
