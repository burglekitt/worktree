import { confirm } from "@inquirer/prompts";
import { Flags } from "@oclif/core";
import chalk from "chalk";
import ora from "ora";
import { BaseCommand } from "../lib/base-command.js";
import {
  gitGetWorktreeList,
  gitRemoveWorktreesWithProgress,
} from "../lib/git.js";
import { worktreeListEntryToListName } from "../lib/utils.js";

export default class Cleanup extends BaseCommand {
  static override description =
    "Cleanup worktree branches by removing stale ones";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {
    force: Flags.boolean({
      char: "f",
      description: "Force cleanup without confirmation",
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Cleanup);
    const spinner = ora("Gathering worktree branches").start();
    const allWorktrees = await gitGetWorktreeList();
    const worktrees = allWorktrees.filter((wt) => wt.safeToRemove === true);

    if (worktrees.length === 0) {
      spinner.succeed("No stale worktree branches found.");
      return;
    }

    if (!flags.force) {
      const count = worktrees.length;
      spinner.info(
        `Found ${chalk.bold(count)} worktree ${count === 1 ? "branch that is" : "branches that are"} marked safe to remove.`,
      );
      worktrees.forEach((wt) => {
        this.log(`- ${worktreeListEntryToListName(wt, "gray")}`);
      });
      const message = `Are you sure you want to delete ${count === 1 ? "it" : "them"}?`;
      if (!(await confirm({ message, default: false }))) {
        return;
      }
    } else {
      spinner.stop();
    }

    await gitRemoveWorktreesWithProgress(worktrees);
  }
}
