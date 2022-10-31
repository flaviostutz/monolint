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

      // ? We can't have patterns for strict mode, as fast-glob doesn't return unmatched patterns
      if (haveGlobPatterns) {
        continue;

        // TODO: implement glob patterns check
        // const entries = fg.sync(requiredFolderPatterns, fgConfig);

        // console.log('entries', entries);
      } else {
        for (const requiredFolderPattern of requiredFolderPatterns) {
          // check if the path exists (joining with module path)
          const folderExists = fs.existsSync(`${path}/${requiredFolderPattern}`);

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
          const allFolders = fs.readdirSync(path).filter((entry) => fs.statSync(`${path}/${entry}`).isDirectory());

          allFolders.forEach((folder) => {
            // if there are files in the folder that are not part of the required structure
            // add a result as invalid
            if (!requiredFolderPatterns.find((pattern) => pattern === folder)) {
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

    }
    return results;
  },
  check() {
    return null;
  },
  docMarkdown() {
    return '* Check whether all the required files are present in the modules folders';
  },
  // TODO: add examples
  docExampleConfigs() {
    return [
      {
        description: 'Deactivates this rule',
        config: false,
      },
    ];
  },
};

export default rule;
