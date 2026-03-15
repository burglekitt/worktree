import { readFile, writeFile } from "node:fs/promises";

const rootPackagePath = new URL("../package.json", import.meta.url);
const docsPackagePath = new URL("../docs/package.json", import.meta.url);
const docsVersionFilePath = new URL(
  "../docs/src/lib/site-version.ts",
  import.meta.url,
);

const rootPackage = JSON.parse(await readFile(rootPackagePath, "utf8"));
const docsPackage = JSON.parse(await readFile(docsPackagePath, "utf8"));

const rootVersion = rootPackage.version;

if (!rootVersion) {
  throw new Error("Root package.json is missing a version field.");
}

if (docsPackage.version !== rootVersion) {
  docsPackage.version = rootVersion;
  await writeFile(docsPackagePath, `${JSON.stringify(docsPackage, null, 2)}\n`);
}

const versionFileContent = `export const cliVersion = "${rootVersion}";\n`;
await writeFile(docsVersionFilePath, versionFileContent);

console.log(`[docs] Synced docs version to ${rootVersion}`);
