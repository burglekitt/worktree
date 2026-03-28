type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassDictionary
  | ClassArray;

interface ClassDictionary {
  [key: string]: unknown;
}

interface ClassArray extends Array<ClassValue> {}

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const push = (val: ClassValue) => {
    if (!val && val !== 0) return;
    if (typeof val === "string" || typeof val === "number") {
      classes.push(String(val));
      return;
    }
    if (Array.isArray(val)) {
      val.forEach(push);
      return;
    }
    if (typeof val === "object") {
      for (const key in val as ClassDictionary) {
        if (Object.hasOwn(val, key) && (val as ClassDictionary)[key]) {
          classes.push(key);
        }
      }
      return;
    }
  };

  inputs.forEach(push);

  return classes.join(" ");
}
