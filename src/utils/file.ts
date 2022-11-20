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
 * Files must be *.yml or *.json.
 * @param filePath1 File which contents will be extracted using jmespathFile1
 * @param jmespathFile1 jmespath query
 * @param filePath2 File which contents will be extracted using jmespathFile2
 * @param jmespathFile2 jmespath query
 * @param onlyMatchingAttributes If jmespath query resolves to a map of attributes (object),
 * only the matching attribute's value will be compared
 * @returns Percent of similarity of the contents inside file for each attribute.
 * '_all' attribute is always returned with the overall similarity
 */
const partialContentSimilarity = (
  filePath1: string,
  jmespathFile1: string,
  filePath2: string,
  jmespathFile2: string,
  onlyMatchingAttributes: boolean = false,
): Record<string, number> => {
  const contents1 = loadContents(filePath1);
  const partial1 = jmespath.search(contents1, jmespathFile1);

  const contents2 = loadContents(filePath2);
  const partial2 = jmespath.search(contents2, jmespathFile2);

  const similarities:Record<string, number> = {};

  // check only matching attributes
  // and return average similarity
  if (onlyMatchingAttributes &&
      (typeof partial1 === 'object') && (typeof partial2 === 'object')) {
    let sum = 0;
    let count = 0;
    for (const key in partial1) {
      // eslint-disable-next-line no-prototype-builtins
      if (partial1.hasOwnProperty(key)) {
        // eslint-disable-next-line no-prototype-builtins
        if (partial2.hasOwnProperty(key)) {
          const p1 = partial1[key];
          const p2 = partial2[key];
          const vv = similarity(p1, p2);
          similarities[key] = vv;
          sum += vv;
          count += 1;
        }
      }
    }
    similarities._all = Math.round((sum / count) * 100) / 100;
    return similarities;
  }

  // compare only simple attribute values found by jmespath query
  if (!partial1 && !partial2) {
    similarities._all = 100;
    return similarities;
  }
  if (!partial1 || !partial2) {
    similarities._all = 0;
    return similarities;
  }
  similarities._all = similarity(JSON.stringify(partial1), JSON.stringify(partial2));
  return similarities;
};

const similarity = (text1:string, text2:string):number => {
  if (!text1 && !text2) {
    return 100;
  }
  if (!text1 || !text2) {
    return 0;
  }
  const diffDist = levenshtein.get(text1, text2);
  const max = Math.round(Math.max(text1.length, text2.length));
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
