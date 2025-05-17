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

  return [...arr].sort((stringA, stringB) => {
    const lowercaseCompare = stringA.toLowerCase().localeCompare(stringB.toLowerCase(), 'ru');
    if (lowercaseCompare) return lowercaseCompare * sortDirection;
    if (stringA[0] !== stringB[0]) return (stringB[0] === stringB[0].toUpperCase() ? 1 : -1) * sortDirection;
    return stringA.localeCompare(stringB, 'ru', { sensitivity: 'variant' }) * sortDirection;
  });
}
