import { beforeEach, describe, expect, it, vi } from "vitest";
import * as cli from "./cli.js";
import * as git from "./git.js";
import { isValidBranch, isValidCommand, isValidEmail } from "./validators.js";

describe("isValidEmail", () => {
	it.each`
		email                             | expected                   | description
		${"user@example.com"}             | ${true}                    | ${"valid basic email"}
		${"test.email@domain.co.uk"}      | ${true}                    | ${"valid email with dots and co.uk"}
		${"user+tag@example.org"}         | ${true}                    | ${"valid email with plus sign"}
		${"user_name@example.net"}        | ${true}                    | ${"valid email with underscore"}
		${"123@example.com"}              | ${true}                    | ${"valid email with numbers"}
		${"user-name@example-site.com"}   | ${true}                    | ${"valid email with hyphens"}
		${"a@b.co"}                       | ${true}                    | ${"valid minimal email"}
		${"user@subdomain.example.com"}   | ${true}                    | ${"valid email with subdomain"}
		${"user@example.info"}            | ${true}                    | ${"valid email with .info tld"}
		${"plainaddress"}                 | ${"Invalid email address"} | ${"missing @ symbol"}
		${"@example.com"}                 | ${"Invalid email address"} | ${"missing local part"}
		${"user@"}                        | ${"Invalid email address"} | ${"missing domain"}
		${"user..double.dot@example.com"} | ${true}                    | ${"double dots in local part (allowed by current regex)"}
		${"user@.example.com"}            | ${true}                    | ${"domain starts with dot (allowed by current regex)"}
		${"user@example."}                | ${"Invalid email address"} | ${"domain ends with dot"}
		${"user@com"}                     | ${"Invalid email address"} | ${"missing top-level domain"}
		${"user name@example.com"}        | ${"Invalid email address"} | ${"space in local part"}
		${"user@example com"}             | ${"Invalid email address"} | ${"space in domain"}
		${""}                             | ${"Invalid email address"} | ${"empty string"}
		${"user@@example.com"}            | ${"Invalid email address"} | ${"double @ symbol"}
		${"user@example..com"}            | ${true}                    | ${"double dots in domain (allowed by current regex)"}
	`(
		'should return $expected for "$email" ($description)',
		({ email, expected }) => {
			expect(isValidEmail(email)).toBe(expected);
		},
	);
});

describe("isValidCommand", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each`
		command                    | commandExists | expected                                      | description
		${"git"}                   | ${true}       | ${true}                                       | ${"existing command"}
		${"node"}                  | ${true}       | ${true}                                       | ${"another existing command"}
		${"git status"}            | ${true}       | ${true}                                       | ${"command with arguments"}
		${"nonexistent"}           | ${false}      | ${"Command not found: nonexistent"}           | ${"non-existing command"}
		${"fake-cmd"}              | ${false}      | ${"Command not found: fake-cmd"}              | ${"another non-existing command"}
		${"bad command with args"} | ${false}      | ${"Command not found: bad command with args"} | ${"non-existing command with args"}
	`(
		'should return $expected for "$command" when commandExists returns $commandExists ($description)',
		async ({ command, commandExists, expected }) => {
			// Mock the commandExists function
			vi.spyOn(cli, "commandExists").mockResolvedValue(commandExists);

			expect(await isValidCommand(command)).toBe(expected);
			expect(cli.commandExists).toHaveBeenCalledWith(command);
		},
	);
});

describe("isValidBranch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock console.log to avoid cluttering test output
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	it.each`
		branch                   | branchType  | availableBranches                                           | expected                                  | description
		${"main"}                | ${"local"}  | ${["main", "develop", "feature/test"]}                      | ${true}                                   | ${"existing local branch"}
		${"develop"}             | ${"local"}  | ${["main", "develop", "feature/test"]}                      | ${true}                                   | ${"another existing local branch"}
		${"feature/test"}        | ${"local"}  | ${["main", "develop", "feature/test"]}                      | ${true}                                   | ${"local branch with slash"}
		${"nonexistent"}         | ${"local"}  | ${["main", "develop", "feature/test"]}                      | ${"Branch not found: nonexistent"}        | ${"non-existing local branch"}
		${"origin/main"}         | ${"remote"} | ${["origin/main", "origin/develop", "origin/feature/test"]} | ${true}                                   | ${"existing remote branch"}
		${"origin/develop"}      | ${"remote"} | ${["origin/main", "origin/develop", "origin/feature/test"]} | ${true}                                   | ${"another existing remote branch"}
		${"origin/feature/test"} | ${"remote"} | ${["origin/main", "origin/develop", "origin/feature/test"]} | ${true}                                   | ${"remote branch with slash"}
		${"origin/nonexistent"}  | ${"remote"} | ${["origin/main", "origin/develop", "origin/feature/test"]} | ${"Branch not found: origin/nonexistent"} | ${"non-existing remote branch"}
		${"upstream/main"}       | ${"remote"} | ${["origin/main", "origin/develop"]}                        | ${"Branch not found: upstream/main"}      | ${"different remote prefix"}
	`(
		'should return $expected for "$branch" when $branchType branches are $availableBranches ($description)',
		async ({ branch, branchType, availableBranches, expected }) => {
			if (branchType === "local") {
				vi.spyOn(git, "gitGetLocalBranches").mockResolvedValue(
					availableBranches,
				);
				vi.spyOn(git, "gitGetRemoteBranches").mockResolvedValue([]);
			} else {
				vi.spyOn(git, "gitGetRemoteBranches").mockResolvedValue(
					availableBranches,
				);
				vi.spyOn(git, "gitGetLocalBranches").mockResolvedValue([]);
			}

			const result = await isValidBranch(branch);
			expect(result).toBe(expected);

			if (branch.startsWith("origin/")) {
				expect(git.gitGetRemoteBranches).toHaveBeenCalled();
				expect(git.gitGetLocalBranches).not.toHaveBeenCalled();
			} else {
				expect(git.gitGetLocalBranches).toHaveBeenCalled();
				expect(git.gitGetRemoteBranches).not.toHaveBeenCalled();
			}
		},
	);
});
