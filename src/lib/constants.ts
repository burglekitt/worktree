export const CONFIG_NAMES = [
	"jira.domain",
	"jira.email",
	"jira.apiToken",
	"codeEditor",
	"defaultSourceBranch",
] as const;

export type ConfigName = (typeof CONFIG_NAMES)[number];
