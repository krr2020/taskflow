export interface ToolCall {
	tool: string;
	args: Record<string, string>;
}

export const ToolParser = {
	/**
	 * Parse XML-style tool calls from LLM output
	 * Example:
	 * <write_file path="src/index.ts">
	 * content here
	 * </write_file>
	 */
	parse(text: string): ToolCall[] {
		const calls: ToolCall[] = [];
		// Match <tool_name arg1="val1">content</tool_name>
		// or self-closing <tool_name arg1="val1" />
		const tagRegex = /<([a-z_]+)([^>]*)(?:>(.*?)<\/\1>|\s*\/>)/gis;

		let match: RegExpExecArray | null;
		// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
		while ((match = tagRegex.exec(text)) !== null) {
			const toolName = match[1];
			const attributesString = match[2] || "";
			const content = match[3] || ""; // Inner content (e.g. file body)

			if (!toolName) continue;

			const args: Record<string, string> = {};

			// Parse attributes: key="value"
			const attrRegex = /([a-z_]+)="([^"]*)"/gi;
			let attrMatch: RegExpExecArray | null;
			// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
			while ((attrMatch = attrRegex.exec(attributesString)) !== null) {
				if (attrMatch[1] && attrMatch[2]) {
					args[attrMatch[1]] = attrMatch[2];
				}
			}

			// If the tool is write_file, the inner content is usually the file content
			// But sometimes the user might put content="value" in attributes.
			// Convention: if 'content' attribute is missing and inner text exists, use inner text.
			if (
				toolName === "write_file" &&
				!args.content &&
				content.trim().length > 0
			) {
				args.content = content.trim();
			}

			calls.push({ tool: toolName, args });
		}

		return calls;
	},
};
