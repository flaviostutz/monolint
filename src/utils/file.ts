import * as fs from 'fs';

import levenshtein from 'fast-levenshtein';

const similarityPerc = (file1:string, file2:string):number => {
  const file1Contents = fs.readFileSync(file1).toString();
  const file2Contents = fs.readFileSync(file2).toString();
  const diffDist = levenshtein.get(file1Contents, file2Contents);
  return Math.round(((file1Contents.length - diffDist) / file1Contents.length) * 10000) / 100;
};

export { similarityPerc };
