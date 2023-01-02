import { Config } from '../../types/Config';

export const PackageJson: Config = {
  'module-markers': ['package.json'],
  rules: {
    'packagejson-same-name': true,
    'module-same-contents': {
      files: {
        'package.json': {
          selectors: {
            license: true,
            author: true,
            'repository.type': false,
            'scripts.build': false,
            'scripts.lint': false,
            'scripts.lint-fix': false,
            'scripts.clean': false,
            'scripts.test': false,
            'scripts.unit-tests': false,
            'scripts.integration-tests': false,
            'scripts.deploy': false,
            dependencies: false,
            devDependencies: false,
            'engines.node': false,
            publishConfig: false,
          },
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
