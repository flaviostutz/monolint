import { run } from './cli';

describe('when using cli', () => {
  it('should execute cli tests successfuly', async () => {
    // mock console.log to get results and check them
    let stdout = '';
    console.log = (log): void => {
      stdout += log;
    };

    // run tests below sequentially to avoid issues with console.log mocking

    // invalid action shows help
    stdout = '';
    let exitCode = await run([
      '',
      '',
      'invalidaction',
      '-v',
      '--base-dir=./src/rules/test-cases/general',
      '-v',
    ]);
    expect(stdout).toMatch(/help/);
    expect(exitCode).toBe(1);

    // default check on general test-case monorepo
    stdout = '';
    exitCode = await run(['', '', '--base-dir=./src/rules/test-cases/module-same-contents/']);
    expect(stdout).toMatch(/.prettierrc.js/);
    expect(exitCode).toBe(2);

    // filter results
    stdout = '';
    exitCode = await run([
      '',
      '',
      '--base-dir=./src/rules/test-cases/module-same-contents/',
      '--filter=prettier',
      '--verbose',
    ]);
    expect(stdout).toMatch(/.prettierrc.js/);
    expect(exitCode).toBe(2);

    // filter results
    stdout = '';
    exitCode = await run([
      '',
      '',
      '--base-dir=./src/rules/test-cases/module-same-contents/',
      '--filter=INEXISTENT_THING',
    ]);
    expect(exitCode).toBe(0);
  });
});
