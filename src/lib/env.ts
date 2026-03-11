import fs from "node:fs";
import { glob } from "glob";
import ora from "ora";
import { gitGetRootPath } from "./git.js";

export async function copyEnvFilesFromRootPath(
	destinationWorktreePath: string,
) {
	const gitRootPath = await gitGetRootPath();

	// Find both .env and .env.local files
	const envResults = await glob(`${gitRootPath}/**/.{env,env.local}`, {
		ignore: ["node_modules/**"],
	});

	const rootEnvFiles = envResults
		// Change to a relative path
		.map((filePath) => filePath.substring(gitRootPath.length + 1));

	for (const envFile of rootEnvFiles) {
		const sourceFile = `${gitRootPath}/${envFile}`;
		const destinationFile = `${destinationWorktreePath}/${envFile}`;
		const spinner = ora(`Copying ${sourceFile} to worktree`).start();
		fs.copyFileSync(sourceFile, destinationFile);
		spinner.succeed();
	}
}
