import { Config } from '../types/Config';

import { Recommended } from './defaults/recommended';
import { Basic } from './defaults/basic';
import { Serverless } from './defaults/serverless';
import { PackageJson } from './defaults/packagejson';
import { mergeConfigs } from './config-resolver';

const configExtensions = new Map<string, Config>();

const loadExtension = (name: string): Config | null => {
  let mergedConfig = configExtensions.get(name);

  if (!mergedConfig) {
    return null;
  }

  // resolve extensions
  const mergedConfigExtends = mergedConfig.extends;
  if (mergedConfigExtends) {
    for (let i = 0; i < mergedConfigExtends.length; i += 1) {
      const extend = mergedConfigExtends[i];
      const otherConfig = loadExtension(extend);
      if (!otherConfig) {
        throw new Error(`Cannot find extension '${extend}'`);
      }
      mergedConfig = mergeConfigs(mergedConfig, otherConfig);
    }
  }

  return mergedConfig;
};

const registerConfigExtension = (name: string, config: Config): void => {
  configExtensions.set(name, config);
};

// register default extensions in order of least dependant
registerConfigExtension('monolint:basic', Basic);
registerConfigExtension('monolint:serverless', Serverless);
registerConfigExtension('monolint:packagejson', PackageJson);
registerConfigExtension('monolint:recommended', Recommended);

export { loadExtension, registerConfigExtension };
