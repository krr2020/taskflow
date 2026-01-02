You are absolutely right. Adding an `--agent` flag creates unnecessary friction. If you have configured an Agent, `taskflow do` should naturally default to using it.

### Refined "Implicit Agent" Design

The behavior of `taskflow do` will now be determined by your configuration in `taskflow.config.json`:

1.  **Agent Mode (Default if configured):**
    -   If `ai.agentMode.enabled` is `true`, running `taskflow do` **automatically launches the Agent Runner**.
    -   The agent takes over execution, validation, or planning based on the current status.
    -   *User Experience:* You just type `taskflow do`, and the AI starts working.

2.  **Guidance Mode (Fallback):**
    -   If `ai.agentMode.enabled` is `false` (or not configured), `taskflow do` behaves as it does today: providing text guidance and checklists for *you* to follow.
    -   *Override:* If you have the agent enabled but just want to check instructions, you can run `taskflow do --guide`.

### Updated Implementation Plan

1.  **Config Schema (`types.ts`)**:
    -   Add `agentMode` section to `TaskflowConfig`.
    -   Key field: `enabled: boolean` (default `false` to preserve backward compatibility, but easy to switch on).

2.  **Logic Update (`do.ts`)**:
    -   Remove the dependency on a CLI flag.
    -   Read config at runtime.
    -   **IF** `agentMode.enabled` **THEN** Run `AgentRunner`.
    -   **ELSE** Run standard `getGuidance`.

3.  **Agent Components (`src/agent/`)**:
    -   Implement `tools.ts` (Safe I/O).
    -   Implement `runner.ts` (The Loop with Session Persistence).
    -   Implement `safety.ts` (Backups & Atomic Writes).

This approach makes TaskFlow "smart by default" for your workflow—you set it up once, and it just works.
