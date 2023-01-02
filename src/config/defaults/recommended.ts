import { Config } from '../../types/Config';

export const Recommended: Config = {
  extends: ['monolint:basic', 'monolint:packagejson', 'monolint:serverless', 'monolint:makefile'],
};
