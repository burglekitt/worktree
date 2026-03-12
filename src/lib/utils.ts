export function conjoin(
  arr: readonly (string | number)[],
  conjunction: "and" | "or" = "and",
): string {
  if (arr.length === 0) return "";
  if (arr.length === 1) return String(arr[0]);
  if (arr.length === 2) return `${arr[0]} ${conjunction} ${arr[1]}`;

  const allButLast = arr.slice(0, -1).join(", ");
  const last = arr[arr.length - 1];
  return `${allButLast} ${conjunction} ${last}`;
}
