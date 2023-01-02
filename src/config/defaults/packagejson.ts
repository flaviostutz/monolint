import { Config } from '../../types/Config';

export const PackageJson: Config = {
  'module-markers': ['package.json'],
  rules: {
    'packagejson-same-name': true,
    'module-same-contents': {
      files: {
        'package.json': {
          selectors: [
            'license',
            'author',
            'repository.type',
            'scripts.build',
            'scripts.lint',
            'scripts.lint-fix',
            'scripts.clean',
            'scripts.test',
            'scripts.unit-tests',
            'scripts.integration-tests',
            'scripts.deploy',
            'dependencies',
            'devDependencies',
            'engines.node',
            'publishConfig',
          ],
        },
        LICENSE: { enabled: true },
        'jest.config.js': { enabled: true },
        'tsconfig.json': { enabled: true },
        'tsconfig.eslint.json': { enabled: true },
        '.eslintrc.js': { enabled: true },
        eslintignore: { enabled: true },
        '.prettierrc.js': { enabled: true },
        '.prettierignore': { enabled: true },
      },
    },
  },
};
