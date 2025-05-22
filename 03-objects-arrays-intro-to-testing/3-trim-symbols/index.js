/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * 
 * By Ivan Silantev 
 * 
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) return '';
  if (!size) return string;

  let result = '';
  let count = 0;
  let lastChar = null;

  for (const char of string) {
    count = char === lastChar ? count + 1 : 1;
    lastChar = char;
    if (count <= size) result += char;
  }

  return result;
}