module.exports = {
  parserOptions: {
    // needed by some typescript rules
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  // ignorePatterns: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', 'rules.md'],
  extends: '@stutzlab/eslint-config',
};
