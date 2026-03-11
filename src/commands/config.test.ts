import { beforeEach, describe, expect, it, vi } from "vitest";
import * as git from "../lib/git.js";
import * as validators from "../lib/validators.js";
import Config from "./config.js";

describe("config command", () => {
	let config: Config;
	let mockConsoleLog: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		// biome-ignore lint/suspicious/noExplicitAny: Required for oclif testing
		config = new Config([], {} as any);
		mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	describe("--list flag", () => {
		it("should list all config values when they exist", async () => {
			// Mock the parse method to simulate --list flag
			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(config as any).parse = vi.fn().mockResolvedValue({
				args: {},
				flags: { list: true, missing: false },
			});

			vi.spyOn(git, "gitGetConfigValue")
				.mockResolvedValueOnce("https://test.atlassian.net") // jira.domain
				.mockResolvedValueOnce("test@example.com") // jira.email
				.mockResolvedValueOnce("api-token-123") // jira.apiToken
				.mockResolvedValueOnce("code") // codeEditor
				.mockResolvedValueOnce("origin/main"); // defaultSourceBranch

			await config.run();

			expect(mockConsoleLog).toHaveBeenCalledWith(
				"jira.domain=https://test.atlassian.net",
			);
			expect(mockConsoleLog).toHaveBeenCalledWith(
				"jira.email=test@example.com",
			);
			expect(mockConsoleLog).toHaveBeenCalledWith(
				"jira.apiToken=api-token-123",
			);
			expect(mockConsoleLog).toHaveBeenCalledWith("codeEditor=code");
			expect(mockConsoleLog).toHaveBeenCalledWith(
				"defaultSourceBranch=origin/main",
			);
		});

		it("should list config names when values are missing", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(config as any).parse = vi.fn().mockResolvedValue({
				args: {},
				flags: { list: true, missing: false },
			});

			vi.spyOn(git, "gitGetConfigValue").mockResolvedValue(""); // All empty

			await config.run();

			expect(mockConsoleLog).toHaveBeenCalledWith("jira.domain");
			expect(mockConsoleLog).toHaveBeenCalledWith("jira.email");
			expect(mockConsoleLog).toHaveBeenCalledWith("jira.apiToken");
			expect(mockConsoleLog).toHaveBeenCalledWith("codeEditor");
			expect(mockConsoleLog).toHaveBeenCalledWith("defaultSourceBranch");
		});

		it("should handle --missing flag with no missing values", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(config as any).parse = vi.fn().mockResolvedValue({
				args: {},
				flags: { list: true, missing: true },
			});

			vi.spyOn(git, "gitGetConfigValue").mockResolvedValue("some-value"); // All have values

			await config.run();

			expect(mockConsoleLog).toHaveBeenCalledWith(
				"No variables have missing values",
			);
		});
	});

	describe("setting config values", () => {
		it("should set a valid config value", async () => {
			const mockSetConfigValue = vi
				.spyOn(git, "gitSetConfigValue")
				.mockResolvedValue();
			const mockValidateConfigValue = vi
				.spyOn(validators, "validateConfigValue")
				.mockResolvedValue();

			// Mock the parse method to return the args we want
			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(config as any).parse = vi.fn().mockResolvedValue({
				args: { name: "jira.email", value: "test@example.com" },
				flags: {},
			});

			await config.run();

			expect(mockValidateConfigValue).toHaveBeenCalledWith(
				"jira.email",
				"test@example.com",
			);
			expect(mockSetConfigValue).toHaveBeenCalledWith(
				"jira.email",
				"test@example.com",
			);
		});

		it("should get config value when only name is provided", async () => {
			const mockGetConfigValue = vi
				.spyOn(git, "gitGetConfigValue")
				.mockResolvedValue("test@example.com");

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(config as any).parse = vi.fn().mockResolvedValue({
				args: { name: "jira.email" },
				flags: {},
			});

			await config.run();

			expect(mockGetConfigValue).toHaveBeenCalledWith("jira.email");
		});
	});

	describe("error handling", () => {
		it("should handle unknown config name", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(config as any).parse = vi.fn().mockResolvedValue({
				args: { name: "unknown.setting", value: "test" },
				flags: {},
			});

			await expect(config.run()).rejects.toThrow(
				"Unknown config name: unknown.setting",
			);
		});

		it("should handle invalid config value", async () => {
			vi.spyOn(validators, "validateConfigValue").mockRejectedValue(
				new validators.InvalidConfigValueError("Invalid email address"),
			);

			// biome-ignore lint/suspicious/noExplicitAny: Required for oclif method mocking
			(config as any).parse = vi.fn().mockResolvedValue({
				args: { name: "jira.email", value: "invalid-email" },
				flags: {},
			});

			await expect(config.run()).rejects.toThrow("Invalid email address");
		});
	});
});
