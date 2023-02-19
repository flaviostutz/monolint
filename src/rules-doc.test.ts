/* eslint-disable no-console */
import { run } from './rules-doc';

describe('when using rules-doc cli', () => {
  it('should generate markdown', async () => {
    // mock console.log to get results and check them
    let stdout = '';
    console.log = (log): void => {
      stdout += log;
    };

    // run tests below sequentially to avoid issues with console.log mocking

    stdout = '';
    const exitCode = run(['', '', '--check']);
    expect(stdout).toMatch(/is up to date/);
    expect(exitCode).toBe(0);
  });
});
