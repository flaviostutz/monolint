type Config = {
  'module-markers'?: string[];
  'use-gitignore'?: boolean;
  extends?: string[];
  rules?: Record<
    string,
    | boolean
    | string
    | ConfigModuleRequiredFiles
    | ConfigPackageJsonSameName
    | ConfigModuleSameContents
    | ConfigModuleParentFolder
  >;
};

type ConfigModuleRequiredFiles = {
  files: string[];
  strict: boolean;
};

type ConfigModuleSameContentsFile = {
  'min-similarity'?: number;
  enabled?: boolean;
  selectors?: string[];
};

type ConfigModuleParentFolder = string[];

type ConfigModuleSameContents = {
  files?: string[] | Record<string, ConfigModuleSameContentsFile>;
  'reference-module'?: string;
};

type ConfigPackageJsonSameName = {
  packageJsonFile: string;
};

export {
  Config,
  ConfigModuleRequiredFiles,
  ConfigPackageJsonSameName,
  ConfigModuleSameContents,
  ConfigModuleSameContentsFile,
  ConfigModuleParentFolder,
};
