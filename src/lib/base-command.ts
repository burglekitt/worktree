import { exec } from "node:child_process";
import { Command } from "@oclif/core";
import type { CommandError } from "@oclif/core/interfaces";
import chalk from "chalk";
import ora from "ora";
import { gitGetConfigValue } from "./git.js";

export abstract class BaseCommand extends Command {
	protected async openWorktreePath(path: string) {
		const codeEditor = await gitGetConfigValue("codeEditor");

		if (codeEditor) {
			const spinner = ora(`Opening in ${codeEditor}`).start();
			exec(`${codeEditor} ${path}`, (error) => {
				if (error) {
					spinner.fail(error.message);
				} else {
					spinner.succeed();
				}
			});
		} else {
			this.log(`${chalk.green("✔")} Worktree created in ${path}`);
		}
	}

	protected async catch(error: CommandError) {
		if (error instanceof Error) {
			if (error.name === "ExitPromptError") {
				// Silently exit
				this.exit();
			}
			// Color the error message red for better visibility
			this.log(chalk.red(`Error: ${error.message}`));
			this.exit();
		}
		return super.catch(error);
	}
}
