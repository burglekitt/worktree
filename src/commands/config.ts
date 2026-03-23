import { EOL } from "node:os";
import { confirm, input } from "@inquirer/prompts";
import { Args, Flags } from "@oclif/core";
import chalk from "chalk";
import { BaseCommand } from "../lib/base-command.js";
import { CONFIG_NAMES } from "../lib/constants.js";
import { gitGetConfigValue, gitSetConfigValue } from "../lib/git.js";
import type { ConfigName } from "../lib/types.js";
import { conjoin } from "../lib/utils.js";
import {
  isValidBranch,
  isValidCommand,
  isValidEmail,
  validateConfigValue,
} from "../lib/validators.js";

// TODO: Implement properly when Jira integration has been added
const JIRA_ENABLED = false;

export default class Config extends BaseCommand {
  static override description = "Configure worktree CLI settings";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override args = {
    name: Args.string(),
    value: Args.string(),
  };
  static override flags = {
    list: Flags.boolean({
      char: "l",
      description: "List all available variables",
    }),
    yes: Flags.boolean({
      char: "y",
      description: "Answer yes to all prompts",
    }),
    missing: Flags.boolean({
      char: "m",
      description: "Only prompt missing variables",
    }),
    names: Flags.string({
      char: "n",
      description: "Comma-separated list of variable names to prompt",
    }),
  };

  private async renderList(missing: boolean) {
    let count = 0;

    for (const variable of CONFIG_NAMES) {
      const value = await gitGetConfigValue(variable);

      if (missing && value) {
        continue;
      }

      this.log(value ? `${variable}=${value}` : variable);
      count++;
    }

    if (missing && count === 0) {
      this.log("No variables have missing values");
    }
  }

  private getApplicableConfigNames(names?: string): ConfigName[] {
    if (names) {
      return names
        .split(",")
        .filter((name) => CONFIG_NAMES.includes(name.trim() as ConfigName))
        .map((name) => name.trim() as ConfigName);
    }

    return [...CONFIG_NAMES];
  }

  private async getPromptConfigNames(flags: {
    missing: boolean;
    yes: boolean;
    names?: string;
  }): Promise<ConfigName[]> {
    const applicableConfigNames = this.getApplicableConfigNames(flags.names);

    if (flags.missing) {
      const configNames: ConfigName[] = [];
      for (const name of applicableConfigNames) {
        if (!(await gitGetConfigValue(name))) {
          configNames.push(name);
        }
      }
      return configNames;
    }

    return applicableConfigNames;
  }

  private maybePrompt(message: string, alwaysYes = false) {
    if (alwaysYes) {
      return true;
    }
    return confirm({ message });
  }

  private async getInputConfig(name: ConfigName, fallback: string = "") {
    const value = await gitGetConfigValue(name);
    return {
      default: value || fallback,
      prefill: value ? "editable" : "tab",
    } as const;
  }

  private async renderInput(flags: {
    missing: boolean;
    yes: boolean;
    names?: string;
  }) {
    const configNames = await this.getPromptConfigNames(flags);
    const hasJiraPrompt =
      JIRA_ENABLED && configNames.some((name) => name.startsWith("jira"));
    const hasBranchPrefixPrompt = configNames.some((name) =>
      name.startsWith("branchPrefix"),
    );

    // First check if there is anything to prompt
    if (configNames.length === 0) {
      this.log("No missing config found.");
      return;
    }

    function shouldPrompt(name: ConfigName) {
      return configNames.includes(name);
    }

    if (
      hasJiraPrompt &&
      (await this.maybePrompt(
        "Do you want to configure Jira integration?",
        flags.yes,
      ))
    ) {
      if (shouldPrompt("jira.domain")) {
        const jiraDomain = await input({
          message: "Jira subdomain or full domain",
        });
        await gitSetConfigValue("jira.domain", jiraDomain);
      }

      if (shouldPrompt("jira.email")) {
        const jiraEmail = await input({
          message: "Jira email",
          ...(await this.getInputConfig("jira.email")),
          validate: isValidEmail,
        });
        await gitSetConfigValue("jira.email", jiraEmail);
      }
    }

    if (shouldPrompt("defaultSourceBranch")) {
      const defaultBranchName = await input({
        message: "Which branch should new worktrees be based on?",
        ...(await this.getInputConfig("defaultSourceBranch", "origin/main")),
        validate: isValidBranch,
      });
      await gitSetConfigValue("defaultSourceBranch", defaultBranchName);
    }

    if (
      hasBranchPrefixPrompt &&
      (await this.maybePrompt(
        "Do you want to configure branch name prefixes?",
        flags.yes,
      ))
    ) {
      if (shouldPrompt("branchPrefix.feature")) {
        const featurePrefix = await input({
          message: "Prefix for feature branches",
          ...(await this.getInputConfig("branchPrefix.feature", "feature/")),
        });
        await gitSetConfigValue("branchPrefix.feature", featurePrefix);
      }

      if (shouldPrompt("branchPrefix.bugfix")) {
        const bugfixPrefix = await input({
          message: "Prefix for bugfix branches",
          ...(await this.getInputConfig("branchPrefix.bugfix", "fix/")),
        });
        await gitSetConfigValue("branchPrefix.bugfix", bugfixPrefix);
      }

      if (shouldPrompt("branchPrefix.chore")) {
        const chorePrefix = await input({
          message: "Prefix for chore branches",
          ...(await this.getInputConfig("branchPrefix.chore", "chore/")),
        });
        await gitSetConfigValue("branchPrefix.chore", chorePrefix);
      }
    }

    if (
      shouldPrompt("codeEditor") &&
      (await this.maybePrompt(
        "Do you want to automatically open the worktree in a code editor?",
        flags.yes,
      ))
    ) {
      const codeEditor = await input({
        message: "Command to open code editor?",
        ...(await this.getInputConfig("codeEditor", "code")),
        validate: isValidCommand,
      });
      await gitSetConfigValue("codeEditor", codeEditor);
    }

    this.log(`${chalk.green("✔")} Configuration complete!${EOL}`);
  }

  private isValidArgName(name: string): name is ConfigName {
    return CONFIG_NAMES.includes(name as ConfigName);
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Config);

    // Mark that config has been called at least once
    await gitSetConfigValue("has-called-config", "true");

    if (args.name) {
      if (!this.isValidArgName(args.name)) {
        this.error(
          [
            `Unknown config name: ${args.name}`,
            `Available variables: ${conjoin(CONFIG_NAMES)}`,
          ].join(EOL),
        );
      }

      if (args.value) {
        await validateConfigValue(args.name, args.value);
        await gitSetConfigValue(args.name, args.value);
        return;
      }
      await gitGetConfigValue(args.name);
      return;
    }

    if (flags.list) {
      return this.renderList(flags.missing);
    }

    return this.renderInput(flags);
  }
}
