import { EOL } from "node:os";
import path from "node:path";
import ora from "ora";
import { cmd } from "./cli.js";
import type { ConfigName } from "./constants.js";

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

export async function gitGetLocalBranches() {
	const res = await cmd("git --no-pager branch");
	return res.split(EOL).map((branch) => {
		const trimmed = branch.trim();
		if (trimmed.includes(" ")) {
			return trimmed.split(" ")[1];
		}
		return trimmed;
	});
}

export async function gitGetRemoteBranches() {
	const res = await cmd("git --no-pager branch -r");
	return res.split(EOL).map((branch) => {
		const trimmed = branch.trim();
		if (trimmed.includes(" ")) {
			return trimmed.split(" ")[1];
		}
		return trimmed;
	});
}

interface GitCreateWorktreeOptions {
	isRemoteBranch?: boolean;
}

export async function gitCreateWorktree(
	branchName: string,
	sourceBranch: string,
	{ isRemoteBranch = false }: GitCreateWorktreeOptions = {},
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
		// If adding from a remote branch, allow tracking
		const addWorktree = isRemoteBranch
			? `git worktree add ${worktreePath} ${branchName}`
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
