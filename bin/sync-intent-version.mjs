import { readFile, writeFile } from "node:fs/promises";

const rootPackagePath = new URL("../package.json", import.meta.url);
const skillMdPath = new URL("../skills/core/SKILL.md", import.meta.url);
const skillTreePath = new URL(
  "../skills/_artifacts/skill_tree.yaml",
  import.meta.url,
);

const rootPackage = JSON.parse(await readFile(rootPackagePath, "utf8"));
const rootVersion = rootPackage.version;

if (!rootVersion) {
  throw new Error("Root package.json is missing a version field.");
}

const skillMdContent = await readFile(skillMdPath, "utf8");
const skillTreeContent = await readFile(skillTreePath, "utf8");

const updatedSkillMd = skillMdContent.replace(
  /^(library_version:\s*)["']?[^"'\s]+["']?\s*$/m,
  `$1"${rootVersion}"`,
);

if (updatedSkillMd === skillMdContent && !skillMdContent.match(/^library_version:/m)) {
  throw new Error("skills/core/SKILL.md: could not find library_version field.");
}

const updatedSkillTree = skillTreeContent.replace(
  /^(  version:\s*)["']?[^"'\s]+["']?\s*$/m,
  `$1'${rootVersion}'`,
);

if (updatedSkillTree === skillTreeContent && !skillTreeContent.match(/^  version:/m)) {
  throw new Error(
    "skills/_artifacts/skill_tree.yaml: could not find library.version field.",
  );
}

await Promise.all([
  writeFile(skillMdPath, updatedSkillMd),
  writeFile(skillTreePath, updatedSkillTree),
]);

console.log(`[intent] Synced skill files to version ${rootVersion}`);
