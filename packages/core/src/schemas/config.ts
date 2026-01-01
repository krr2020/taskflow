import { z } from "zod";

export const BranchingConfigSchema = z.object({
	strategy: z.enum(["per-story"]).default("per-story"),
	base: z.string().default("main"),
	storyPattern: z.string().default("story/S{id}-{slug}"),
});

export const ContextRuleSchema = z.object({
	trigger: z.array(z.string()),
	files: z.array(z.string()),
});

export const GatesSchema = z.object({
	requirePlanApproval: z.boolean().default(true),
	requireTestPass: z.boolean().default(true),
});

// ============================================================================
// AI Configuration Schema
// ============================================================================

const LLMProviderTypeSchema = z.enum([
	"openai-compatible",
	"anthropic",
	"ollama",
]);

const AIModelsSchema = z.object({
	default: z.string().default("gpt-4o-mini"),
	planning: z.string().optional(),
	execution: z.string().optional(),
	analysis: z.string().optional(),
});

const AIConfigSchema = z
	.object({
		enabled: z.boolean().default(false),
		provider: LLMProviderTypeSchema.default("openai-compatible"),
		apiKey: z.string().optional(),
		models: AIModelsSchema.default({
			default: "gpt-4o-mini",
		}),
		planningProvider: LLMProviderTypeSchema.optional(),
		planningApiKey: z.string().optional(),
		executionProvider: LLMProviderTypeSchema.optional(),
		executionApiKey: z.string().optional(),
		analysisProvider: LLMProviderTypeSchema.optional(),
		analysisApiKey: z.string().optional(),
		ollamaBaseUrl: z.string().default("http://localhost:11434"),
		openaiBaseUrl: z.string().default("https://api.openai.com/v1"),
		autoContinueTask: z.boolean().default(false),
		clearContextOnComplete: z.boolean().default(true),
	})
	.optional();

export const TaskflowConfigSchema = z.object({
	version: z.string().default("2.0"),
	projectType: z.string().default("custom"),
	branching: BranchingConfigSchema.default({
		strategy: "per-story",
		base: "main",
		storyPattern: "story/S{id}-{slug}",
	}),
	contextRules: z.array(ContextRuleSchema).default([]),
	gates: GatesSchema.default({
		requirePlanApproval: true,
		requireTestPass: true,
	}),
	commands: z
		.object({
			validate: z.string().optional(),
			test: z.string().optional(),
		})
		.optional(),
	ai: AIConfigSchema,
});

export type TaskflowConfig = z.infer<typeof TaskflowConfigSchema>;
export type AIConfig = z.infer<typeof AIConfigSchema>;
export type LLMProviderType = z.infer<typeof LLMProviderTypeSchema>;
