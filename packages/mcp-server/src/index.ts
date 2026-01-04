import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerConfigTools } from "./tools/config.js";
import { registerInitializationTools } from "./tools/initialization.js";
import { registerPRDTools } from "./tools/prd.js";
import { registerRetrospectiveTools } from "./tools/retrospective.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerWorkflowTools } from "./tools/workflow.js";

// Initialize MCP Server
const server = new McpServer({
	name: "taskflow-mcp-server",
	version: "0.1.0",
});

// Register all tools by category
registerInitializationTools(server);
registerPRDTools(server);
registerTaskTools(server);
registerWorkflowTools(server);
registerRetrospectiveTools(server);
registerConfigTools(server);

// Start Server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("Taskflow MCP Server running on stdio");
}

main().catch((error) => {
	console.error("Fatal error in main loop:", error);
	process.exit(1);
});
