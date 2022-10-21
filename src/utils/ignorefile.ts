import fs from 'fs';

import { Config } from '../types/Config';

const loadIgnorePatterns = (baseDir: string, baseConfig: Config): string[] => {

  const ignorePaths:string[] = [];

  if (baseConfig['use-gitignore']) {
    const gfile = `${baseDir}/.gitignore`;
    if (fs.existsSync(gfile)) {
      const cf = fs.readFileSync(gfile);
      const ignorePatterns = cf.toString().trim().split('\n');
      const fi = ignorePatterns.filter((elem) => {
        return elem.trim().length > 0 && !elem.trim().startsWith('#');
      });
      ignorePaths.push(...fi);
    }
  }

  const cfile = `${baseDir}/.monolintignore`;
  if (fs.existsSync(cfile)) {
    const cf = fs.readFileSync(cfile);
    const ignorePatterns = cf.toString().trim().split('\n');
    const fi = ignorePatterns.filter((elem) => {
      return elem.trim().length > 0 && !elem.trim().startsWith('#');
    });
    ignorePaths.push(...fi);
  }

  const fi2 = ignorePaths.map((elem) => {
    return `${baseDir}/**/${elem}`;
  });
  return fi2;

};

export { loadIgnorePatterns };
