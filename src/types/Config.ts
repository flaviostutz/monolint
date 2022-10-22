type Config = {
  'module-markers'?: string[];
  'use-gitignore': boolean;
  rules?: Record<string, boolean | string | ConfigModuleRequiredFiles | ConfigPackageJsonSameName>;
};

type ConfigModuleRequiredFiles = {
  files: string[];
  strict: boolean;
};

type ConfigPackageJsonSameName = {
  packageJsonFile: string;
};

export { Config, ConfigModuleRequiredFiles, ConfigPackageJsonSameName };
