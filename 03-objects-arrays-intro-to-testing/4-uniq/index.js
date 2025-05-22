/**
 * uniq - returns array of uniq values:
 * 
 * By Ivan Silantev 
 * 
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
    return Array.from(new Set(arr));
}
