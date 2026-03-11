import { exec } from "node:child_process";

interface CmdOptions {
	debug?: boolean;
}

export function cmd(
	cmd: string,
	{ debug = false }: CmdOptions = {},
): Promise<string> {
	return new Promise((resolve, reject) => {
		if (debug) {
			console.log(`DEBUG: ${cmd}`);
			resolve("");
			return;
		}
		exec(cmd, (error, stdout) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(stdout?.trim() ?? "");
		});
	});
}

export async function commandExists(command: string): Promise<boolean> {
	try {
		// Extract the base command
		const baseCommand = command.split(" ")[0];

		// Use 'which' on *nix, 'where' on Windows
		const checkCommand = process.platform === "win32" ? "where" : "which";
		await cmd(`${checkCommand} ${baseCommand}`);
		return true;
	} catch {
		return false;
	}
}
