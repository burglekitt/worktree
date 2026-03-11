// Global mock for the cmd function to prevent actual shell command execution
const mockCmd: ReturnType<typeof vi.fn> = vi.fn();
let expectedCommands: string[] = [];

vi.mock("./lib/cli.js", () => ({
	cmd: mockCmd,
	commandExists: vi.fn().mockResolvedValue(true),
}));

beforeEach(() => {
	// Clear all mocks before each test
	vi.clearAllMocks();
	expectedCommands = [];
});

afterEach(() => {
	// Assert that no unexpected commands were called
	const actualCalls = mockCmd.mock.calls.map((call) => call[0]);
	const unexpectedCalls = actualCalls.filter(
		(call) => !expectedCommands.includes(call),
	);

	if (unexpectedCalls.length > 0) {
		console.warn(
			`Unexpected cmd calls detected:\n${unexpectedCalls
				.map((call) => `  - ${call}`)
				.join("\n")}`,
		);
	}
});

// Helper function for tests to declare expected commands
function expectCommands(...commands: string[]) {
	expectedCommands.push(...commands);
}

// Export the mock and helper for use in tests
export { mockCmd, expectCommands };
