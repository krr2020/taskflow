I have incorporated your request to automatically manage `.gitignore` into the plan.

### 1. Smart Git Ignore (`taskflow init`)
When you run `taskflow init`, I will automatically ensure your repo stays clean:
*   **Check**: I'll look for an existing `.gitignore` in your project root.
*   **Update**: I will append the following lines if they are missing:
    ```
    # TaskFlow
    .taskflow/backups
    .taskflow/logs
    .taskflow/sessions
    ```
*   **Create**: If no `.gitignore` exists, I will create one with these entries.

### 2. Interactive Review & Configurable Safety
(As previously planned)
*   **Interactive Diff**: The agent will show you a colored `git diff` of proposed changes and ask for confirmation (`[y]es`, `[n]o`, `[a]ll`, `[s]top`) before writing files.
*   **Configuration**:
    *   `agentMode.interactive`: `boolean` (Default: `true`).
    *   `agentMode.backup`: `boolean` (Default: `true`).

### Implementation Steps
1.  **Update Config Schema (`types.ts`)**: Add `interactive` and `backup` options.
2.  **Update Init Command (`init.ts`)**: Implement the `.gitignore` update logic.
3.  **Update Agent Runner (`runner.ts`)**: Implement the "Diff & Prompt" loop for interactive reviews.
4.  **Update Tools (`tools.ts`)**: Make backups conditional based on config.

This ensures a clean repository and a safe, controllable agent workflow.
