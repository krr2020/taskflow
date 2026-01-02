# Final Taskflow UI Plan

## 1. Architecture & Port Strategy
*   **Port Selection**: We will use a default starting port of **4500** (away from standard 3000/8000 dev ports) and increment if occupied (4501, 4502...).
*   **Multi-Project**: Each project runs its own instance. A global registry (`~/.taskflow/registry.json`) allows the UI to switch between active projects.

## 2. Robust Process Management
To prevent duplicate servers and zombie processes:
*   **PID Lock**: We will store server state in `.taskflow/ui.json` containing `{ "pid": 12345, "port": 4500, "startTime": ... }`.
*   **Start Logic**:
    1.  Check for `.taskflow/ui.json`.
    2.  If exists:
        *   Check if process with `pid` is actually running.
        *   **If Running**: Output "Server already running at http://localhost:4500" and exit. (Prevents duplicates).
        *   **If Dead**: Clean up the stale lock file and start a new server.
*   **Stop Logic**:
    *   `taskflow ui stop`: Reads `.taskflow/ui.json`, kills the process by PID, and removes the file.
    *   **Graceful Shutdown**: Handle `SIGINT`/`SIGTERM` to clean up the lock file.

## 3. Package Structure
*   `packages/ui`: Frontend (Vite/React).
*   `packages/core`: Backend (Hono) + Process Manager.

## 4. Implementation Steps
1.  **Scaffold `packages/ui`**: Setup React project.
2.  **Implement Process Manager**:
    *   Create `UiManager` class in `core`.
    *   Implement `start()`, `stop()`, `status()`, `checkPid()`.
    *   Implement Port Finder (start at 4500).
3.  **Implement Server**:
    *   Serve static files.
    *   API for Project Data.
4.  **CLI Integration**:
    *   `taskflow ui`: Foreground (safe default).
    *   `taskflow ui start`: Background/Daemon.
    *   `taskflow ui stop`: Stop.

## 5. Confirmation
This plan addresses:
*   **Ports**: Uses 4500+ to avoid conflicts.
*   **Duplicates**: Strict PID checking prevents multiple instances for the same project.
*   **Multi-Project**: Dynamic ports + Registry.
*   **Pollution**: No UI files in user dir.

Ready to proceed?
