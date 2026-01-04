import { InitCommand, NextCommand, StatusCommand } from "@krr2020/taskflow";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { context, formatCommandResult } from "./context.js";

export function registerInitializationTools(server: McpServer) {
	// Initialize Taskflow
	server.registerTool(
		"init",
		{
			description:
				"Initialize Taskflow in current project. Creates taskflow.config.json and .taskflow directory structure with template files.",
			inputSchema: {
				projectName: z
					.string()
					.optional()
					.describe("Project name (optional, defaults to directory name)"),
			},
		},
		async ({ projectName }) => {
			const cmd = new InitCommand(context);
			const result = await cmd.execute(projectName);
			return formatCommandResult(result);
		},
	);

	// Get Status
	server.registerTool(
		"get_status",
		{
			description:
				"Get project status, feature status, or story status. Shows progress, tasks, and active task information.",
			inputSchema: {
				id: z
					.string()
					.optional()
					.describe(
						"Optional: Feature ID (N) or Story ID (N.M) to get specific status",
					),
			},
		},
		async ({ id }) => {
			const cmd = new StatusCommand(context);
			const result = await cmd.execute(id);
			return formatCommandResult(result);
		},
	);

	// Find Next Task
	server.registerTool(
		"find_next_task",
		{
			description:
				"Find next available task that can be worked on. Checks dependencies and returns task details.",
			inputSchema: {},
		},
		async () => {
			const cmd = new NextCommand(context);
			const result = await cmd.execute();
			return formatCommandResult(result);
		},
	);
}
