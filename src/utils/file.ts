import * as fs from 'fs';

import jmespath from 'jmespath';
import levenshtein from 'fast-levenshtein';
import { yamlParse } from 'yaml-cfn';

const fullContentSimilarityPerc = (file1: string, file2: string): number => {
  const file1Contents = fs.readFileSync(file1).toString();
  const file2Contents = fs.readFileSync(file2).toString();
  const diffDist = levenshtein.get(file1Contents, file2Contents);
  return Math.round(((file1Contents.length - diffDist) / file1Contents.length) * 10000) / 100;
};

/**
 * Extracts part of content from file1 and compare with part of the content of file2
 * Files must be *.yml or *.json
 * @param filePath1 File which contents will be extracted using jmespathFile1
 * @param jmespathFile1 jmespath query
 * @param filePath2 File which contents will be extracted using jmespathFile2
 * @param jmespathFile2 jmespath query
 * @returns Percent of similarity of the selected contents inside file
 */
const partialContentSimilarity = (
  filePath1: string,
  jmespathFile1: string,
  filePath2: string,
  jmespathFile2: string,
): number => {
  const contents1 = loadContents(filePath1);
  const partial1 = jmespath.search(contents1, jmespathFile1);
  let partialText1 = '';
  if (partial1) {
    partialText1 = JSON.stringify(partial1);
  }

  const contents2 = loadContents(filePath2);
  const partial2 = jmespath.search(contents2, jmespathFile2);
  let partialText2 = '';
  if (partial2) {
    partialText2 = JSON.stringify(partial2);
  }

  if (!partialText1 || !partialText2) {
    return 0;
  }
  const diffDist = levenshtein.get(partialText1, partialText2);
  const max = Math.round(Math.max(partialText1.length, partialText2.length));
  return Math.round(((max - diffDist) / max) * 10000) / 100;
};

/**
 * Loads a .yml or .json file as an JSON object
 * @param filePath .json or .yml file
 * @returns JSON object
 */
const loadContents = (filePath: string): object => {
  const contents = fs.readFileSync(filePath).toString();
  if (filePath.toLowerCase().endsWith('.yml')) {
    return yamlParse(contents);
  } else if (filePath.toLowerCase().endsWith('.json')) {
    return JSON.parse(contents);
  }
  throw new Error('Only files with extension .yml or .json are supported');
};

export { fullContentSimilarityPerc, partialContentSimilarity, loadContents };
