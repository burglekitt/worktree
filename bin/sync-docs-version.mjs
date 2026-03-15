import { readFile, writeFile } from "node:fs/promises";

const rootPackagePath = new URL("../package.json", import.meta.url);
const docsPackagePath = new URL("../docs/package.json", import.meta.url);
const docsVersionFilePath = new URL(
  "../docs/src/lib/site-version.ts",
  import.meta.url,
);
const docsSiteMetaFilePath = new URL(
  "../docs/src/lib/site-meta.ts",
  import.meta.url,
);

const rootPackage = JSON.parse(await readFile(rootPackagePath, "utf8"));
const docsPackage = JSON.parse(await readFile(docsPackagePath, "utf8"));

const rootVersion = rootPackage.version;

const contributors = Array.isArray(rootPackage.contributors)
  ? rootPackage.contributors
  : [];

const maintainers = contributors
  .map((contributor) => {
    if (!contributor || typeof contributor !== "object") return null;

    const name =
      typeof contributor.name === "string" ? contributor.name.trim() : "";
    const url =
      typeof contributor.url === "string" ? contributor.url.trim() : "";

    if (!name || !url || !url.includes("github.com/")) return null;

    const githubUsername = url.replace(/\/$/, "").split("/").pop();
    if (!githubUsername) return null;

    return {
      name,
      profileUrl: `https://github.com/${githubUsername}`,
      avatarUrl: `https://github.com/${githubUsername}.png?size=64`,
    };
  })
  .filter(Boolean);

if (!rootVersion) {
  throw new Error("Root package.json is missing a version field.");
}

if (docsPackage.version !== rootVersion) {
  docsPackage.version = rootVersion;
  await writeFile(docsPackagePath, `${JSON.stringify(docsPackage, null, 2)}\n`);
}

const versionFileContent = `export const cliVersion = "${rootVersion}";\n`;
await writeFile(docsVersionFilePath, versionFileContent);

const siteMetaFileContent = `export const cliVersion = "${rootVersion}";\n\nexport const maintainers = ${JSON.stringify(
  maintainers,
  null,
  2,
)} as const;\n`;
await writeFile(docsSiteMetaFilePath, siteMetaFileContent);

console.log(`[docs] Synced docs version to ${rootVersion}`);
