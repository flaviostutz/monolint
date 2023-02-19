import { resolve } from 'path';

import { resolveModuleConfig } from '../config/config-resolver';

import { enabledRules, getRule, allRules } from './registry';

describe('when using registry', () => {
  const baseDir = resolve('src/rules/test-cases/config-resolver');
  const config = resolveModuleConfig(baseDir, baseDir, '.monolint.json');

  it('should get all enabled rules', async () => {
    const er = enabledRules(config);
    expect(er.length).toBe(5);
  });

  it('should generate docs for all rules', async () => {
    for (let i = 0; i < allRules.length; i += 1) {
      const dec = allRules[i].docExampleConfigs();
      expect(dec).toBeDefined();
      expect(dec.length).toBeGreaterThan(0);

      const dm = allRules[i].docMarkdown();
      expect(dm).toBeDefined();
      expect(dm.length).toBeGreaterThan(0);
    }
  });

  it('should return null for unknown rule', async () => {
    const rr = getRule('test');
    expect(rr).toBeNull();
  });
});
