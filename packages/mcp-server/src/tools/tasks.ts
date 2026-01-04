import {
	TaskCreateCommand,
	TasksAddCommand,
	TasksGenerateCommand,
	TasksRefineCommand,
} from "@krr2020/taskflow";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { context, formatCommandResult } from "./context.js";

export function registerTaskTools(server: McpServer) {
	// Generate Tasks
	server.registerTool(
		"tasks_generate",
		{
			description:
				"Generate complete task breakdown from a PRD. Creates features, stories, and tasks with dependencies. If no PRD specified, shows all available PRDs.",
			inputSchema: {
				prdFile: z
					.string()
					.optional()
					.describe(
						"Optional PRD filename. If not provided, lists available PRDs and AI decides.",
					),
			},
		},
		async ({ prdFile }) => {
			const cmd = new TasksGenerateCommand(context);
			const result = await cmd.execute(prdFile);
			return formatCommandResult(result);
		},
	);

	// Refine Tasks
	server.registerTool(
		"tasks_refine",
		{
			description:
				"Refine existing task breakdown with AI. Provide instructions to split large tasks, add more detail, reorganize, or adjust task structure.",
			inputSchema: {
				instructions: z
					.string()
					.describe(
						"Instructions for refinement (e.g., 'Split task 1.1 into smaller tasks', 'Add testing steps to story 2')",
					),
			},
		},
		async ({ instructions }) => {
			const cmd = new TasksRefineCommand(context);
			const result = await cmd.execute(instructions);
			return formatCommandResult(result);
		},
	);

	// Add Task
	server.registerTool(
		"tasks_add",
		{
			description: "Manually add a task to a story.",
			inputSchema: {
				featureId: z.string().describe("Feature ID"),
				storyId: z.string().describe("Story ID"),
				taskTitle: z.string().describe("Task Title"),
				description: z.string().optional().describe("Task Description"),
				skill: z.string().optional().describe("Required Skill"),
				dependencies: z
					.string()
					.optional()
					.describe("Dependencies (comma separated IDs)"),
			},
		},
		async ({
			featureId,
			storyId,
			taskTitle,
			description,
			skill,
			dependencies,
		}) => {
			const cmd = new TasksAddCommand(context);
			const result = await cmd.execute(featureId, storyId, taskTitle, {
				description,
				skill,
				dependencies,
			});
			return formatCommandResult(result);
		},
	);

	// Create Task
	server.registerTool(
		"task_create",
		{
			description: "Create a new standalone task or add to feature/story",
			inputSchema: {
				title: z.string().describe("Task Title"),
				description: z.string().optional().describe("Task Description"),
				intermittent: z.boolean().optional().describe("Is intermittent task"),
				feature: z.string().optional().describe("Feature ID to add to"),
				story: z.string().optional().describe("Story ID to add to"),
			},
		},
		async ({ title, description, intermittent, feature, story }) => {
			const cmd = new TaskCreateCommand(context);
			const result = await cmd.execute(title, description, {
				intermitent: intermittent,
				feature,
				story,
			});
			return formatCommandResult(result);
		},
	);
}
