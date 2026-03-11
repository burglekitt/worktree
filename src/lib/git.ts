import { EOL } from "node:os";
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
