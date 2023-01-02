import { Config } from '../../types/Config';

export const Makefile: Config = {
  rules: {
    'module-same-contents': {
      files: {
        Makefile: {
          selectors: [
            'build',
            'lint',
            'test',
            'unit-tests',
            'integration-tests',
            'package',
            'deploy',
            'undeploy',
            'start',
            'clean',
            'install',
          ],
        },
      },
    },
  },
};
