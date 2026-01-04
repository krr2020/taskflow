import {
	PrdCreateCommand,
	PrdGenerateArchCommand,
	PrdUpdateArchCommand,
	PrdUpdateStandardsCommand,
} from "@krr2020/taskflow";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { context, formatCommandResult } from "./context.js";

export function registerPRDTools(server: McpServer) {
	// Create PRD
	server.registerTool(
		"prd_create",
		{
			description:
				"Create a new PRD (Product Requirements Document) template. If description provided, AI will use it as starting point for requirement gathering.",
			inputSchema: {
				featureName: z
					.string()
					.describe("Name of the feature (e.g., 'user-authentication')"),
				description: z
					.string()
					.optional()
					.describe("Feature description/requirements (optional)"),
			},
		},
		async ({ featureName }) => {
			const cmd = new PrdCreateCommand(context);
			const result = await cmd.execute(featureName);
			return formatCommandResult(result);
		},
	);

	// Generate Architecture
	server.registerTool(
		"prd_generate_arch",
		{
			description:
				"Generate coding-standards.md and ARCHITECTURE-RULES.md from a PRD. Analyzes codebase and PRD to create project-specific standards.",
			inputSchema: {
				prdFile: z
					.string()
					.describe("PRD filename (e.g., '2024-01-15-user-auth.md')"),
			},
		},
		async ({ prdFile }) => {
			const cmd = new PrdGenerateArchCommand(context);
			const result = await cmd.execute(prdFile);
			return formatCommandResult(result);
		},
	);

	// Update Standards
	server.registerTool(
		"prd_update_standards",
		{
			description: "Update coding standards based on rules",
			inputSchema: {
				rule: z.string().describe("Rule to add/update"),
				section: z.string().optional().describe("Section to update"),
			},
		},
		async ({ rule, section }) => {
			const cmd = new PrdUpdateStandardsCommand(context);
			const result = await cmd.execute(rule, section);
			return formatCommandResult(result);
		},
	);

	// Update Architecture
	server.registerTool(
		"prd_update_arch",
		{
			description: "Update architecture rules",
			inputSchema: {
				rule: z.string().describe("Rule to add/update"),
				section: z.string().optional().describe("Section to update"),
			},
		},
		async ({ rule, section }) => {
			const cmd = new PrdUpdateArchCommand(context);
			const result = await cmd.execute(rule, section);
			return formatCommandResult(result);
		},
	);
}
