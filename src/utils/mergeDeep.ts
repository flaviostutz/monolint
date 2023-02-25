/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
export const mergeDeep = (objects: any[]): any => {
  const isObject = (obj: any): boolean => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    const prevr = prev;
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prevr[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prevr[key] = mergeDeep([pVal, oVal]);
      } else {
        prevr[key] = oVal;
      }
    });

    return prevr;
  }, {});
};
