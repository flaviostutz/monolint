import { ModuleRequiredFilesConfig } from './ModuleRequiredFilesConfig';

export type Config = {
  'module-markers'?: string[];
  'use-gitignore': boolean;
  rules?: Record<string, boolean | ModuleRequiredFilesConfig>;
};
