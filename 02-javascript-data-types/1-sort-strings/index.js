/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * 
 * By Ivan Silantev
 * 
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  if (!Array.isArray(arr)) return [];

  const sortDirection = param === 'asc' ? 1 : -1;

  return [...arr].sort((stringA, stringB) =>
    sortDirection * stringA.localeCompare(stringB, ['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' })
  );
}
