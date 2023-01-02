import { mergeDeep } from './mergeDeep';

describe('deepMerge tests', () => {
  it('test deep merge', () => {
    const target = mergeDeep([
      { aa: 1, bb: { cc: { dd: 1, gg: 1 }, ee: 1, ff: 1, hh: [3] } },
      { aa: 2, bb: { cc: { dd: 2 }, ee: 2, hh: [1, 2] } },
    ]);
    expect(target).toStrictEqual({
      aa: 2,
      bb: { cc: { dd: 2, gg: 1 }, ee: 2, ff: 1, hh: [3, 1, 2] },
    });
  });
});
