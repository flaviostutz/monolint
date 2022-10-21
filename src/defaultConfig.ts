import { Config } from './types/Config';

export const DefaultConfig: Config = {
  'module-markers': ['package.json', 'serverless.yml'],
  'use-gitignore': true,
  rules: {
    'serverless-same-name': true,
    'packagejson-same-name': true,
    'module-name-regex': true,
  },
};
