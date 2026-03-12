import { confirm, input } from "@inquirer/prompts";
import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../lib/base-command.js";
import { copyEnvFilesFromRootPath } from "../lib/env.js";
import {
	gitCreateWorktree,
	gitGetConfigValue,
	gitGetLocalBranches,
	gitGetRemoteBranches,
} from "../lib/git.js";
import { isValidBranchName } from "../lib/validators.js";

export default class Branch extends BaseCommand {
	static override args = {
		branchName: Args.string({ description: "Name of the branch to create" }),
	};
	static override description = "Create a worktree branch";
	static override examples = [
		"<%= config.bin %> <%= command.id %> my-new-branch",
	];
	static override flags = {
		source: Flags.string({
			char: "s",
			description: "Source branch to create the worktree from",
		}),
	};

	private confirmNonOriginSource() {
		const message =
			"The source branch does not start with 'origin/'. Are you sure you want to use a local source?";
		return confirm({ message });
	}

	private confirmRemoteNameConflict() {
		const message =
			"A remote branch with the same name exists. Do you want to use the remote branch instead?";
		return confirm({ message });
	}

	private async getSourceBranch(sourceFlag?: string) {
		if (sourceFlag) {
			const remoteBranches = await gitGetRemoteBranches();

			if (sourceFlag.startsWith("origin/")) {
				if (!remoteBranches.includes(sourceFlag)) {
					this.error(`Source branch doesn't exist: ${sourceFlag}`);
				}
				return sourceFlag;
			}

			if (await this.confirmNonOriginSource()) {
				const localBranches = await gitGetLocalBranches();
				if (!localBranches.includes(sourceFlag)) {
					this.error(`Source branch doesn't exist: ${sourceFlag}`);
				}
				if (remoteBranches.includes(`origin/${sourceFlag}`)) {
					if (await this.confirmRemoteNameConflict()) {
						return `origin/${sourceFlag}`;
					}
				}
				return sourceFlag;
			}
		}
		return (await gitGetConfigValue("defaultSourceBranch")) || "origin/main";
	}

	private validateBranchName(branchName: string) {
		const result = isValidBranchName(branchName);
		if (result !== true) {
			this.error(result);
		}
		return true;
	}

	private async getBranchName(branchNameArg?: string) {
		if (branchNameArg && this.validateBranchName(branchNameArg)) {
			return branchNameArg;
		}
		return await input({ message: "Branch name", validate: isValidBranchName });
	}

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(Branch);
		// If there is no source flag provided, make sure defaultSourceBranch is configured
		await this.verifyConfig(flags.source ? [] : ["defaultSourceBranch"]);
		const branchName = await this.getBranchName(args.branchName);
		const sourceBranch = await this.getSourceBranch(flags.source);
		const projectPath = await gitCreateWorktree(branchName, sourceBranch);
		await copyEnvFilesFromRootPath(projectPath);
		await this.openWorktreePath(projectPath);
	}
}
