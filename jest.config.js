// eslint-disable-next-line import/no-commonjs
module.exports = {
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(tsx?|json?)$': [
      'esbuild-jest',
      {
        sourcemap: true, // correct line numbers in code coverage
      },
    ],
  },
  collectCoverage: true,
  collectCoverageFrom: ['./src/**', '!**/test-cases/**', '!**/.tmp/**'],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 70,
      functions: 90,
    },
  },
};
