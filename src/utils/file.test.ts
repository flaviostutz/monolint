import { similarityPerc } from './file';

describe('with two files', () => {
  it('calculate similarityPerc of chars changed big text', async () => {
    const dperc = similarityPerc(
      'src/rules/test-cases/general/modules/mod1-js/filediff1a',
      'src/rules/test-cases/general/modules/mod1-js/filediff1b',
    );
    expect(dperc).toBeGreaterThanOrEqual(90);
  });

  it('calculate similarityPerc of chars changed big text rev', async () => {
    const dperc = similarityPerc(
      'src/rules/test-cases/general/modules/mod1-js/filediff1b',
      'src/rules/test-cases/general/modules/mod1-js/filediff1a',
    );
    expect(dperc).toBeGreaterThanOrEqual(89);
  });

  it('calculate similarityPerc of chars changed small js', async () => {
    const dperc = similarityPerc(
      'src/rules/test-cases/general/modules/mod1-js/filediff2a',
      'src/rules/test-cases/general/modules/mod1-js/filediff2b',
    );
    expect(dperc).toBeGreaterThanOrEqual(99);
  });
});
