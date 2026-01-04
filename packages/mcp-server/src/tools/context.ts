import process from "node:process";
import type { CommandContext, CommandResult } from "@krr2020/taskflow";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// Create command context
export const context: CommandContext = {
	projectRoot: process.cwd(),
	mcpContext: {
		isMCP: true,
		detectionMethod: "parent_process",
		serverName: "taskflow-mcp-server",
		serverVersion: "0.1.0",
	},
};

// Helper function to format command result for MCP
export function formatCommandResult(result: CommandResult): CallToolResult {
	const parts: string[] = [];

	// Add output
	if (result.output) {
		parts.push(result.output);
	}

	// Add next steps
	if (result.nextSteps) {
		parts.push("\n\nNEXT STEPS:");
		parts.push("─".repeat(60));
		parts.push(result.nextSteps);
	}

	// Add AI guidance
	if (result.aiGuidance) {
		parts.push("\n\nAI GUIDANCE:");
		parts.push("─".repeat(60));
		parts.push(result.aiGuidance);
	}

	// Add context files
	if (result.contextFiles && result.contextFiles.length > 0) {
		parts.push("\n\nCONTEXT FILES:");
		parts.push("─".repeat(60));
		for (const file of result.contextFiles) {
			parts.push(`  ${file}`);
		}
	}

	// Add warnings
	if (result.warnings && result.warnings.length > 0) {
		parts.push("\n\n⚠️  WARNINGS:");
		parts.push("─".repeat(60));
		for (const warning of result.warnings) {
			parts.push(`  ${warning}`);
		}
	}

	// Add errors if failure
	if (result.errors && result.errors.length > 0) {
		parts.push("\n\n✗ ERRORS:");
		parts.push("─".repeat(60));
		for (const error of result.errors) {
			parts.push(`  ${error}`);
		}
	}

	return {
		content: [
			{
				type: "text",
				text: parts.join("\n"),
			},
		],
		isError: result.success === false,
	};
}
