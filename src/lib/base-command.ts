import { exec } from "node:child_process";
import { confirm } from "@inquirer/prompts";
import { Command } from "@oclif/core";
import type { CommandError } from "@oclif/core/interfaces";
import chalk from "chalk";
import ora from "ora";
import { gitGetConfigValue } from "./git.js";
import type { ConfigName } from "./types.js";

export abstract class BaseCommand extends Command {
  private confirmFirstTimeConfig() {
    const message =
      "Looks like this is your first time running the CLI. Do you want to run the config command now?";
    return confirm({ message });
  }

  private confirmMissingConfig() {
    const message =
      "Some required configuration values are missing. Do you want to run the config command now?";
    return confirm({ message });
  }

  protected async verifyConfig(configNames: ConfigName[] = []) {
    if ((await gitGetConfigValue("has-called-config")) !== "true") {
      if (await this.confirmFirstTimeConfig()) {
        await this.config.runCommand("config");
        return;
      }
    }

    let isMissingConfig = false;
    for (const name of configNames) {
      if (!(await gitGetConfigValue(name))) {
        isMissingConfig = true;
        break;
      }
    }

    if (isMissingConfig) {
      if (await this.confirmMissingConfig()) {
        await this.config.runCommand("config", ["--missing"]);
      }
    }
  }

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
        return;
      }
      // Color the error message red for better visibility
      this.log(chalk.red(`Error: ${error.message}`));
      return;
    }
    return super.catch(error);
  }
}
