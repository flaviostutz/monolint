import fs from 'fs';

const loadIgnorePatterns = (baseDir:string):string[] => {
  const cfile = `${baseDir}/.monolintignore`;
  if (fs.existsSync(cfile)) {
    const cf = fs.readFileSync(cfile);
    const ignorePatterns = cf.toString().trim().split('\n');
    const fi = ignorePatterns.filter((elem) => {
      return elem.trim().length > 0 && !elem.trim().startsWith('#');
    });
    const fi2 = fi.map((elem) => {
      return `${baseDir}/${elem}`;
    });
    return fi2;
  }
  return [];
};

export { loadIgnorePatterns };
