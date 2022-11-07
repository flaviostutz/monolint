/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line import/no-commonjs
module.exports = {
  // parserOptions: {
  //   ecmaVersion: 6,
  //   sourceType: 'module',
  // },
  rules: {
    '@typescript-eslint/naming-convention': 'warn',
    '@typescript-eslint/semi': 'warn',
    curly: 'warn',
    eqeqeq: 'warn',
    'no-throw-literal': 'warn',
    semi: 'off',
  },
  ignorePatterns: ['out', 'dist', '**/*.d.ts'],
};
