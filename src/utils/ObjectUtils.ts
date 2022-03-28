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

type NonNullable<T> = Exclude<T, null>;
type NonNullProps<T> = { [P in keyof T]: NonNullable<T[P]>; };

export function deleteNullProps<T extends {}>(obj: T): NonNullProps<T> {
  Object.keys(obj).forEach(key => obj[key as keyof T] === null ? delete obj[key as keyof T] : {});
  return obj as NonNullProps<T>;
}

export function extractNullKeys(obj: any): any {
  const nullsObj = Object.fromEntries(Object.entries(obj).filter(([key, value]) => value === null));
  return nullsObj;
}

export function deleteProps(obj: any, nullKeys: string[]): any {
  Object.keys(obj).forEach(key => nullKeys.includes(key) ? delete obj[key] : {});
  return obj;
}