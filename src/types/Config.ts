type Config = {
  'module-markers'?: string[];
  'use-gitignore'?: boolean;
  extends?: string[];
  rules?: Record<
    string,
    | boolean
    | ConfigModuleRequiredFiles
    | ConfigModuleFolderStructure
    | ConfigPackageJsonSameName
    | ConfigModuleSameContents
    | ConfigModuleParentFolder
    | ConfigGhWorkflowModulePrefix
  >;
};

type ConfigModuleRequiredFiles = {
  files: string[];
  strict: boolean;
};

type ConfigModuleFolderStructure = {
  folders: string[];
  strict: boolean;
};

type ConfigModuleSameContentsFile = {
  'min-similarity'?: number;
  enabled?: boolean;
  selectors?: string[] | Record<string, boolean>;
};

type ConfigModuleParentFolder = string[];

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
};

export {
  Config,
  ConfigModuleRequiredFiles,
  ConfigModuleFolderStructure,
  ConfigPackageJsonSameName,
  ConfigModuleSameContents,
  ConfigModuleSameContentsFile,
  ConfigModuleParentFolder,
  ConfigGhWorkflowModulePrefix,
};
