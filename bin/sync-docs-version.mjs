import { readFile, writeFile } from "node:fs/promises";

const rootPackagePath = new URL("../package.json", import.meta.url);
const docsVersionFilePath = new URL(
  "../docs/src/lib/site-version.ts",
  import.meta.url,
);
const docsSiteMetaFilePath = new URL(
  "../docs/src/lib/site-meta.ts",
  import.meta.url,
);

const rootPackage = JSON.parse(await readFile(rootPackagePath, "utf8"));

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

const formatMaintainersAsTs = (items) => {
  const lines = items.flatMap((maintainer) => [
    "  {",
    `    name: ${JSON.stringify(maintainer.name)},`,
    `    profileUrl: ${JSON.stringify(maintainer.profileUrl)},`,
    `    avatarUrl: ${JSON.stringify(maintainer.avatarUrl)},`,
    "  },",
  ]);

  if (lines.length === 0) {
    return "[]";
  }

  return `[\n${lines.join("\n")}\n]`;
};

if (!rootVersion) {
  throw new Error("Root package.json is missing a version field.");
}

const versionFileContent = `export const cliVersion = "${rootVersion}";\n`;
await writeFile(docsVersionFilePath, versionFileContent);

const siteMetaFileContent = `export const cliVersion = "${rootVersion}";\n\nexport const maintainers = ${formatMaintainersAsTs(maintainers)} as const;\n`;
await writeFile(docsSiteMetaFilePath, siteMetaFileContent);

console.log(`[docs] Synced site metadata to CLI version ${rootVersion}`);
