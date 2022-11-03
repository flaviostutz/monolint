import fs from 'fs';

import fg from 'fast-glob';

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

    for (const module of modules) {
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

      const fgConfig = {
        cwd: path,
        onlyDirectories: true,
        globstar: true,
        extglob: true,
        dot: true,
      };
      const haveGlobPatterns = requiredFolderPatterns.some((pattern) => fg.isDynamicPattern(pattern, fgConfig));
      const allModuleFolders = fs.readdirSync(path).filter((entry) => fs.statSync(`${path}/${entry}`).isDirectory());

      // ? We can't have patterns for strict mode, as fast-glob doesn't return unmatched patterns
      if (haveGlobPatterns) {
        // TODO: implement glob patterns
        // const entries = fg.sync(requiredFolderPatterns, fgConfig);

        // console.log('entries', entries);

        continue;
      }

      for (const requiredFolderPattern of requiredFolderPatterns) {
          // check if the folder exists
        const folderExists = allModuleFolders.includes(requiredFolderPattern);

        if (folderExists) {
          results.push({
            valid: true,
            resource: requiredFolderPattern,
            message: 'Required folder found',
            rule: rule.name,
            module,
          });
        } else {
          results.push({
            valid: false,
            resource: requiredFolderPattern,
            message: 'Required folder not found',
            rule: rule.name,
            module,
          });
        }
      }

        // check the strict mode
      if (strict) {
        allModuleFolders.forEach((folder) => {
            // if there are folders in the module that are not part of the required structure
            // add a result as invalid
          if (!requiredFolderPatterns.includes(folder)) {
            results.push({
              valid: false,
              resource: folder,
              message: 'File outside the required list not allowed (strict mode)',
              rule: rule.name,
              module,
            });
          }
        });
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
        description: 'Loosely requires module structure. The module should contain **at least** this set of folders, but can still have others.',
        config: {
          strict: false,
          folders: ['src', 'docs', 'libs'],
        },
      },
      {
        description: 'Strictly requires module structure. No extra folders allowed, should match exactly.',
        config: {
          strict: true,
          // TODO: implement glob patterns
          // "folders": ["src/test", "src/**/utils", "src/libs/**/release"]
          folders: ['src', 'docs', 'libs'],
        },
      },
    ];
  },
};

export default rule;
