import fs from "node:fs";
import { EOL } from "node:os";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import ora from "ora";
import { cmd } from "./cli.js";
import type { ConfigName, WorktreeListEntry } from "./types.js";
import { strToNum } from "./utils.js";

export async function gitGetConfigValue(name: ConfigName) {
  try {
    return await cmd(`git config burglekitt.worktree.${name}`);
  } catch {
    return "";
  }
}

export async function gitSetConfigValue(name: ConfigName, value: string) {
  await cmd(`git config burglekitt.worktree.${name} "${value}"`);
}

async function gitCmdShowTopLevel() {
  return cmd("git rev-parse  --show-toplevel");
}

async function gitCmdGitPath() {
  return cmd("git rev-parse --absolute-git-dir");
}

export async function gitFetch() {
  return cmd("git fetch --prune");
}

export async function gitGetRootPath() {
  try {
    const topLevelPath = await gitCmdShowTopLevel();
    if (!topLevelPath.includes(".worktrees/")) {
      return topLevelPath;
    }
    const gitPathResult = await gitCmdGitPath();
    const gitPath = gitPathResult.split("/.git")[0];
    return gitPath;
  } catch {
    throw new Error(
      `Git: Unable find the root path. Are you in a git repository?`,
    );
  }
}

function parseGetBranchesResult(result: string) {
  return result
    .split(EOL)
    .map((branch) => branch.trim())
    .filter(Boolean)
    .map((branch) => branch.replace(/^[*+]\s+/, ""))
    .filter((branch) => !branch.includes(" -> "));
}

export async function gitGetLocalBranches() {
  const res = await cmd("git --no-pager branch");
  return parseGetBranchesResult(res);
}

export async function gitGetRemoteBranches() {
  await gitFetch();
  const res = await cmd("git --no-pager branch -r");
  return parseGetBranchesResult(res);
}

export async function getCurrentBranchName() {
  return await cmd("git branch --show-current");
}

export async function gitGetAbsoluteWorktreesPath() {
  const gitRootPath = await gitGetRootPath();
  return `${gitRootPath}.worktrees`;
}

export async function gitGetCommitsAheadCount(branchPath: string) {
  const countStr = await cmd(
    `cd ${branchPath} && git rev-list --count @{u}..HEAD`,
  );
  if (countStr) {
    return strToNum(countStr);
  }
}

export async function gitGetCommitsBehindCount(branchPath: string) {
  const countStr = await cmd(
    `cd ${branchPath} && git rev-list --count HEAD..@{u}`,
  );
  if (countStr) {
    return strToNum(countStr);
  }
}

export async function gitGetUncommittedChangesCount(branchPath: string) {
  const result = await cmd(`cd ${branchPath} && git status -s`);
  return result ? result.split(EOL).length : 0;
}

export async function gitGetLocalBranchesTracking() {
  const res = await cmd(
    "git for-each-ref --format='%(refname:short) <- %(upstream:short)' refs/heads",
  );
  return res.split(EOL).map((branch) => {
    const [local, remote] = branch
      .trim()
      .split("<-")
      .map((b) => b.trim());

    return {
      local,
      remote,
    };
  });
}

function isSafeToRemove(wt: WorktreeListEntry) {
  if (!wt.pathExists) {
    // Worktree is defined but doesn't exist in the filesystem.
    return true;
  }
  if (wt.remote && !wt.remoteExists) {
    // Worktree is tracking a remote branch that no longer exists.
    return true;
  }
  if (!wt.remote && !wt.ahead && !wt.behind && wt.uncommittedChanges === 0) {
    // Worktree has no changes and it not tracking any remote branch.
    return true;
  }
}

interface GitGetWorktreeListOptions {
  includeCurrent?: boolean;
}

export async function gitGetWorktreeList({
  includeCurrent = false,
}: GitGetWorktreeListOptions = {}) {
  const currentBranch = await getCurrentBranchName();
  const remoteBranches = await gitGetRemoteBranches();
  const worktreesRootPath = await gitGetAbsoluteWorktreesPath();
  const tracking = await gitGetLocalBranchesTracking();
  const result = await cmd("git worktree list");

  const list = result
    .split(EOL)
    .map((line) => {
      const [path, _, branchStr] = line.replace(/\s\s+/g, " ").split(" ");
      const branchName = branchStr.slice(1, -1);
      const remote = tracking.find((t) => t.local === branchName)?.remote ?? "";
      return { path, branchName, remote };
    })
    // Filter out any branches that are not worktree branches, and also skip the current branch
    .filter(
      ({ path, branchName }) =>
        path.startsWith(worktreesRootPath) &&
        (includeCurrent || branchName !== currentBranch),
    );

  const worktreeList: WorktreeListEntry[] = [];

  for (const { path, branchName, remote } of list) {
    const pathExists = fs.existsSync(path);
    const remoteExists = !!remote && remoteBranches.includes(remote);
    const ahead =
      pathExists && remoteExists
        ? await gitGetCommitsAheadCount(path)
        : undefined;
    const behind =
      pathExists && remoteExists
        ? await gitGetCommitsBehindCount(path)
        : undefined;
    const uncommittedChanges = pathExists
      ? await gitGetUncommittedChangesCount(path)
      : 0;

    const worktreeListEntry: WorktreeListEntry = {
      path,
      branchName,
      remote,
      remoteExists,
      ahead,
      behind,
      pathExists,
      uncommittedChanges,
    };

    worktreeList.push({
      ...worktreeListEntry,
      safeToRemove: isSafeToRemove(worktreeListEntry),
    });
  }

  return worktreeList;
}

interface GitCreateWorktreeOptions {
  isCheckout?: boolean;
}

export async function gitCreateWorktree(
  branchName: string,
  sourceBranch: string,
  { isCheckout = false }: GitCreateWorktreeOptions = {},
): Promise<string> {
  const spinner = ora(`Creating worktree ${branchName}`).start();
  try {
    const currentPath = process.env.PWD;
    const gitRootPath = await gitGetRootPath();
    const worktreesRootPath = `../${path.basename(gitRootPath)}.worktrees`;
    const worktreePath = `${worktreesRootPath}/${branchName}`;
    const absoluteWorktreePath = `${gitRootPath}.worktrees/${branchName}`;
    // cd into the root path so we can create a relative worktree. This ensures that
    // everything stays in sync in case the project is moved in the filesystem.
    const cdRoot = `cd ${gitRootPath}`;
    // Fetch the latest changes from the remote
    const gitFetch = "git fetch";
    // If checking out a remote branch, create a local tracking branch
    const addWorktree = isCheckout
      ? `git worktree add --track -b ${branchName} ${worktreePath} ${sourceBranch}`
      : `git worktree add --no-track -b ${branchName} ${worktreePath} ${sourceBranch}`;
    // Go back
    const gotoBack = `cd ${currentPath}`;
    // Run them all in sequence
    await cmd(`${cdRoot} && ${gitFetch} && ${addWorktree} && ${gotoBack}`);
    // Stop the spinner
    spinner.succeed();
    // Return the absolute path to the new worktree
    return absoluteWorktreePath;
  } catch (error) {
    spinner.fail(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

interface GitNukeWorktreeOptions {
  force?: boolean;
}

async function gitNukeWorktree(
  branchName: string,
  { force = false }: GitNukeWorktreeOptions = {},
) {
  const spinner = ora(`Removing worktree ${branchName}`).start();
  try {
    await cmd(
      `git worktree remove ${branchName}${
        force ? " --force" : ""
      } && git worktree prune && git branch -D ${branchName}`,
    );
    spinner.succeed(`Worktree ${branchName} was removed.`);
  } catch {
    spinner.fail(
      `Failed to remove worktree ${branchName}. It may have already been removed.`,
    );
  }
}

export async function gitRemoveWorktree(
  branchName: string,
  { force = false }: GitNukeWorktreeOptions = {},
) {
  const currentBranch = await getCurrentBranchName();
  if (branchName === currentBranch) {
    throw new Error(
      `Cannot remove current worktree ${branchName}. Go to another worktree or main repository first.`,
    );
  }
  const spinner = ora(`Gathering worktree info for ${branchName}`).start();
  const worktreeList = await gitGetWorktreeList();
  const worktree = worktreeList.find(
    (entry) => entry.branchName === branchName,
  );
  if (!worktree) {
    spinner.fail(`Worktree ${branchName} not found.`);
    return;
  }
  spinner.stop();

  async function promptRemoval(worktree: WorktreeListEntry) {
    if (worktree.ahead) {
      return await confirm({
        message: `This branch is ${worktree.ahead} commits ahead so you might lose some work. Are you sure you want to remove this worktree?`,
        default: false,
      });
    }
    if (worktree.uncommittedChanges) {
      return await confirm({
        message: `This branch has ${worktree.uncommittedChanges} uncommitted change${worktree.uncommittedChanges > 1 ? "s" : ""} so you might lose some work. Are you sure you want to remove this worktree?`,
        default: false,
      });
    }
    return await confirm({
      message: "Are you sure you want to remove this worktree?",
      default: false,
    });
  }

  if (force || (await promptRemoval(worktree))) {
    await gitNukeWorktree(branchName, {
      force: force || !!worktree.ahead || !!worktree.uncommittedChanges,
    });
  }
}
