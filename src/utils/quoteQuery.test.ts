import { quoteQuery } from './quoteQuery';

describe('quoteQuery tests', () => {
  it('test quoteQuery 2', () => {
    const result = quoteQuery('testa.testb');
    expect(result).toBe('"testa"."testb"');
  });
  it('test quoteQuery 1', () => {
    const result = quoteQuery('testa');
    expect(result).toBe('"testa"');
  });
  it('test quoteQuery 3', () => {
    const result = quoteQuery('testa[0]');
    expect(result).toBe('"testa"[0]');
  });
  it('test quoteQuery 3', () => {
    const result = quoteQuery('testb.testa[0]');
    expect(result).toBe('"testb"."testa"[0]');
  });
  it('test quoteQuery 3', () => {
    const result = quoteQuery('testb[0].testa[0]');
    expect(result).toBe('"testb"[0]."testa"[0]');
  });
});
