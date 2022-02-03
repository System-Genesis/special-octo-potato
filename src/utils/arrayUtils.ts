export const filterNullOrUndefined = <T>(arr: (T | undefined | null)[]): T[] => {
  return arr.filter(v => v !== undefined && v !==null) as T[];
}

export const toArray = <T>(val: T | T[]) => Array.isArray(val) ? val : [val];

export const priorityInArray = (values: string[], priorities: string[]) : number => {

  const sortedValues = values.sort((a: string, b: string) => {
    return priorities.indexOf(a) > priorities.indexOf(b) ? 1 : -1;
  });

  return priorities.indexOf(sortedValues[0])

}



