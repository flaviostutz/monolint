import {
  expectAllModuleResultsValid,
  expectAllResourcesRegexValid,
  loadModulesForRule,
} from '../utils/tests';

import rule from './module-same-contents';

const baseDir = 'src/rules/test-cases/module-same-contents';

describe('when using default configuration', () => {
  const modules = loadModulesForRule(baseDir, '.monolint.json', 'module-same-contents');

  it('mod4-all-same should be selected automatically as the reference module', async () => {
    const results = rule.checkModules(modules, baseDir);
    if (!results) {
      throw new Error("Results shouldn't be null");
    }
    expect(results.length).toBeGreaterThan(0);
    expectAllModuleResultsValid(results, 'mod4-all-same', true);
    expectAllResourcesRegexValid(results, 'mod4-all-same/.prettierrc.js', true, 'Reference.*');
    expectAllResourcesRegexValid(results, 'mod4-all-same/jest.config.js', true, 'Reference.*');
    expectAllResourcesRegexValid(results, 'mod4-all-same/tsconfig.json', true, 'Reference.*');
  });

  it('mod1-reference resources should all be valid', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllModuleResultsValid(results, 'mod1-reference', true);
  });

  it('mod3-some-different-files/.prettierrc.js should be invalid', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(results, 'mod3-some-different-files/.prettierrc.js', false);
    expectAllResourcesRegexValid(results, 'mod3-some-different-files/tsconfig.json', true);
  });

  it('mod3-some-different-files/.prettierrc.js error should refer to mod4-all-same/.prettierrc.js', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(
      results,
      'mod3-some-different-files/.prettierrc.js',
      false,
      'mod4-all-same/.prettierrc.js',
    );
  });

  it('mod3-some-equal-files module should be all valid', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllModuleResultsValid(results, 'mod2-some-equal-files', true);
  });
});

describe('when using intermediate configuration', () => {
  const modules = loadModulesForRule(baseDir, '.monolint2.json', 'module-same-contents');

  it('mod1-reference should be selected automatically as the reference module because alphabetically it wins the tie', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(results, 'mod1-reference/file1', true, 'Reference.*');
    expectAllResourcesRegexValid(results, 'mod1-reference/file2', true, 'Reference.*');
    expectAllResourcesRegexValid(results, 'mod1-reference/dir1/file3', true, 'Reference.*');
    expectAllModuleResultsValid(results, 'mod1-reference', true);
  });
});
