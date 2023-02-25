import fg, { Options } from 'fast-glob';

import { Rule } from '../types/Rule';
import { RuleResult } from '../types/RuleResult';
import { ConfigModuleFolderStructure } from '../types/Config';

const defaultConfig = {
  folders: ['src'],
  strict: false,
};

const rule: Rule = {
  name: 'module-folder-structure',

  checkModules(modules) {
    const results: RuleResult[] = [];

    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];
      // first, get the rule reference from the module
      const { rules } = module.config;

      // get the config for this rule
      let folderStructureConfig = rules?.[this.name] as ConfigModuleFolderStructure | boolean;

      // If undefined/false, skip this module
      if (!folderStructureConfig) {
        continue;
      }

      // If true, use the default config
      if (folderStructureConfig === true) {
        folderStructureConfig = { ...defaultConfig };
      }

      const { folders: requiredFolderPatterns, strict } = folderStructureConfig;

      if (requiredFolderPatterns.length === 0) {
        continue;
      }

      // build the required file paths relative to module path
      const { path } = module;

      const fgConfig: Options = {
        cwd: path,
        onlyDirectories: true,
        globstar: true,
        extglob: true,
        dot: true,
      };

      const allModuleFolders = fg.sync('**/*', fgConfig);

      // Evaluate the pattern one by one and check if there is any missing a match
      for (let j = 0; j < requiredFolderPatterns.length; j += 1) {
        const requiredFolderPattern = requiredFolderPatterns[j];
        const foldersMatching = fg.sync(requiredFolderPattern, fgConfig);

        if (foldersMatching.length) {
          results.push({
            valid: true,
            resource: requiredFolderPattern,
            message: 'Required folder found',
            rule: rule.name,
            module,
          });
        } else {
          // If there is no match, then it's missing a required folder for this pattern
          results.push({
            valid: false,
            resource: requiredFolderPattern,
            message: 'Required folder not found',
            rule: rule.name,
            module,
          });
        }
      }

      if (strict) {
        const foldersMatchingAllPatterns = fg.sync(requiredFolderPatterns, fgConfig);

        // ? If there's no match for all patterns, then we shouldn't check extra folders
        if (foldersMatchingAllPatterns.length === 0) {
          continue;
        }

        const extraFolders = allModuleFolders.filter(
          (moduleFolder) =>
            !foldersMatchingAllPatterns.some(
              (matchedFolder) =>
                matchedFolder === moduleFolder || matchedFolder.startsWith(`${moduleFolder}/`),
            ),
        );

        if (extraFolders.length) {
          extraFolders.forEach((folder) => {
            results.push({
              valid: false,
              resource: folder,
              message: 'Folder outside the required list not allowed (strict mode)',
              rule: rule.name,
              module,
            });
          });
        }
      }
    }

    return results;
  },
  check() {
    return null;
  },
  docMarkdown() {
    return '* Check whether the folder structure is present in the modules';
  },
  docExampleConfigs() {
    return [
      {
        description: 'Deactivates this rule',
        config: false,
      },
      {
        description: 'Activates this rule using default folders (defaults: `["src"]`)',
        config: true,
      },
      {
        description:
          'Loosely requires module structure. The module should contain **at least** this set of folders, but can still have others.',
        config: {
          strict: false,
          folders: ['src', 'docs', 'libs'],
        },
      },
      {
        description:
          'Strictly requires module structure. No extra folders allowed, should match exactly.',
        config: {
          strict: true,
          folders: ['src/test', 'src/**/utils', 'src/libs/**/release'],
        },
      },
    ];
  },
};

export default rule;
