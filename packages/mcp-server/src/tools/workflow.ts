import {
	CheckCommand,
	CommitCommand,
	DoCommand,
	ResumeCommand,
	SkipCommand,
	StartCommand,
} from "@krr2020/taskflow";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { context, formatCommandResult } from "./context.js";

export function registerWorkflowTools(server: McpServer) {
	// Start Task
	server.registerTool(
		"start_task",
		{
			description:
				"Start working on a task. Switches to story branch, loads requirements, sets status to SETUP. Provides comprehensive AI guidance.",
			inputSchema: {
				taskId: z.string().describe("Task ID in format N.M.K (e.g., '1.1.0')"),
			},
		},
		async ({ taskId }) => {
			const cmd = new StartCommand(context);
			const result = await cmd.execute(taskId);
			return formatCommandResult(result);
		},
	);

	// Check Task
	server.registerTool(
		"check_task",
		{
			description:
				"Validate current task and advance to next status. Behavior depends on current status (SETUP→PLANNING→IMPLEMENTING→VERIFYING→VALIDATING→COMMITTING).",
			inputSchema: {},
		},
		async () => {
			const cmd = new CheckCommand(context);
			const result = await cmd.execute();
			return formatCommandResult(result);
		},
	);

	// Commit Task
	server.registerTool(
		"commit_task",
		{
			description:
				"Commit changes and complete task. Requires bullet points describing changes. Runs git add, commit, push and marks task as completed.",
			inputSchema: {
				message: z
					.string()
					.describe(
						'Bullet points describing changes (e.g., "- Added feature X\\n- Fixed bug Y")',
					),
			},
		},
		async ({ message }) => {
			const cmd = new CommitCommand(context);
			const result = await cmd.execute(message);
			return formatCommandResult(result);
		},
	);

	// Resume Task
	server.registerTool(
		"resume_task",
		{
			description:
				"Resume a blocked or on-hold task. Restores task to active status and provides guidance on continuing work.",
			inputSchema: {
				status: z
					.string()
					.optional()
					.describe(
						"Status to resume to (setup, implementing, verifying, validating)",
					)
					.refine(
						(val) =>
							!val ||
							["setup", "implementing", "verifying", "validating"].includes(
								val,
							),
						{
							message:
								"Status must be one of: setup, implementing, verifying, validating",
						},
					),
			},
		},
		async ({ status }) => {
			const cmd = new ResumeCommand(context);
			const result = await cmd.execute(status);
			return formatCommandResult(result);
		},
	);

	// Block Task
	server.registerTool(
		"block_task",
		{
			description:
				"Mark current task as blocked with a reason. Saves current status and finds next available task.",
			inputSchema: {
				reason: z.string().describe("Reason for blocking task"),
			},
		},
		async ({ reason }) => {
			const cmd = new SkipCommand(context);
			const result = await cmd.execute(reason);
			return formatCommandResult(result);
		},
	);

	// AI Guidance
	server.registerTool(
		"do_task",
		{
			description:
				"Get AI guidance and instructions for current task step based on status. Returns context-aware guidance for setup, planning, implementing, verifying, validating, or committing phases.",
			inputSchema: {},
		},
		async () => {
			const cmd = new DoCommand(context);
			const result = await cmd.execute();
			return formatCommandResult(result);
		},
	);
}
