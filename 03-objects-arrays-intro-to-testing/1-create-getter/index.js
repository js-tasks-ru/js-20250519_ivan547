/**
 * createGetter - creates function getter which allows select value from object
 * 
 * By Ivan Silantev 
 * 
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keys = path.split('.');

  return function(obj) {
    let result = obj;

    for (const key of keys) {
      if (
        result === undefined ||
        result === null ||
        !Object.prototype.hasOwnProperty.call(result, key)
      ) {
        return undefined;
      }
      result = result[key];
    }

    return result;
  };
}
