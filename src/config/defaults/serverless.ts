import { Config } from '../../types/Config';

export const Serverless: Config = {
  'module-markers': ['serverless.yml'],
  rules: {
    'serverless-same-name': true,
    'module-same-contents': {
      files: {
        'serverless.yml': {
          selectors: [
            'provider.runtime',
            'provider.lambdaHashingVersion',
            'provider.logRetentionInDays',
            'provider.tracing',
          ],
        },
      },
    },
  },
};
