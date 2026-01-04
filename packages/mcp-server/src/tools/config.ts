import { ConfigureAICommand, UpgradeCommand } from "@krr2020/taskflow";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { context, formatCommandResult } from "./context.js";

export function registerConfigTools(server: McpServer) {
	// Configure AI
	server.registerTool(
		"configure_ai",
		{
			description: "Configure AI provider settings",
			inputSchema: {
				provider: z
					.string()
					.optional()
					.describe("AI Provider (openai, anthropic, ollama)"),
				apiKey: z.string().optional().describe("API Key"),
				model: z.string().optional().describe("Model name"),
				enable: z.boolean().optional().describe("Enable AI"),
				disable: z.boolean().optional().describe("Disable AI"),
				ollamaBaseUrl: z.string().optional().describe("Ollama Base URL"),
				openaiBaseUrl: z.string().optional().describe("OpenAI Base URL"),
			},
		},
		async (options) => {
			const cmd = new ConfigureAICommand(context);
			const result = await cmd.execute(options);
			return formatCommandResult(result);
		},
	);

	// Upgrade Templates
	server.registerTool(
		"upgrade_templates",
		{
			description: "Upgrade Taskflow templates in current project",
			inputSchema: {
				force: z.boolean().optional().describe("Force upgrade"),
				auto: z.boolean().optional().describe("Auto upgrade"),
				diff: z.boolean().optional().describe("Show diff only"),
			},
		},
		async (options) => {
			const cmd = new UpgradeCommand(context);
			const result = await cmd.execute(options);
			return formatCommandResult(result);
		},
	);
}
