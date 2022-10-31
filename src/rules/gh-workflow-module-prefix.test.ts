import { resolveModuleConfig } from '../config/config-resolver';
import { expectAllResourcesRegexValid, loadModulesForRule } from '../utils/tests';

import rule from './gh-workflow-module-prefix';

describe('when using default configurations', () => {
  const baseDir = 'src/rules/test-cases/gh-workflow-module-prefix';
  const ruleModules = loadModulesForRule(baseDir, '.monolint.json', 'gh-workflow-module-prefix');
  const baseConfig = resolveModuleConfig(baseDir, baseDir, '.monolint.json');

  it('workflow names without a module prefix should fail', async () => {
    const results = rule.checkModules(ruleModules, baseDir, false, baseConfig);
    expect(results?.filter((rr) => rr.valid)).toHaveLength(3);
    expect(results?.filter((rr) => !rr.valid)).toHaveLength(1);
    if (results) {
      expectAllResourcesRegexValid(results, '.*/randomthing-dev.yml', false);
      expectAllResourcesRegexValid(results, '.*/mod1-anything.yml', true);
      expectAllResourcesRegexValid(results, '.*/mod2-prd.yml', true);
    }
  });

});

describe('when using "required" with "-dev" and "-prd" sufixes', () => {
  const baseDir = 'src/rules/test-cases/gh-workflow-module-prefix';
  const ruleModules = loadModulesForRule(baseDir, '.monolint2.json', 'gh-workflow-module-prefix');
  const baseConfig = resolveModuleConfig(baseDir, baseDir, '.monolint2.json');

  it('workflow names without a module prefix should fail', async () => {
    const results = rule.checkModules(ruleModules, baseDir, false, baseConfig);
    if (results) {
      expectAllResourcesRegexValid(results, '.*/randomthing-dev.yml', false);
    }
  });

  it('modules with this rule disabled shouldnt be evaluated', async () => {
    const results = rule.checkModules(ruleModules, baseDir, false, baseConfig);
    expect(results).toBeDefined();
    if (results) {
      for (let i = 0; i < results.length; i += 1) {
        expect(results[i].resource.includes('mod3')).toBeFalsy();
      }
    }
  });


  it('names without sufixes "-dev" or "-prd" should fail', async () => {
    const results = rule.checkModules(ruleModules, baseDir, false, baseConfig);
    if (results) {
      const results2 = results.map((rr) => {
        return { message: rr.message, resource: rr.resource, valid: rr.valid };
      });
      expect(results2.filter((rr) => rr.valid)).toHaveLength(4);
      expect(results2.filter((rr) => !rr.valid)).toHaveLength(4);
      const iresults = results.filter((rr) => !rr.valid);
      expectAllResourcesRegexValid(iresults, '.*/mod1-prd.yml', false);
      expectAllResourcesRegexValid(iresults, '.*/mod2-dev.yml', false);
      expectAllResourcesRegexValid(results, '.*/mod1-something-dev.yml', true);
      expectAllResourcesRegexValid(results, '.*/mod2-prd.yml', true);
    }
  });

});


describe('when using "not required" with "-dev" and "-prd" sufixes', () => {
  const baseDir = 'src/rules/test-cases/gh-workflow-module-prefix';
  const ruleModules = loadModulesForRule(baseDir, '.monolint3.json', 'gh-workflow-module-prefix');
  const baseConfig = resolveModuleConfig(baseDir, baseDir, '.monolint3.json');

  it('existing files, but with names without sufixes -dev or -prd should fail', async () => {
    const results = rule.checkModules(ruleModules, baseDir, false, baseConfig);
    expect(results).toBeDefined();
    if (results) {
      const iresults = results.filter((rr) => !rr.valid);
      expect(iresults).toHaveLength(2);
      const vresults = results.filter((rr) => rr.valid);
      expect(vresults).toHaveLength(2);
      expectAllResourcesRegexValid(iresults, '.*/mod1-anything.yml', false);
      expectAllResourcesRegexValid(vresults, '.*/mod1-something-dev.yml', true);
      expectAllResourcesRegexValid(vresults, '.*/mod2-prd.yml', true);
    }
  });

  it('missing workflow files for all modules + all sufixes should fail', async () => {
    const results = rule.checkModules(ruleModules, baseDir, false, baseConfig);
    expect(results).toBeDefined();
    if (results) {
      const results2 = results.map((rr) => {
        return { message: rr.message, resource: rr.resource, valid: rr.valid };
      });
      expect(results2.filter((rr) => rr.valid)).toHaveLength(2);
      expect(results2.filter((rr) => !rr.valid)).toHaveLength(2);
      expectAllResourcesRegexValid(results, '.*/mod1-anything.yml', false);
      expectAllResourcesRegexValid(results, '.*/mod1-something-dev.yml', true);
      expectAllResourcesRegexValid(results, '.*/mod2-prd.yml', true);
      expectAllResourcesRegexValid(results, '.*/randomthing-dev.yml', false);
    }
  });

});

