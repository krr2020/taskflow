import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrdGenerateArchCommand } from "../../src/commands/prd/generate-arch";

// Hoist mocks
const mocks = vi.hoisted(() => {
	return {
		configLoader: {
			getPaths: vi.fn().mockReturnValue({
				tasksDir: "/test/root/tasks",
				refDir: "/test/root/.taskflow/ref",
			}),
			load: vi.fn(),
			exists: vi.fn().mockReturnValue(true),
		},
		detector: {
			detect: vi.fn(),
		},
		suggester: {
			suggestOptions: vi.fn(),
		},
		generator: {
			generate: vi.fn(),
		},
	};
});

// Mock dependencies
vi.mock("node:fs");

vi.mock("../../src/lib/config-loader", () => {
	return {
		ConfigLoader: vi.fn().mockImplementation(() => mocks.configLoader),
	};
});

vi.mock("../../src/lib/tech-stack-detector", () => {
	return {
		TechStackDetector: vi.fn().mockImplementation(() => mocks.detector),
	};
});

vi.mock("../../src/lib/tech-stack-suggester", () => {
	return {
		TechStackSuggester: vi.fn().mockImplementation(() => mocks.suggester),
	};
});

vi.mock("../../src/lib/tech-stack-generator", () => {
	return {
		TechStackGenerator: vi.fn().mockImplementation(() => mocks.generator),
	};
});

vi.mock("../../src/lib/terminal-formatter", () => ({
	TerminalFormatter: {
		header: (msg: string) => `[HEADER] ${msg}`,
		section: (msg: string) => `[SECTION] ${msg}`,
		info: (msg: string) => `[INFO] ${msg}`,
		success: (msg: string) => `[SUCCESS] ${msg}`,
		warning: (msg: string) => `[WARNING] ${msg}`,
		listItem: (msg: string) => `[ITEM] ${msg}`,
	},
}));

describe("PrdGenerateArchCommand", () => {
	let command: PrdGenerateArchCommand;
	let mockContext: any;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Restore default return values
		mocks.configLoader.getPaths.mockReturnValue({
			tasksDir: "/test/root/tasks",
			refDir: "/test/root/.taskflow/ref",
		});
		mocks.detector.detect.mockResolvedValue({
			languages: [],
			frameworks: [],
			databases: [],
			infrastructure: [],
		});
		mocks.suggester.suggestOptions.mockResolvedValue([]);

		// Mock Context
		mockContext = {
			projectRoot: "/test/root",
			mcpContext: {
				isMCP: false,
				detectionMethod: "none",
			},
			llmProvider: {
				generate: vi.fn(),
				generateStream: vi.fn().mockImplementation(async function* () {
					yield "chunk1";
					yield "chunk2";
				}),
				isConfigured: vi.fn().mockReturnValue(true),
			},
		};

		// Mock fs
		(fs.existsSync as any).mockReturnValue(true);
		(fs.readFileSync as any).mockReturnValue("mock content");
		(fs.writeFileSync as any).mockImplementation(() => {});

		// Spy on console.log
		vi.spyOn(console, "log").mockImplementation(() => {});

		command = new PrdGenerateArchCommand(mockContext);
		// Inject mock LLM provider manually since BaseCommand initializes it from config
		(command as any).llmProvider = mockContext.llmProvider;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should log info message when no existing tech stack is detected (Greenfield)", async () => {
		// Setup mock to return empty stack
		mocks.detector.detect.mockResolvedValue({
			languages: [],
			frameworks: [],
			databases: [],
			infrastructure: [],
		});

		// Mock confirmation to proceed
		vi.spyOn(command as any, "confirm").mockResolvedValue(true);

		// Mock generateStandardsWithLLM to avoid complexity
		vi.spyOn(command as any, "generateStandardsWithLLM").mockResolvedValue({
			success: true,
			message: "Success",
		});

		// Run execute
		await command.execute("test-prd.md");

		// Check if correct header was logged
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining("[HEADER] EXISTING TECH STACK"),
		);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining(
				"[INFO] No existing tech stack detected (Greenfield project).",
			),
		);
	});

	it("should use 8192 maxTokens for LLM generation", async () => {
		// We want to test that the options passed to generateStream have maxTokens: 8192

		// Mock generateStream on the command instance (or context)
		const generateStreamSpy = vi.spyOn(command as any, "generateStream");

		// We need to bypass confirm and other steps
		vi.spyOn(command as any, "confirm").mockResolvedValue(true);

		await command.execute("test-prd.md");

		// Check the calls to generateStream
		expect(generateStreamSpy).toHaveBeenCalledTimes(2);

		const firstCallArgs = generateStreamSpy.mock.calls[0];
		const secondCallArgs = generateStreamSpy.mock.calls[1];

		if (!firstCallArgs || !secondCallArgs) {
			throw new Error("Expected 2 calls to generateStream");
		}

		// args[1] is options
		expect((firstCallArgs[1] as any).maxTokens).toBe(8192);
		expect((secondCallArgs[1] as any).maxTokens).toBe(8192);
	});
});
