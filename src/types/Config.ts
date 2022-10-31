type Config = {
  'module-markers'?: string[];
  'use-gitignore'?: boolean;
  extends?: string[];
  rules?: Record<
    string,
    | boolean
    | ConfigModuleRequiredFiles
    | ConfigPackageJsonSameName
    | ConfigModuleSameContents
    | ConfigGhWorkflowModulePrefix
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

type ConfigModuleSameContents = {
  files?: string[] | Record<string, ConfigModuleSameContentsFile>;
  'reference-module'?: string;
};

type ConfigPackageJsonSameName = {
  packageJsonFile: string;
};

type ConfigGhWorkflowModulePrefix = {
  required: boolean;
  suffixes: string[];
}

export {
  Config,
  ConfigModuleRequiredFiles,
  ConfigPackageJsonSameName,
  ConfigModuleSameContents,
  ConfigModuleSameContentsFile,
  ConfigGhWorkflowModulePrefix,
};
