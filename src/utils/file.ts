import * as fs from 'fs';

import jsonpointer from 'jsonpointer';
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
 * @param filePath1 File which contents will be extracted using jsonPointerFile1
 * @param jsonPointerFile1 jsonPointer selector
 * @param filePath2 File which contents will be extracted using jsonPointerFile2
 * @param jsonPointerFile2 jsonPointer selector
 * @returns Percent of similarity of the selected contents inside file
 */
const partialContentSimilarity = (
  filePath1: string,
  jsonPointerFile1: string,
  filePath2: string,
  jsonPointerFile2: string,
): number => {
  const contents1 = loadContents(filePath1);
  const partial1 = jsonpointer.get(contents1, jsonPointerFile1);
  const partialText1 = JSON.stringify(partial1);

  const contents2 = loadContents(filePath2);
  const partial2 = jsonpointer.get(contents2, jsonPointerFile2);
  const partialText2 = JSON.stringify(partial2);

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
