import chalk, { type ColorName } from "chalk";
import type { WorktreeListEntry } from "./types.js";

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

export function strToNum(str: string): number | undefined {
  const num = Number(str);
  if (!Number.isNaN(num)) {
    return num;
  }
}

export function worktreeListEntryToListName(
  wt: WorktreeListEntry,
  color: ColorName = "gray",
): string {
  const details = [];
  if (!wt.pathExists) {
    details.push("Path does not exist");
  }
  if (wt.remote && !wt.remoteExists) {
    details.push(`Remote removed`);
  }
  if (wt.ahead || wt.behind) {
    details.push(`Ahead: ${wt.ahead ?? 0}, Behind: ${wt.behind ?? 0}`);
  }
  if (wt.uncommittedChanges) {
    details.push(
      `${wt.uncommittedChanges} uncommitted ${wt.uncommittedChanges === 1 ? "change" : "changes"}`,
    );
  }

  const detailsStr =
    details.length > 0 ? chalk[color](`(${details.join(", ")})`) : "";

  return `${wt.branchName} ${detailsStr}`;
}
