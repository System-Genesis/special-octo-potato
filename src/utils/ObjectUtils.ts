/**
 * Returns whether Object `obj` has the property `k` and that it is 
 * not `undefined`
 * @param obj 
 * @param k 
 */
export function has<T extends {}, K extends keyof T>(obj: T, k: K): obj is T & Required<Pick<T, typeof k>> {
  return obj.hasOwnProperty(k) && obj[k] !== undefined;
}

export function hasAll<T extends {}, K extends keyof T>(obj: T, keys: K[]): obj is T & Required<Pick<T, typeof keys[number]>> {
  for (const k of keys) {
    if(!has(obj, k)) { return false; }
  }
  return true;
}

export function sanitize(obj: any): any {
  Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : {});
  return obj;
}