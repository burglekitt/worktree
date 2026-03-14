import { select } from "@inquirer/prompts";
import { Args } from "@oclif/core";
import ora from "ora";
import { BaseCommand } from "../lib/base-command.js";
import { copyEnvFilesFromRootPath } from "../lib/env.js";
import {
  gitCreateWorktree,
  gitGetLocalBranches,
  gitGetRemoteBranches,
} from "../lib/git.js";

export default class Checkout extends BaseCommand {
  static override args = {
    branchName: Args.string({ description: "Name of the branch to checkout" }),
  };
  static override description = "Checkout worktree branches";
  static override examples = [
    "<%= config.bin %> <%= command.id %>",
    "<%= config.bin %> <%= command.id %> origin/feature/other-branch",
  ];

  private normalizeBranchNameArg(branchNameArg?: string) {
    if (branchNameArg) {
      return branchNameArg?.startsWith("origin/")
        ? branchNameArg
        : `origin/${branchNameArg}`;
    }
  }

  private selectRemoteBranch(remoteBranches: string[]) {
    return select({
      message: "Select a remote branch to checkout",
      choices: remoteBranches.map((branchName) => ({
        name: branchName,
        value: branchName,
      })),
    });
  }

  private getBaseBranchName(branchNameArg: string) {
    return branchNameArg?.replace(/^origin\//, "");
  }

  public async run(): Promise<void> {
    const { args } = await this.parse(Checkout);
    const spinner = ora("Fetching remote branches").start();
    const remoteBranches = await gitGetRemoteBranches();
    const localBranches = await gitGetLocalBranches();
    spinner.stop();

    const branchNameArg = this.normalizeBranchNameArg(args.branchName);
    const sourceBranchName =
      branchNameArg || (await this.selectRemoteBranch(remoteBranches));

    if (sourceBranchName) {
      if (!remoteBranches.includes(sourceBranchName)) {
        this.error(`Remote branch "${sourceBranchName}" not found`);
      }
      const baseBranchName = this.getBaseBranchName(sourceBranchName);

      if (localBranches.includes(baseBranchName)) {
        this.error(`Local branch "${baseBranchName}" already exists`);
      }

      const projectPath = await gitCreateWorktree(
        baseBranchName,
        sourceBranchName,
        { isCheckout: true },
      );
      await copyEnvFilesFromRootPath(projectPath);
      await this.openWorktreePath(projectPath);
    }
  }
}
