#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { StateMachine, ConfigLoader, GitManager } from "@krr2020/taskflow-core";
import fs from "node:fs";
import path from "node:path";
import { generatePrdHandler } from "./handlers/generate-prd.js";
import { generateTasksHandler } from "./handlers/generate-tasks.js";

// Initialize Core Components
const configLoader = new ConfigLoader();
const gitManager = new GitManager();
const stateMachine = new StateMachine(configLoader, gitManager);

// Initialize MCP Server
const server = new Server(
    {
        name: "taskflow-mcp-server",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "init",
                description: "Initialize Taskflow in the current project by creating a taskflow.config.json file.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "start_task",
                description: "Start a new task, checking out the correct story branch and entering PLANNING mode.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: {
                            type: "string",
                            description: "The ID of the task to start (e.g., '1.2.3')",
                        },
                        storyId: {
                            type: "string",
                            description: "The Story ID this task belongs to (e.g., '15')",
                        },
                        slug: {
                            type: "string",
                            description: "Short slug for the story (e.g., 'user-auth')",
                        },
                    },
                    required: ["taskId", "storyId", "slug"],
                },
            },
            {
                name: "approve_plan",
                description: "Approve the implementation plan and switch to EXECUTION mode.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_status",
                description: "Get the current state machine status and active task.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "generate_prd",
                description: "Generate a PRD. Use 'step' to toggle between gathering requirements (instructions), getting the template (instructions), or saving the file.",
                inputSchema: {
                    type: "object",
                    properties: {
                        step: {
                            type: "string",
                            enum: ["requirements_gathering", "generated_template", "save"],
                            description: "The phase of PRD generation."
                        },
                        featureName: { type: "string" },
                        content: { type: "string" }
                    },
                    required: ["step"],
                },
            },
            {
                name: "generate_tasks",
                description: "Generate tasks. Use 'step' to get planning rules/context (reads PRD) or save the generated JSON.",
                inputSchema: {
                    type: "object",
                    properties: {
                        step: {
                            type: "string",
                            enum: ["planning_rules", "save"],
                            description: "The phase of task generation."
                        },
                        prdFileName: { type: "string" },
                        tasksJSON: { type: "object" }
                    },
                    required: ["step"],
                },
            },
            {
                name: "run_checks",
                description: "Run project validations and enter VERIFICATION state.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "submit_task",
                description: "Submit the current task and complete the workflow.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});

// Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "init": {
                const configPath = path.join(process.cwd(), "taskflow.config.json");
                if (fs.existsSync(configPath)) {
                    return {
                        content: [{ type: "text", text: "Taskflow is already initialized." }],
                    };
                }

                const defaultConfig = {
                    project: {
                        name: "my-project",
                        root: ".",
                    },
                    branching: {
                        strategy: "per-story",
                        base: "main",
                        prefix: "story/",
                    },
                };

                fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
                return {
                    content: [
                        {
                            type: "text",
                            text: "Initialized Taskflow! Created taskflow.config.json.",
                        },
                    ],
                };
            }

            case "start_task": {
                const schema = z.object({
                    taskId: z.string(),
                    storyId: z.string(),
                    slug: z.string(),
                });
                const { taskId, storyId, slug } = schema.parse(args);

                await stateMachine.startTask(taskId, storyId, slug);

                return {
                    content: [
                        {
                            type: "text",
                            text: `Task ${taskId} started on branch story/S${storyId}-${slug}. State is now PLANNING.`,
                        },
                    ],
                };
            }

            case "approve_plan": {
                stateMachine.approvePlan();
                return {
                    content: [
                        {
                            type: "text",
                            text: "Plan approved. State is now EXECUTION. You may now write code.",
                        },
                    ],
                };
            }

            case "get_status": {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                state: stateMachine.getState(),
                                activeTask: stateMachine.getActiveTask(),
                            }, null, 2),
                        },
                    ],
                };
            }

            case "generate_prd": {
                return await generatePrdHandler(args);
            }

            case "generate_tasks": {
                return await generateTasksHandler(args);
            }

            case "run_checks": {
                stateMachine.startVerification();
                // TODO: Actually run the validation commands from config
                return {
                    content: [{ type: "text", text: "Verification phase started. Running checks... [MOCK PASSED]" }],
                };
            }

            case "submit_task": {
                stateMachine.completeTask();
                return {
                    content: [{ type: "text", text: "Task submitted and completed. State is now IDLE." }],
                };
            }

            default:
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${name}`
                );
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new McpError(
                ErrorCode.InvalidParams,
                `Invalid arguments: ${error.message}`
            );
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error executing ${name}: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});

// Start Server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Taskflow MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
