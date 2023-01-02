import fs from 'fs';

const loadIgnorePatterns = (baseDir: string, useGitIgnore: boolean): string[] => {
  const ignorePaths: string[] = [];

  if (useGitIgnore) {
    const gfile = `${baseDir}/.gitignore`;
    if (fs.existsSync(gfile)) {
      const cf = fs.readFileSync(gfile);
      const ignorePatterns = cf.toString().trim().split('\n');
      const fi = ignorePatterns
        .filter((elem) => {
          return elem.trim().length > 0 && !elem.trim().startsWith('#');
        })
        .map((elem) => {
          if (elem.startsWith('/')) {
            return elem.substring(1);
          }
          return elem;
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
