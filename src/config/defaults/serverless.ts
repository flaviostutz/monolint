import { Config } from '../../types/Config';

export const Serverless: Config = {
  'module-markers': ['serverless.yml'],
  rules: {
    'serverless-same-name': true,
    'module-same-contents': {
      files: {
        'serverless.yml': {
          selectors: {
            'provider.runtime': false,
            'provider.lambdaHashingVersion': false,
            'provider.logRetentionInDays': false,
            'provider.tracing': false,
          },
        },
      },
    },
  },
};
