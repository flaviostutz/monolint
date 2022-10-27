import { lint } from './lint';
import { expectAllResourcesRegexValid } from './utils/tests';

const baseDir = 'src/rules/test-cases/general';

describe('when running lint', () => {
  it('lint test repo', async () => {
    const results = lint(baseDir, '.monolint.json');

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
