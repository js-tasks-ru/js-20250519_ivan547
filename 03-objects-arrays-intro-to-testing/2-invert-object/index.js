/**
 * invertObj - should swap object keys and values
 * 
 * By Ivan Silantev 
 * 
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj === undefined) {
    return; 
  }

  const inverted = {};

  for (const [key, value] of Object.entries(obj)) {
    inverted[value] = key;
  }

  return inverted;
}