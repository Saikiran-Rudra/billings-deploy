/**
 * Get nested value from object using dot notation
 * Example: getNestedValue({ a: { b: 'value' } }, 'a.b') => 'value'
 */
export const getNestedValue = (obj: any, path: string): any => {
  if (!path) return obj;
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
};

/**
 * Set nested value in object using dot notation
 * Returns new object with updated value
 * Example: setNestedValue({ a: { b: 'old' } }, 'a.b', 'new') => { a: { b: 'new' } }
 */
export const setNestedValue = (obj: any, path: string, value: any): any => {
  if (!path) return value;

  const keys = path.split(".");
  const lastKey = keys[keys.length - 1];
  const parentPath = keys.slice(0, -1).join(".");

  const result = { ...obj };

  if (parentPath === "") {
    result[lastKey] = value;
    return result;
  }

  const parent = getNestedValue(result, parentPath);
  if (parent) {
    const updatedParent = { ...parent, [lastKey]: value };
    return setNestedValue(result, parentPath, updatedParent);
  }

  return result;
};

/**
 * Merge nested object updates
 * Recursively merges new values into existing object
 */
export const mergeNestedValues = (existing: any, updates: any): any => {
  const result = { ...existing };

  Object.keys(updates).forEach((key) => {
    if (typeof updates[key] === "object" && updates[key] !== null && !Array.isArray(updates[key])) {
      result[key] = mergeNestedValues(result[key] || {}, updates[key]);
    } else {
      result[key] = updates[key];
    }
  });

  return result;
};
