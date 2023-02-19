import { resolve } from 'path';

import {
  expectAllModuleResultsValid,
  expectAllResourcesRegexValid,
  loadModulesForRule,
} from '../utils/tests';

import rule from './module-same-contents';

const baseDir = resolve('src/rules/test-cases/module-same-contents');

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

  it('mod1-reference should be selected automatically as the reference module', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(results, 'mod1-reference/file1', true, 'Reference.*');
    expectAllResourcesRegexValid(results, 'mod1-reference/file2', true, 'Reference.*');
    expectAllResourcesRegexValid(results, 'mod1-reference/dir1/file3', true, 'Reference.*');
    expectAllModuleResultsValid(results, 'mod1-reference', true);
  });
});

describe('when using expanded configuration', () => {
  const modules = loadModulesForRule(baseDir, '.monolint3.json', 'module-same-contents');

  it('mod2-some-equal-files should be used as reference', async () => {
    const results = rule.checkModules(modules, baseDir);
    expect(results).toHaveLength(3);
    expectAllResourcesRegexValid(results, 'mod2-some-equal-files/dir1/file3', true, 'Reference.*');
    expectAllResourcesRegexValid(
      results,
      'mod4-all-same/dir1/file3',
      true,
      'Similar to module mod2-some-equal-files.*',
    );
    expectAllResourcesRegexValid(
      results,
      'mod1-reference/dir1/file3',
      true,
      'Similar to module mod2-some-equal-files.*',
    );
    expectAllModuleResultsValid(results, 'mod2-some-equal-files', true);
  });
});

describe('when using selector for checking parts of files', () => {
  const modules = loadModulesForRule(baseDir, '.monolint4.json', 'module-same-contents');

  it('serverless.yml attributes among different modules should be checked accordingly', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(
      results,
      'mod2-some-equal-files/serverless.yml\\[provider.runtime\\]',
      true,
      'Similar to module mod1-reference.*',
    );
    expectAllResourcesRegexValid(
      results,
      'mod2-some-equal-files/serverless.yml\\[plugins\\[0\\]\\]',
      true,
      'Similar to module mod1-reference.*',
    );
    expectAllResourcesRegexValid(
      results,
      'mod2-some-equal-files/serverless.yml\\[provider.stackName\\]',
      true,
      'Similar to module mod1-reference.*',
    );

    expectAllResourcesRegexValid(
      results,
      'mod3-some-different-files/serverless.yml\\[provider.runtime\\]',
      false,
      'Different from .*/mod1-reference/serverless.yml\\[provider.runtime\\]',
    );
    expectAllResourcesRegexValid(
      results,
      'mod3-some-different-files/serverless.yml\\[plugins\\[0\\]\\]',
      false,
      'Different from .*/mod1-reference/serverless.yml\\[plugins\\[0\\]\\]',
    );
    expectAllResourcesRegexValid(
      results,
      'mod3-some-different-files/serverless.yml\\[provider.stackName\\]',
      false,
      'Different from .*/mod1-reference/serverless.yml\\[provider.stackName\\]',
    );
  });

  it("should be invalid if reference file doesn't have contents for specified selector", async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(
      results,
      'mod5-no-files/package.json\\[scripts.dist\\]',
      false,
      'Required content not found.*',
    );

    expectAllResourcesRegexValid(
      results,
      'mod1-reference/package.json\\[unexistingthing\\]',
      false,
      'Required content on reference file not found.*',
    );
  });

  it('should match existing attributes of a selected part of the file', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(
      results,
      'mod2-some-equal-files/package.json\\[dependencies\\]',
      true,
    );
  });

  it('should match existing attributes of a selected part of the file and fail if different', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(
      results,
      'mod3-some-different-files/package.json\\[dependencies.lib3\\]',
      false,
    );
  });

  it('should identify some-equals-file Makefile as OK', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(results, 'mod2-some-equal-files/Makefile\\[target1', true);
    expectAllResourcesRegexValid(results, 'mod2-some-equal-files/Makefile\\[target3', true);
  });

  it('should identify some-different-file Makefile as NOT OK', async () => {
    const results = rule.checkModules(modules, baseDir);
    expectAllResourcesRegexValid(results, 'mod3-some-different-files/Makefile\\[target2\\]', false);
    expectAllResourcesRegexValid(results, 'mod3-some-different-files/Makefile\\[target3\\]', false);
  });
});
