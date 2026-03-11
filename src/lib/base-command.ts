import { Command } from "@oclif/core";
import type { CommandError } from "@oclif/core/interfaces";

export abstract class BaseCommand extends Command {
	protected async catch(error: CommandError) {
		if (error instanceof Error && error.name === "ExitPromptError") {
			// Silently exit
			return;
		}
		return super.catch(error);
	}

	protected async finally(_: Error | undefined) {
		// called after run and catch regardless of whether or not the command errored
		return super.finally(_);
	}
}
