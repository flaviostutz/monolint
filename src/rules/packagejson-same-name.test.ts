import rule from './packagejson-same-name';

describe('packagejson-same-name', () => {

  it('package.json with different name is invalid', async () => {
    const results = rule.check(
      { path: 'test-monorepo/modules/mod1-svc', name: 'mod1-svc' },
      {
        rules: { 'packagejson-same-name': { 'package-json-name': "_package.json" }},
        'module-markers': [],
      },
    );
    const invalids = results.filter((res) => {
      return !res.valid;
    });
    console.log(JSON.stringify(invalids));
    expect(invalids).toHaveLength(1);
  });

});
