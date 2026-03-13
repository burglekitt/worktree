import type { CONFIG_NAMES } from "./constants.js";

export type ConfigName = (typeof CONFIG_NAMES)[number];

export interface WorktreeListEntry {
  path: string;
  branchName: string;
  remote: string;
  ahead?: number;
  behind?: number;
  remoteExists?: boolean;
  pathExists?: boolean;
  uncommittedChanges?: number;
  safeToRemove?: boolean;
}
