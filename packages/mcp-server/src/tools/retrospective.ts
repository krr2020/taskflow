import { RetroAddCommand, RetroListCommand } from "@krr2020/taskflow";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { context, formatCommandResult } from "./context.js";

export function registerRetrospectiveTools(server: McpServer) {
	// Add Retrospective
	server.registerTool(
		"add_retrospective",
		{
			description:
				"Add a new error pattern to retrospective. Helps prevent repeated mistakes by documenting solutions.",
			inputSchema: {
				category: z
					.string()
					.describe(
						"Error category (type_error, lint, runtime, build, test, etc.)",
					),
				pattern: z
					.string()
					.describe("Error pattern to match in validation output"),
				solution: z.string().describe("Solution to error"),
				criticality: z
					.string()
					.optional()
					.default("medium")
					.describe("Criticality level (low, medium, high)")
					.refine((val) => !val || ["low", "medium", "high"].includes(val), {
						message: "Criticality must be one of: low, medium, high",
					}),
			},
		},
		async ({ category, pattern, solution, criticality }) => {
			const cmd = new RetroAddCommand(context);
			const result = await cmd.execute(
				category,
				pattern,
				solution,
				criticality,
			);
			return formatCommandResult(result);
		},
	);

	// List Retrospectives
	server.registerTool(
		"list_retrospectives",
		{
			description:
				"List all retrospective entries. Can filter by category. Shows error patterns, solutions, and counts.",
			inputSchema: {
				category: z
					.string()
					.optional()
					.describe("Optional: Filter by category"),
			},
		},
		async ({ category }) => {
			const cmd = new RetroListCommand(context);
			const result = await cmd.execute(category);
			return formatCommandResult(result);
		},
	);
}
