import { loadExtension } from './extensions';

describe('when refering to internal extensions', () => {
  it('get monolint:basic should work', async () => {
    const config = loadExtension('monolint:basic');
    if (!config) {
      throw new Error('config should be loaded');
    }
    expect(config).toBeDefined();
    expect(config['use-gitignore']).toBeTruthy();
    const rr = config.rules;
    if (!rr) {
      throw new Error('rules should be defined');
    }
    expect(rr['module-unique-name']).toBeTruthy();
  });

  it('get monolint:serverless should work', async () => {
    const config = loadExtension('monolint:serverless');
    if (!config) {
      throw new Error('config should be loaded');
    }
    expect(config).toBeDefined();
    const mm = config['module-markers'];
    expect(mm?.includes('serverless.yml')).toBeTruthy();
    const rr = config.rules;
    if (!rr) {
      throw new Error('rules should be defined');
    }
    expect(rr['serverless-same-name']).toBeTruthy();
  });

  it('get monolint:recommended should work', async () => {
    const config = loadExtension('monolint:recommended');
    if (!config) {
      throw new Error('config should be loaded');
    }
    expect(config).toBeDefined();
    expect(config['use-gitignore']).toBeTruthy();
    const mm = config['module-markers'];
    console.log(mm);
    expect(mm?.includes('package.json')).toBeTruthy();
    expect(mm?.includes('serverless.yml')).toBeTruthy();
    const rr = config.rules;
    if (!rr) {
      throw new Error('rules should be defined');
    }
    expect(rr['serverless-same-name']).toBeTruthy();
    expect(rr['packagejson-same-name']).toBeTruthy();
  });
});
