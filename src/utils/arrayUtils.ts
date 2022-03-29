export const filterNullOrUndefined = <T>(arr: (T | undefined | null)[]): T[] => {
    return arr.filter((v) => v !== undefined && v !== null) as T[];
};

export const toArray = <T>(val: T | T[]) => (Array.isArray(val) ? val : [val]);
