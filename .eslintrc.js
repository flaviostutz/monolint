// eslint-disable-next-line import/no-commonjs
module.exports = {
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  // ignorePatterns: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', 'rules.md'],
  extends: '@stutzlab/eslint-config',
};
