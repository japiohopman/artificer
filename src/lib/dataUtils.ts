/**
 * Safely renders a value that might be a string, number, or object with a name/label.
 */
export const renderNameValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    // Priority of keys to look for
    const priorityKeys = ['name', 'label', 'value', 'index', 'title'];
    for (const key of priorityKeys) {
      if (val[key] !== undefined) {
        return String(val[key]);
      }
    }
    // Fallback if no priority key found
    const firstStringValue = Object.values(val).find(v => typeof v === 'string');
    if (firstStringValue) return String(firstStringValue);
    
    return typeof val.toString === 'function' && val.toString() !== '[object Object]' 
      ? val.toString() 
      : '...';
  }
  return String(val);
};

/**
 * Gets ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export const getOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};
