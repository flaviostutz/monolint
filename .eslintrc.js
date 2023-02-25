// eslint-disable-next-line import/no-commonjs
module.exports = {
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  // ignorePatterns: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', 'rules.md'],
  extends: '@stutzlab/eslint-config',
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-continue': 'off',

    // remove this when fixing the dependency cycle we have with rules/registry
    'import/no-cycle': 'off',
  },
};
