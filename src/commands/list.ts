import ora from "ora";
import { BaseCommand } from "../lib/base-command.js";
import { gitGetWorktreeList } from "../lib/git.js";
import { worktreeListEntryToListName } from "../lib/utils.js";

export default class List extends BaseCommand {
  static override description = "List worktree branches";
  static override examples = ["<%= config.bin %> <%= command.id %>"];

  public async run(): Promise<void> {
    await this.parse(List);
    const spinner = ora("Gathering worktree list").start();
    const worktrees = await gitGetWorktreeList();
    spinner.stop();

    worktrees.forEach((wt) => {
      this.log(`- ${worktreeListEntryToListName(wt)}`);
    });
  }
}
