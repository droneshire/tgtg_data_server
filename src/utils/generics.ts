export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? // @ts-ignore
      `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type NestedData =
  | {
      [key: string]: any;
    }
  | Array<any>;

export function findInNestedDict(data: NestedData, key: string): any {
  if (typeof data === "object" && !Array.isArray(data)) {
    for (const ikey in data) {
      if (ikey === key) {
        return data[ikey];
      }
      const result = findInNestedDict(data[ikey], key);
      if (result !== undefined) {
        return result;
      }
    }
  } else if (Array.isArray(data)) {
    for (const item of data) {
      const result = findInNestedDict(item, key);
      if (result !== undefined) {
        return result;
      }
    }
  }
  return undefined;
}
