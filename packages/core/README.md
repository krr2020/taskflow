# @krr2020/taskflow

Core task management framework for AI-assisted development workflows. This package provides the foundational commands, state management, and configuration handling used by the Taskflow MCP Server and CLI.

## 📋 Package Information

- **Version:** 0.1.0-beta.5
- **Status:** Beta
- **Package Name:** @krr2020/taskflow
- **Exports:**
  - Main: `import {} from '@krr2020/taskflow'`
  - Config: `import {} from '@krr2020/taskflow/config'`

## 📦 Installation

```bash
npm install @krr2020/taskflow
```

## 🏗️ Architecture

The core package provides a complete task management system with:

### AI Integration

TaskFlow features built-in AI capabilities to automate documentation, planning, and execution.

#### Configuration

Configure your preferred LLM provider:

```bash
taskflow configure ai --provider anthropic --apiKey sk-ant-... --model claude-sonnet-4
```

**Supported providers:**
- `anthropic`: Anthropic Claude models
- `openai-compatible`: OpenAI-compatible APIs
- `ollama`: Local Ollama models
- `mock`: Mock provider for testing

#### Multi-Phase AI Configuration

Configure different models for planning, execution, and analysis phases:

```bash
taskflow configure ai \
  --planningProvider anthropic --planningApiKey sk-ant-... --planning claude-sonnet-4 \
  --executionProvider anthropic --executionApiKey sk-ant-... --execution claude-opus-4 \
  --analysisProvider anthropic --analysisApiKey sk-ant-... --analysis claude-sonnet-4
```

Or configure via `taskflow.config.json`:

```json
{
  "ai": {
    "planning": {
      "provider": "anthropic",
      "apiKey": "sk-ant-...",
      "model": "claude-sonnet-4"
    },
    "execution": {
      "provider": "anthropic",
      "apiKey": "sk-ant-...",
      "model": "claude-opus-4"
    },
    "analysis": {
      "provider": "anthropic",
      "apiKey": "sk-ant-...",
      "model": "claude-sonnet-4"
    }
  }
}
```

#### AI-Powered Features

- **PRD Generation**: `taskflow prd create` can generate complete requirements from a description.
- **Task Breakdown**: `taskflow tasks generate` analyzes your PRD and creates atomic, testable tasks.
- **Context Analysis**: `taskflow start` analyzes the task and codebase to provide implementation guidance.
- **Smart Execution**: `taskflow do` suggests the next step based on your current progress.

### Commands Layer
22 command classes that handle all workflow operations:

**Initialization & Setup**
- `InitCommand` - Initialize Taskflow in a project

**Status & Navigation**
- `StatusCommand` - View project, feature, or story status
- `NextCommand` - Find next available task

**PRD & Task Generation**
- `PrdCreateCommand` - Create PRD template
- `PrdGenerateArchCommand` - Generate coding standards and architecture rules from PRD
- `TasksGenerateCommand` - Generate task breakdown from PRD

**Task Workflow**
- `StartCommand` - Start a task (SETUP phase)
- `CheckCommand` - Validate and advance task status
- `CommitCommand` - Commit changes and complete task
- `ResumeCommand` - Resume blocked/on-hold tasks
- `SkipCommand` - Mark task as blocked

**Retrospective System**
- `RetroAddCommand` - Add error pattern to retrospective
- `RetroListCommand` - List retrospective entries

### Library Modules

**Core Types & Validation**
- `types.ts` - TypeScript types and Zod schemas for all data structures
- `errors.ts` - Custom error classes (FileNotFoundError, InvalidFileFormatError, etc.)
- `constants.ts` - System constants and configuration

**Data & Configuration**
- `config-loader.ts` - Load and validate taskflow.config.json
- `config-paths.ts` - Path helpers and configuration constants
- `data-access.ts` - JSON file operations for tasks, features, and project index

**File & Path Utilities**
- `file-utils.ts` - File operations (exists, readJson, writeJson, copyFile)
- `path-utils.ts` - Path utilities for project structure
- `template-utils.ts` - Template directory management

**Workflow Support**
- `git.ts` - Git operations (branch switching, commit, push)
- `validation.ts` - Run configured validation commands
- `retrospective.ts` - Error pattern tracking and matching
- `output.ts` - Terminal output formatting utilities
- `log-parser.ts` - Log parsing utilities

**AI Infrastructure (`llm/`)**
- `base.ts` - Base LLM provider interface
- `cache.ts` - Response caching
- `checkpoint-manager.ts` - Conversation checkpointing
- `context-manager.ts` - Context window management
- `context-priorities.ts` - Context prioritization
- `cost-tracker.ts` - API cost tracking
- `factory.ts` - Provider factory
- `model-selector.ts` - Model selection logic
- `rate-limiter.ts` - Rate limiting
- `validators.ts` - Response validation
- `providers/` - Provider implementations (Anthropic, OpenAI, Ollama, Mock)

## 📦 Template Structure

Taskflow includes reference templates copied to `.taskflow/ref/` during initialization:

**Protocol Templates**
- `ai-protocol.md` - AI interaction guidelines
- `task-generator.md` - Task breakdown instructions
- `task-executor.md` - Task execution guidance
- `debug-validator.md` - Debugging and validation protocols

**PRD Templates**
- `prd-generator.md` - PRD generation guidelines

**Project Templates**
- `coding-standards.md` - Project coding standards
- `architecture-rules.md` - Architectural guidelines

**Skill Templates**
- `backend.md` - Backend development guidelines
- `frontend.md` - Frontend development guidelines
- `fullstack.md` - Full-stack development guidelines
- `devops.md` - DevOps guidelines
- `docs.md` - Documentation guidelines
- `mobile.md` - Mobile development guidelines

These templates guide AI assistants and are customizable per project.

### CLI Interface

The package includes a CLI via `bin/taskflow.js` using Commander.js:

```bash
# Initialize project
taskflow init [project-name]
taskflow upgrade [--skip-prompt]

# Configure AI
taskflow configure ai --provider <provider> --apiKey <key>

# Status and navigation
taskflow status [id]
taskflow next

# PRD workflow
taskflow prd create <feature-name>
taskflow prd generate-arch <prd-file>
taskflow prd update-standards <rule>
taskflow prd update-arch <rule>
taskflow tasks generate <prd-file>
taskflow tasks add --feature <id> --story <id> --title <title>
taskflow tasks refine <instructions>
taskflow task create --title <title> [--intermittent]

# Task workflow
taskflow start <task-id>
taskflow do
taskflow check
taskflow commit <message>
taskflow resume [status]
taskflow skip <reason>

# Retrospective
taskflow retro add
taskflow retro list [category]
```

## 📊 Task Status Flow

Tasks progress through a state machine:

```
not-started → setup → planning → implementing → verifying → validating → committing → completed
```

Other states: `blocked`, `on-hold`

## 🔧 Intermittent Tasks (F0)

Create standalone tasks for quick fixes and infrastructure work without requiring a full PRD or story structure:

```bash
taskflow task create --title "Fix typo in README" --intermittent
```

Intermittent tasks are organized under **Feature 0** ("Infrastructure & Quick Fixes"), making them ideal for:
- Bug fixes
- Documentation updates
- Code cleanup
- Dependency updates
- Configuration changes

These tasks bypass the PRD workflow and are created directly in the task hierarchy.

## 🔧 Programmatic Usage

```typescript
import {
  StartCommand,
  CheckCommand,
  CommitCommand,
  type CommandContext
} from '@krr2020/taskflow';

const context: CommandContext = {
  projectRoot: process.cwd()
};

// Start a task
const startCmd = new StartCommand(context);
const result = await startCmd.execute('1.1.0');

console.log(result.output);     // Human-readable output
console.log(result.nextSteps);  // Next action guidance
console.log(result.aiGuidance); // AI-specific instructions
```

## 📁 Data Structure

### Project Hierarchy
```
tasks/
├── project-index.json                           # Top-level project index
└── F[N]-[feature-name]/                         # Feature directory
    ├── F[N]-[feature-name].json                 # Feature file with stories
    └── S[N].[M]-[story-name]/                   # Story directory
        └── T[N].[M].[K]-[task-title].json       # Individual task files

Example: F1-user-auth/F1-user-auth.json, S1.1-login-flow/T1.1.0-setup-database.json
```

> See [task-generation.md](../mcp-server/resources/task-generation.md) for complete format specification

### Configuration

`taskflow.config.json`:
```json
{
  "project": {
    "name": "my-project",
    "root": "."
  },
  "branching": {
    "strategy": "per-story",
    "base": "main",
    "prefix": "story/"
  },
  "validation": {
    "commands": {
      "format": "echo 'running format'",
      "test": "echo 'running tests'",
      "build": "echo 'building project'"
    }
  }
}
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

## 📚 Integration

Most users should use this package via:
- **[@krr2020/taskflow-mcp](https://www.npmjs.com/package/@krr2020/taskflow-mcp)** - MCP Server for Claude Desktop
- **CLI** - Direct command-line usage via `npx @krr2020/taskflow`

See the main [Taskflow documentation](../README.md) for complete usage examples.

## 📄 License

MIT
