import { confirm, input } from "@inquirer/prompts";
import { Args, Flags } from "@oclif/core";
import type { CommandError } from "@oclif/core/interfaces";
import { BaseCommand } from "../lib/base-command.js";
import { renderError } from "../lib/cli.js";
import { CONFIG_NAMES, type ConfigName } from "../lib/constants.js";
import { gitGetConfigValue, gitSetConfigValue } from "../lib/git.js";
import { conjoin } from "../lib/utils.js";
import {
	InvalidConfigValueError,
	isValidBranch,
	isValidCommand,
	isValidEmail,
	validateConfigValue,
} from "../lib/validators.js";

class UnknownConfigError extends Error {}

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
		help: Flags.help({ char: "h", description: "Show config help" }),
		missing: Flags.boolean({
			char: "m",
			description: "Only prompt missing variables",
		}),
	};

	private async renderList(missing: boolean) {
		let count = 0;

		for (const variable of CONFIG_NAMES) {
			const value = await gitGetConfigValue(variable);

			if (missing && value) {
				continue;
			}

			console.log(value ? `${variable}=${value}` : variable);
			count++;
		}

		if (missing && count === 0) {
			console.log("No variables have missing values");
		}
	}

	private async getPromptConfigNames(missing: boolean) {
		if (missing) {
			const configNames: string[] = [];
			for (const name of CONFIG_NAMES) {
				if (!(await gitGetConfigValue(name))) {
					configNames.push(name);
				}
			}
			return configNames;
		}

		return [...CONFIG_NAMES];
	}

	private async renderInput(missing: boolean) {
		const configNames = await this.getPromptConfigNames(missing);
		const hasJiraPrompt = !!configNames.find((name) => name.startsWith("jira"));

		// First check if there is anything to prompt
		if (configNames.length === 0) {
			console.log("No missing config found.");
			return;
		}

		function shouldPrompt(name: ConfigName) {
			return configNames.includes(name);
		}

		if (
			hasJiraPrompt &&
			(await confirm({ message: "Do you want to configure Jira integration?" }))
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
					validate: isValidEmail,
				});
				await gitSetConfigValue("jira.email", jiraEmail);
			}
		}

		if (shouldPrompt("defaultSourceBranch")) {
			const defaultBranchName = await input({
				message: "Which branch should new worktrees be based on?",
				default: "origin/main",
				validate: isValidBranch,
			});
			await gitSetConfigValue("defaultSourceBranch", defaultBranchName);
		}

		if (
			shouldPrompt("codeEditor") &&
			(await confirm({
				message:
					"Do you want to automatically open the worktree in a code editor?",
			}))
		) {
			const codeEditor = await input({
				message: "Command to open code editor?",
				default: "code",
				validate: isValidCommand,
			});
			await gitSetConfigValue("codeEditor", codeEditor);
		}
	}

	private isValidArgName(name: string): name is ConfigName {
		return CONFIG_NAMES.includes(name as ConfigName);
	}

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(Config);

		if (args.name) {
			if (!this.isValidArgName(args.name)) {
				throw new UnknownConfigError(`Unknown config name: ${args.name}`);
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

		return this.renderInput(flags.missing);
	}

	async catch(error: CommandError) {
		if (error instanceof UnknownConfigError) {
			renderError(error.message);
			console.log(`Available variables: ${conjoin(CONFIG_NAMES)}`);
			return;
		}
		if (error instanceof InvalidConfigValueError) {
			renderError(error.message);
			return;
		}
		return super.catch(error);
	}
}
