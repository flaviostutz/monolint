import { Config } from '../../types/Config';

export const Serverless: Config = {
  'module-markers': ['serverless.yml'],
  rules: {
    'serverless-same-name': true,
  },
};
