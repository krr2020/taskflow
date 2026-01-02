# Custom LLM Agent Mode

## Overview

TaskFlow is designed to orchestrate AI-driven workflows. Currently, it supports:
1.  **Guidance Mode**: Generates instructions for the user (default).
2.  **MCP Mode**: External agents (like Claude Desktop) drive TaskFlow via Model Context Protocol.

This document outlines the **Agent Mode**, which allows custom LLMs (e.g., local Ollama models, private endpoints) to *autonomously execute* tasks by creating files, running commands, and managing git state directly through TaskFlow.

## Architecture: TaskFlow as a Tool-Use Runtime

In Agent Mode, `taskflow` acts as the runtime environment for the LLM. Instead of just printing text, the LLM outputs "Tool Calls" which `taskflow` intercepts and executes.

### 1. Tool Protocol

To support a wide range of models (including those that don't support native OpenAI function calling), we define a text-based protocol using XML tags or structured JSON blocks.

**Supported Tools:**
- `read_file`: Read file content.
- `write_file`: Create or overwrite a file.
- `replace_string`: specific string replacement (safer than full overwrite).
- `run_command`: Execute a shell command.
- `list_files`: List directory contents.

**Example LLM Output (XML Format):**
```xml
I will create the authentication service now.

<write_file path="src/auth.ts">
export function login(user: string) {
  // ...
}
</write_file>

<run_command>
npm test src/auth.ts
</run_command>
```

### 2. The Agent Loop (`taskflow do`)

When agent mode is enabled, running `taskflow do` automatically activates the autonomous loop.

**Workflow:**
1.  **Context Assembly**: `taskflow` gathers current task context (files, status, errors).
2.  **System Prompt Injection**: `taskflow` injects a system prompt defining the available tools and the output format (XML).
3.  **LLM Generation**: The prompt is sent to the configured provider (Ollama, OpenAI, etc.).
4.  **Parsing**: `taskflow` parses the response.
    - If text only: Print to user.
    - If tool calls found:
        - **Validation**: Check permissions (e.g., is the file inside the project?).
        - **Execution**: Run the tool.
        - **Feedback**: Append tool output (stdout/stderr) to the conversation history.
5.  **Iteration**: The loop continues until the LLM signals completion or a limit is reached.
6.  **Persistence**: Session state is saved to `.taskflow/sessions/` allowing you to stop and resume at any time.

### 3. Configuration

Users configure their custom model in `taskflow.config.json`. To enable agent mode:

```json
{
  "ai": {
    "enabled": true,
    "provider": "ollama",
    "model": "llama3",
    "agentMode": {
      "enabled": true,
      "provider": "ollama", // Optional: use different provider for agent
      "model": "llama3",    // Optional: use different model for agent
      "format": "xml", 
      "maxSteps": 20,
      "allowedTools": ["read_file", "write_file", "run_command"]
    }
  }
}
```

## Safety & Recovery

TaskFlow implements several layers of safety for autonomous agents:

1.  **Sandbox**: Agents can only read/write files within the project root.
2.  **Automatic Backups**: Before any `write_file` operation, the original file is backed up to `.taskflow/backups/<timestamp>/`.
3.  **Atomic Writes**: Files are written to a temporary location first, then renamed, preventing corruption from partial writes.
4.  **Session Resume**: If the process crashes or is stopped, running `taskflow do` again resumes the session with full context.

## Use Cases

- **Local Development**: Use `llama3` via Ollama to implement simple features without sending code to the cloud.
- **CI/CD**: Run `taskflow do` in a pipeline to automatically fix lint errors.
- **Private Codebases**: Use self-hosted models for complete data sovereignty.

## Comparison with MCP

| Feature | MCP Server | Agent Mode |
| :--- | :--- | :--- |
| **Driver** | External Client (Claude Desktop, IDE) | TaskFlow Internal Loop |
| **LLM** | Client's LLM | Configured Project LLM |
| **Control** | Interactive | Autonomous / CLI |
| **Best For** | Pair Programming, Exploration | Batch Tasks, CI/CD, Local Models |

This design empowers users to build their own "AI Employees" using whatever model backend they prefer.
