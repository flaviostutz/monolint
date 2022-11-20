import { fullContentSimilarityPerc, partialContentSimilarity } from './file';

describe('when comparing the contents of two files', () => {
  it('similarity perc of chars changed big text is found', async () => {
    const dperc = fullContentSimilarityPerc(
      'src/rules/test-cases/general/modules/mod1-js/filediff1a',
      'src/rules/test-cases/general/modules/mod1-js/filediff1b',
    );
    expect(dperc).toBeGreaterThanOrEqual(90);
  });

  it('similarity perc of chars changed big text rev is found', async () => {
    const dperc = fullContentSimilarityPerc(
      'src/rules/test-cases/general/modules/mod1-js/filediff1b',
      'src/rules/test-cases/general/modules/mod1-js/filediff1a',
    );
    expect(dperc).toBeGreaterThanOrEqual(89);
  });

  it('similarity perc of chars changed for small js is found', async () => {
    const dperc = fullContentSimilarityPerc(
      'src/rules/test-cases/general/modules/mod1-js/filediff2a',
      'src/rules/test-cases/general/modules/mod1-js/filediff2b',
    );
    expect(dperc).toBeGreaterThanOrEqual(99);
  });
});

describe('when having two yml or json files', () => {
  it('same selector comparing with same file have similarity 100%', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'hospital',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'hospital',
    );
    expect(dperc._all).toBe(100);
  });

  it('same selector comparing two files with different extracts contents should be <100% similarity', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'hospital',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare2.json',
      'hospital',
    );
    expect(dperc._all).toBeGreaterThan(50);
    expect(dperc._all).toBeLessThan(60);
  });

  it('comparison with similar selector for same content yml and json should work', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'hospital',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.yml',
      'hospital',
    );
    expect(dperc._all).toBe(100);
  });

  it('comparison with similar selector for different contents of yml and json should work', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'hospital',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare2.yml',
      'hospital',
    );
    expect(dperc._all).toBeGreaterThan(50);
    expect(dperc._all).toBeLessThan(60);
  });

  it('comparison with similar contents in complex structures should work', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'medications[0].aceInhibitors',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.yml',
      'medications[0].aceInhibitors',
    );
    expect(dperc._all).toBe(100);
  });

  it('comparison with different contents in complex structures should work', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'medications[0].aceInhibitors',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare2.yml',
      'medications[0].aceInhibitors',
    );
    expect(dperc._all).toBeGreaterThan(90);
    expect(dperc._all).toBeLessThan(95);
  });

  it('comparison with unexistent contents should return 0', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'medications[0].aceInhibitors',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare2.yml',
      'medications[0].aceInhibitors[0][0]',
    );
    expect(dperc._all).toBe(0);
  });

  it('comparison between two unexistent contents should return 100%', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'medications[0].aceInhibitors[1]',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare2.yml',
      'medications[0].aceInhibitors[0][0]',
    );
    expect(dperc._all).toBe(100);
  });

  it('when selector resolves to an object, only matching attributes will be checked for similarity', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare2.json',
      'dependencies',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare2.yml',
      'dependencies',
      true,
    );
    expect(dperc.lib1).toEqual(100);
    expect(dperc.lib2).not.toBeDefined();
    expect(dperc.lib3).not.toBeDefined();
    expect(dperc.lib4).toEqual(100);
  });

  it('when selector resolves to an object, only matching attributes will be checked for similarity', async () => {
    const dperc = partialContentSimilarity(
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.json',
      'dependencies',
      'src/rules/test-cases/general/modules/group1/mod2-svc/file-compare1.yml',
      'dependencies',
      true,
    );
    expect(dperc.lib1).toEqual(100);
    expect(dperc.lib2).not.toBeDefined();
    expect(dperc.lib3).not.toBeDefined();
    expect(dperc.lib4).not.toBeDefined();
    expect(dperc.lib5).toEqual(100);
    expect(dperc.lib6).toEqual(80);
    expect(dperc._all).toEqual(93.33);
  });

});
