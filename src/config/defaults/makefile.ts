import { Config } from '../../types/Config';

export const Makefile: Config = {
  rules: {
    'module-same-contents': {
      files: {
        Makefile: {
          selectors: {
            build: false,
            lint: false,
            test: false,
            'unit-tests': false,
            'integration-tests': false,
            package: false,
            deploy: false,
            undeploy: false,
            start: false,
            clean: false,
            install: false,
          },
        },
      },
    },
  },
};
