import { commandExists } from "./cli.js";
import { gitGetLocalBranches, gitGetRemoteBranches } from "./git.js";

export function isValidEmail(value: string): true | string {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Invalid email address";
}

export async function isValidCommand(value: string): Promise<true | string> {
	if (!(await commandExists(value))) {
		return `Command not found: ${value}`;
	}
	return true;
}

export async function isValidBranch(value: string): Promise<true | string> {
	const branches = value.startsWith("origin/")
		? await gitGetRemoteBranches()
		: await gitGetLocalBranches();
	return branches.includes(value) || `Branch not found: ${value}`;
}
