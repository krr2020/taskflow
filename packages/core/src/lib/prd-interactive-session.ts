/**
 * Interactive PRD Creation Session
 *
 * Creates a conversational interface for gathering PRD information,
 * similar to how an LLM would ask questions.
 */

import type { BaseCommand } from "../commands/base.js";
import {
	InteractiveSession,
	type SessionConfig,
} from "./interactive-session.js";

export interface PRDSessionData {
	featureName: string;
	title: string;
	overview: string;
	problemStatement: string;
	targetAudience: string;
	userStories: string[];
	functionalRequirements: string[];
	nonFunctionalRequirements: string[];
	successCriteria: string[];
	exclude: string[];
	dependencies: string[];
	riskMitigation: string[];
}

export class PRDInteractiveSession extends InteractiveSession<PRDSessionData> {
	constructor(command: BaseCommand) {
		const config: SessionConfig = {
			title: "PRD Creation - Interactive Session",
			description:
				"I'll help you create a comprehensive PRD by asking you a series of questions. You can skip any question by pressing Enter, and you can type 'quit' or 'exit' at any time to cancel.",
			showSteps: true,
			allowQuit: true,
		};
		super(command, config);
	}

	/**
	 * Override start method to handle pre-provided feature name
	 */
	override async start(
		initialDataOrName?: Partial<PRDSessionData> | string,
	): Promise<PRDSessionData> {
		// Handle string argument (feature name)
		if (typeof initialDataOrName === "string") {
			this.data.featureName = initialDataOrName;
			return super.start();
		}

		// Handle object argument or undefined
		return super.start(initialDataOrName);
	}

	/**
	 * Implement abstract runSteps method
	 */
	protected async runSteps(): Promise<void> {
		// Feature name (already set if provided, otherwise ask)
		if (!this.data.featureName) {
			await this.askFeatureName();
		} else {
			// Use pre-provided name as title as well
			this.data.title = this.data.featureName;
		}

		// Overview section
		await this.askOverview();
		await this.askProblemStatement();
		await this.askTargetAudience();

		// Requirements section
		await this.askUserStories();
		await this.askFunctionalRequirements();
		await this.askNonFunctionalRequirements();

		// Success & Constraints
		await this.askSuccessCriteria();
		await this.askExclusions();
		await this.askDependencies();
		await this.askRisks();
	}

	/**
	 * Implement abstract showSummary method
	 */
	protected showSummary(): void {
		console.log("\nHere's what I've gathered:\n");

		console.log(`Feature: ${this.data.featureName}`);
		console.log(`Title: ${this.data.title}`);

		if (this.data.overview) {
			console.log(`\nOverview:`);
			console.log(`  ${this.data.overview}`);
		}

		if (this.data.problemStatement) {
			console.log(`\nProblem:`);
			console.log(`  ${this.data.problemStatement}`);
		}

		if (this.data.targetAudience) {
			console.log(`\nTarget Audience: ${this.data.targetAudience}`);
		}

		if (this.data.userStories && this.data.userStories.length > 0) {
			console.log(`\nUser Stories: ${this.data.userStories.length}`);
			this.data.userStories.forEach((story, i) => {
				console.log(
					`  ${i + 1}. ${story.substring(0, 60)}${story.length > 60 ? "..." : ""}`,
				);
			});
		}

		if (
			this.data.functionalRequirements &&
			this.data.functionalRequirements.length > 0
		) {
			console.log(
				`\nFunctional Requirements: ${this.data.functionalRequirements.length}`,
			);
			this.data.functionalRequirements.forEach((req, i) => {
				console.log(
					`  ${i + 1}. ${req.substring(0, 60)}${req.length > 60 ? "..." : ""}`,
				);
			});
		}

		if (
			this.data.nonFunctionalRequirements &&
			this.data.nonFunctionalRequirements.length > 0
		) {
			console.log(
				`\nNon-Functional Requirements: ${this.data.nonFunctionalRequirements.length}`,
			);
			this.data.nonFunctionalRequirements.forEach((req, i) => {
				console.log(
					`  ${i + 1}. ${req.substring(0, 60)}${req.length > 60 ? "..." : ""}`,
				);
			});
		}

		if (this.data.successCriteria && this.data.successCriteria.length > 0) {
			console.log(`\nSuccess Criteria: ${this.data.successCriteria.length}`);
			this.data.successCriteria.forEach((criteria, i) => {
				console.log(
					`  ${i + 1}. ${criteria.substring(0, 60)}${criteria.length > 60 ? "..." : ""}`,
				);
			});
		}

		const sections = [
			this.data.exclude?.length,
			this.data.dependencies?.length,
			this.data.riskMitigation?.length,
		].filter((n) => n !== undefined && n > 0);

		if (sections.length > 0) {
			console.log(`\nAdditional Sections: ${sections.join(", ")}`);
		}
	}

	/**
	 * Ask feature name
	 */
	private async askFeatureName(): Promise<void> {
		this.showStep("FEATURE NAME");

		const result = await this.prompt("What feature are you building?");

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		const name = result.value;

		// Validate required field
		if (!name || name.trim().length === 0) {
			throw new Error("Feature name is required");
		}

		this.data.featureName = name;
		this.data.title = name;
	}

	/**
	 * Ask for overview/description
	 */
	private async askOverview(): Promise<void> {
		this.showStep("OVERVIEW");

		const result = await this.prompt(
			"Provide a brief overview of this feature (1-2 sentences)",
		);

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.overview = result.value || "Feature to be defined.";
	}

	/**
	 * Ask for problem statement
	 */
	private async askProblemStatement(): Promise<void> {
		this.showStep("PROBLEM STATEMENT");
		console.log("\nWhat problem does this feature solve?");
		console.log("(You can skip this with Enter)\n");

		const result = await this.prompt("Describe the problem or pain point");

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.problemStatement = result.value || "";
	}

	/**
	 * Ask for target audience
	 */
	private async askTargetAudience(): Promise<void> {
		this.showStep("TARGET AUDIENCE");
		console.log("\nWho is this feature for?\n");

		const result = await this.prompt(
			"Target users or audience (e.g., 'end users', 'admins', 'developers')",
		);

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.targetAudience = result.value || "All users";
	}

	/**
	 * Ask for user stories
	 */
	private async askUserStories(): Promise<void> {
		this.showStep("USER STORIES");
		console.log("\nLet's define what users want to do.");
		console.log("User stories follow the format:");
		console.log("  As a <user>, I want <action>, so that <benefit>\n");

		const result = await this.promptList(
			"Enter user stories (one per line, empty line to finish)",
			"Example: As an admin, I want to reset user passwords, so that I can help users who forget them",
		);

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.userStories = result.items;
	}

	/**
	 * Ask for functional requirements
	 */
	private async askFunctionalRequirements(): Promise<void> {
		this.showStep("FUNCTIONAL REQUIREMENTS");
		console.log("\nWhat must this feature do?");
		console.log("Be specific (e.g., 'User can upload files up to 10MB')\n");

		const result = await this.promptList(
			"Enter functional requirements (one per line, empty line to finish)",
			"Example: The system must validate email addresses before creating accounts",
		);

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.functionalRequirements = result.items;
	}

	/**
	 * Ask for non-functional requirements
	 */
	private async askNonFunctionalRequirements(): Promise<void> {
		console.log(`\n[${this.step}] ${"─".repeat(40)}`);
		console.log("  NON-FUNCTIONAL REQUIREMENTS");
		console.log("─".repeat(40));
		console.log("\nHow should the feature behave?");
		console.log("(e.g., performance, security, usability)\n");

		const result = await this.promptList(
			"Enter non-functional requirements (one per line, empty line to finish)",
			"Example: The system must respond within 200ms for 95% of requests",
		);
		this.data.nonFunctionalRequirements = result.items;

		this.step++;
	}

	/**
	 * Ask for success criteria
	 */
	private async askSuccessCriteria(): Promise<void> {
		this.showStep("SUCCESS CRITERIA");
		console.log("\nHow will we know this feature is complete?\n");

		const result = await this.promptList(
			"Enter success criteria (one per line, empty line to finish)",
			"Example: All user acceptance tests pass",
		);

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.successCriteria = result.items;
	}

	/**
	 * Ask for exclusions
	 */
	private async askExclusions(): Promise<void> {
		this.showStep("EXCLUSIONS (OUT OF SCOPE)");
		console.log("\nWhat will NOT be included in this feature?");
		console.log("(This helps manage expectations)\n");

		const result = await this.promptList(
			"Enter exclusions (one per line, empty line to finish, optional)",
			"Example: Mobile app support (web only in this version)",
		);

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.exclude = result.items;
	}

	/**
	 * Ask for dependencies
	 */
	private async askDependencies(): Promise<void> {
		this.showStep("DEPENDENCIES");
		console.log("\nWhat does this feature depend on?");
		console.log("(Other features, APIs, services, etc.)\n");

		const result = await this.promptList(
			"Enter dependencies (one per line, empty line to finish, optional)",
			"Example: User authentication service must be available",
		);

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.dependencies = result.items;
	}

	/**
	 * Ask for risks and mitigations
	 */
	private async askRisks(): Promise<void> {
		this.showStep("RISKS & MITIGATIONS");
		console.log("\nWhat could go wrong and how will we address it?\n");

		const result = await this.promptList(
			"Enter risks and mitigations (one per line, empty line to finish, optional)",
			"Example: Third-party API might be unavailable - implement caching and retry logic",
		);

		// Check if user wants to quit
		if (result.quit) {
			this.quit();
		}

		this.data.riskMitigation = result.items;
	}

	/**
	 * Generate PRD content from session data
	 */
	static generatePRDContent(data: PRDSessionData): string {
		const lines: string[] = [];

		// Header
		lines.push(`# PRD: ${data.title}`);
		lines.push("");
		lines.push(`Created: ${new Date().toISOString()}`);
		lines.push(`Status: Draft`);
		lines.push("");

		// Overview
		lines.push("## 1. Overview");
		lines.push("");
		lines.push("### 1.1 Problem Statement");
		lines.push("");
		lines.push(data.problemStatement || "To be defined.");
		lines.push("");

		lines.push("### 1.2 Solution Overview");
		lines.push("");
		lines.push(data.overview || "To be defined.");
		lines.push("");

		lines.push("### 1.3 Target Audience");
		lines.push("");
		lines.push(data.targetAudience || "All users");
		lines.push("");

		// User Stories
		lines.push("## 2. User Stories");
		lines.push("");

		if (data.userStories && data.userStories.length > 0) {
			data.userStories.forEach((story, i) => {
				lines.push(`${i + 1}. ${story}`);
			});
		} else {
			lines.push("To be defined.");
		}

		lines.push("");

		// Functional Requirements
		lines.push("## 3. Functional Requirements");
		lines.push("");

		if (data.functionalRequirements && data.functionalRequirements.length > 0) {
			data.functionalRequirements.forEach((req, i) => {
				lines.push(`FR-${i + 1}: ${req}`);
			});
		} else {
			lines.push("To be defined.");
		}

		lines.push("");

		// Non-Functional Requirements
		lines.push("## 4. Non-Functional Requirements");
		lines.push("");

		if (
			data.nonFunctionalRequirements &&
			data.nonFunctionalRequirements.length > 0
		) {
			data.nonFunctionalRequirements.forEach((req, i) => {
				lines.push(`NFR-${i + 1}: ${req}`);
			});
		} else {
			lines.push("To be defined.");
		}

		lines.push("");

		// Success Criteria
		lines.push("## 5. Success Criteria");
		lines.push("");

		if (data.successCriteria && data.successCriteria.length > 0) {
			data.successCriteria.forEach((criteria, i) => {
				lines.push(`${i + 1}. ${criteria}`);
			});
		} else {
			lines.push("To be defined.");
		}

		lines.push("");

		// Exclusions
		if (data.exclude && data.exclude.length > 0) {
			lines.push("## 6. Out of Scope");
			lines.push("");
			data.exclude.forEach((exclusion, i) => {
				lines.push(`${i + 1}. ${exclusion}`);
			});
			lines.push("");
		}

		// Dependencies
		if (data.dependencies && data.dependencies.length > 0) {
			lines.push("## 7. Dependencies");
			lines.push("");
			data.dependencies.forEach((dep, i) => {
				lines.push(`${i + 1}. ${dep}`);
			});
			lines.push("");
		}

		// Risks
		if (data.riskMitigation && data.riskMitigation.length > 0) {
			lines.push("## 8. Risks & Mitigations");
			lines.push("");
			data.riskMitigation.forEach((risk, i) => {
				lines.push(`${i + 1}. ${risk}`);
			});
			lines.push("");
		}

		return lines.join("\n");
	}
}
