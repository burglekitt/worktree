import { confirm, input } from "@inquirer/prompts";
import { copyEnvFilesFromRootPath } from "../lib/env.js";
import * as git from "../lib/git.js";
import * as validators from "../lib/validators.js";
import Branch from "./branch.js";

// Mock the inquirer module
vi.mock("@inquirer/prompts", () => ({
	confirm: vi.fn(),
	input: vi.fn(),
}));

// Mock env functions
vi.mock("../lib/env.js", () => ({
	copyEnvFilesFromRootPath: vi.fn().mockResolvedValue(undefined),
}));

describe("branch command", () => {
	let branch: Branch;
	let mockOpenWorktreePath: ReturnType<typeof vi.spyOn>;
	const mockInput = vi.mocked(input);
	const mockConfirm = vi.mocked(confirm);
	const mockCopyEnvFiles = vi.mocked(copyEnvFilesFromRootPath);

	beforeEach(() => {
		vi.clearAllMocks();
		// biome-ignore lint/suspicious/noExplicitAny: Required for oclif testing
		branch = new Branch([], {} as any);
		mockOpenWorktreePath = vi
			// biome-ignore lint/suspicious/noExplicitAny: Required for spying on protected method
			.spyOn(branch as any, "openWorktreePath")
			.mockResolvedValue(undefined);
	});

	describe("basic functionality", () => {
		it("should create worktree with valid branch name and default source", async () => {
			const mockGitCreateWorktree = vi
				.spyOn(git, "gitCreateWorktree")
				.mockResolvedValue("/path/to/worktree");
			vi.spyOn(git, "gitGetConfigValue").mockResolvedValue("origin/main");

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "feature/test" },
				flags: {},
			});

			await branch.run();

			expect(mockGitCreateWorktree).toHaveBeenCalledWith(
				"feature/test",
				"origin/main",
			);
			expect(mockCopyEnvFiles).toHaveBeenCalledWith("/path/to/worktree");
			expect(mockOpenWorktreePath).toHaveBeenCalledWith("/path/to/worktree");
		});

		it("should prompt for branch name when not provided", async () => {
			mockInput.mockResolvedValue("prompted-branch");
			const mockGitCreateWorktree = vi
				.spyOn(git, "gitCreateWorktree")
				.mockResolvedValue("/path/to/worktree");
			vi.spyOn(git, "gitGetConfigValue").mockResolvedValue("origin/main");

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: {},
				flags: {},
			});

			await branch.run();

			expect(mockInput).toHaveBeenCalledWith({
				message: "Branch name",
				validate: validators.isValidBranchName,
			});
			expect(mockGitCreateWorktree).toHaveBeenCalledWith(
				"prompted-branch",
				"origin/main",
			);
		});

		it("should use custom source branch when provided", async () => {
			const mockGitCreateWorktree = vi
				.spyOn(git, "gitCreateWorktree")
				.mockResolvedValue("/path/to/worktree");
			vi.spyOn(git, "gitGetRemoteBranches").mockResolvedValue([
				"origin/main",
				"origin/develop",
			]);

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "feature/test" },
				flags: { source: "origin/develop" },
			});

			await branch.run();

			expect(mockGitCreateWorktree).toHaveBeenCalledWith(
				"feature/test",
				"origin/develop",
			);
		});
	});

	describe("branch name validation", () => {
		it("should validate branch name and throw error for invalid name", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "invalid..branch" },
				flags: {},
			});

			const mockError = vi.spyOn(branch, "error").mockImplementation(() => {
				throw new Error("Branch name cannot contain double dots");
			});

			await expect(branch.run()).rejects.toThrow(
				"Branch name cannot contain double dots",
			);
			expect(mockError).toHaveBeenCalledWith(
				"Branch name cannot contain double dots",
			);
		});
	});

	describe("source branch handling", () => {
		it("should handle non-existing origin source branch", async () => {
			vi.spyOn(git, "gitGetRemoteBranches").mockResolvedValue(["origin/main"]);

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "feature/test" },
				flags: { source: "origin/nonexistent" },
			});

			const mockError = vi.spyOn(branch, "error").mockImplementation(() => {
				throw new Error("Source branch doesn't exist: origin/nonexistent");
			});

			await expect(branch.run()).rejects.toThrow(
				"Source branch doesn't exist: origin/nonexistent",
			);
			expect(mockError).toHaveBeenCalledWith(
				"Source branch doesn't exist: origin/nonexistent",
			);
		});

		it("should handle local source branch with confirmation", async () => {
			vi.spyOn(git, "gitGetRemoteBranches").mockResolvedValue(["origin/main"]);
			vi.spyOn(git, "gitGetLocalBranches").mockResolvedValue([
				"main",
				"develop",
			]);
			mockConfirm.mockResolvedValue(true);
			const mockGitCreateWorktree = vi
				.spyOn(git, "gitCreateWorktree")
				.mockResolvedValue("/path/to/worktree");

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "feature/test" },
				flags: { source: "develop" },
			});

			await branch.run();

			expect(mockConfirm).toHaveBeenCalledWith({
				message:
					"The source branch does not start with 'origin/'. Are you sure you want to use a local source?",
			});
			expect(mockGitCreateWorktree).toHaveBeenCalledWith(
				"feature/test",
				"develop",
			);
		});

		it("should handle local source branch with remote conflict confirmation", async () => {
			vi.spyOn(git, "gitGetRemoteBranches").mockResolvedValue([
				"origin/main",
				"origin/develop",
			]);
			vi.spyOn(git, "gitGetLocalBranches").mockResolvedValue([
				"main",
				"develop",
			]);
			mockConfirm
				.mockResolvedValueOnce(true) // Confirm using local source
				.mockResolvedValueOnce(true); // Confirm using remote instead
			const mockGitCreateWorktree = vi
				.spyOn(git, "gitCreateWorktree")
				.mockResolvedValue("/path/to/worktree");

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "feature/test" },
				flags: { source: "develop" },
			});

			await branch.run();

			expect(mockConfirm).toHaveBeenNthCalledWith(2, {
				message:
					"A remote branch with the same name exists. Do you want to use the remote branch instead?",
			});
			expect(mockGitCreateWorktree).toHaveBeenCalledWith(
				"feature/test",
				"origin/develop",
			);
		});

		it("should fallback to origin/main when no default source is configured", async () => {
			const mockGetConfigValue = vi
				.spyOn(git, "gitGetConfigValue")
				.mockResolvedValue("");
			const mockGitCreateWorktree = vi
				.spyOn(git, "gitCreateWorktree")
				.mockResolvedValue("/path/to/worktree");

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "feature/test" },
				flags: {},
			});

			await branch.run();

			expect(mockGetConfigValue).toHaveBeenCalledWith("defaultSourceBranch");
			expect(mockGitCreateWorktree).toHaveBeenCalledWith(
				"feature/test",
				"origin/main",
			);
		});

		it("should handle non-existing local source branch", async () => {
			vi.spyOn(git, "gitGetRemoteBranches").mockResolvedValue(["origin/main"]);
			vi.spyOn(git, "gitGetLocalBranches").mockResolvedValue(["main"]);
			mockConfirm.mockResolvedValue(true);

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "feature/test" },
				flags: { source: "nonexistent" },
			});

			const mockError = vi.spyOn(branch, "error").mockImplementation(() => {
				throw new Error("Source branch doesn't exist: nonexistent");
			});

			await expect(branch.run()).rejects.toThrow(
				"Source branch doesn't exist: nonexistent",
			);
			expect(mockError).toHaveBeenCalledWith(
				"Source branch doesn't exist: nonexistent",
			);
		});

		it("should reject using local source when confirmation is denied", async () => {
			vi.spyOn(git, "gitGetRemoteBranches").mockResolvedValue(["origin/main"]);
			mockConfirm.mockResolvedValue(false);
			vi.spyOn(git, "gitGetConfigValue").mockResolvedValue("origin/main");
			const mockGitCreateWorktree = vi
				.spyOn(git, "gitCreateWorktree")
				.mockResolvedValue("/path/to/worktree");

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(branch as any).parse = vi.fn().mockResolvedValue({
				args: { branchName: "feature/test" },
				flags: { source: "develop" },
			});

			await branch.run();

			expect(mockConfirm).toHaveBeenCalledWith({
				message:
					"The source branch does not start with 'origin/'. Are you sure you want to use a local source?",
			});
			// Should fallback to default source branch
			expect(mockGitCreateWorktree).toHaveBeenCalledWith(
				"feature/test",
				"origin/main",
			);
		});
	});
});
