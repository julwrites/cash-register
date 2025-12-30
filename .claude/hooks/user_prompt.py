#!/usr/bin/env python3
"""
UserPromptSubmit Hook.
Reminds the user/agent to have an active task.
"""
import sys
import os
import json
import subprocess

REPO_ROOT = os.getcwd()
TASKS_SCRIPT = os.path.join(REPO_ROOT, "scripts", "tasks.py")

def get_active_tasks():
    try:
        result = subprocess.run(
            [sys.executable, TASKS_SCRIPT, "context", "--format", "json"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            tasks = json.loads(result.stdout)
            return tasks
        return []
    except Exception:
        return []

def main():
    try:
        input_data = json.load(sys.stdin)
    except:
        input_data = {}

    active_tasks = get_active_tasks()

    # If no active tasks, inject a warning
    if not active_tasks:
        print(json.dumps({
            "continue": True,
            "hookSpecificOutput": {
                "additionalContext": "\n\n⚠️  **CONTINUITY CHECK**: No active task found. Please select a task using `task_next` or `task_create` before proceeding."
            }
        }))
    else:
        # Pass silently
        print(json.dumps({
            "continue": True
        }))

if __name__ == "__main__":
    main()
