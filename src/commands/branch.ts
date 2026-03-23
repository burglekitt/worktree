import { confirm, input } from "@inquirer/prompts";
import { Args, Flags } from "@oclif/core";
import { fetchGitHubIssue } from "../integrations/github.js";
import { BaseCommand } from "../lib/base-command.js";
import { copyEnvFilesFromRootPath } from "../lib/env.js";
import {
  gitCreateWorktree,
  gitGetConfigValue,
  gitGetLocalBranches,
  gitGetRemoteBranches,
} from "../lib/git.js";
import type { ConfigName } from "../lib/types.js";
import { isValidBranchName } from "../lib/validators.js";

export default class Branch extends BaseCommand {
  static override args = {
    branchName: Args.string({ description: "Name of the branch to create" }),
  };
  static override description = "Create a worktree branch";
  static override examples = [
    "<%= config.bin %> <%= command.id %> my-new-branch",
    "<%= config.bin %> <%= command.id %> my-new-branch --source origin/main",
    "<%= config.bin %> <%= command.id %> --github 42",
  ];

  static override flags = {
    source: Flags.string({
      char: "s",
      description: "Source branch to create the worktree from",
    }),
    github: Flags.string({
      char: "g",
      description: "Create a branch from a GitHub issue (issue number)",
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

  private sanitizeBranchName(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private async getGitHubBranchPrefix(type?: string) {
    if (type === "Feature") {
      return (await gitGetConfigValue("branchPrefix.feature")) || "";
    }
    if (type === "Bug") {
      return (await gitGetConfigValue("branchPrefix.bugfix")) || "";
    }
    if (type === "Task") {
      return (await gitGetConfigValue("branchPrefix.chore")) || "";
    }
    return "";
  }

  private async getGithubIssueBranchName(issueNumberFlag: string) {
    const issueNumber = Number(
      issueNumberFlag.startsWith("#")
        ? issueNumberFlag.slice(1)
        : issueNumberFlag,
    );
    const issue = await fetchGitHubIssue(issueNumber);
    const prefix = await this.getGitHubBranchPrefix(issue.type?.name);
    return `${prefix}${issue.number}-${this.sanitizeBranchName(issue.title) || "issue"}`;
  }

  private async getBranchName(
    branchNameArg?: string,
    flags?: { github?: string },
  ) {
    let defaultValue = "";

    if (flags?.github) {
      defaultValue = await this.getGithubIssueBranchName(flags.github);
    } else if (branchNameArg && this.validateBranchName(branchNameArg)) {
      return branchNameArg;
    }
    return await input({
      message: "Branch name",
      default: defaultValue,
      prefill: "editable",
      validate: isValidBranchName,
    });
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Branch);
    const configNames: ConfigName[] = !flags.source
      ? ["defaultSourceBranch"]
      : [];

    // If there is no source flag provided, make sure defaultSourceBranch is configured
    await this.verifyConfig(configNames);
    const branchName = await this.getBranchName(args.branchName, flags);
    const sourceBranch = await this.getSourceBranch(flags.source);
    const projectPath = await gitCreateWorktree(branchName, sourceBranch);
    await copyEnvFilesFromRootPath(projectPath);
    await this.openWorktreePath(projectPath);
  }
}
