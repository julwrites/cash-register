#!/usr/bin/env python3
"""
SessionStart Hook for Continuous Claude.
Injects context about active tasks and recent history.
"""
import sys
import os
import json
import glob
import subprocess

# Add scripts dir to path to reuse tasks logic if needed
# But for a hook, it's safer to subprocess to ensure isolation
REPO_ROOT = os.getcwd() # Hook runs from repo root usually
TASKS_SCRIPT = os.path.join(REPO_ROOT, "scripts", "tasks.py")
LEDGER_DIR = os.path.join(REPO_ROOT, "thoughts", "ledgers")
HANDOFF_DIR = os.path.join(REPO_ROOT, "thoughts", "shared", "handoffs")

def get_latest_file(directory, pattern="*"):
    files = glob.glob(os.path.join(directory, pattern))
    if not files:
        return None
    return max(files, key=os.path.getctime)

def get_active_tasks():
    try:
        # Run scripts/tasks.py context --format json
        result = subprocess.run(
            [sys.executable, TASKS_SCRIPT, "context", "--format", "json"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            tasks = json.loads(result.stdout)
            return tasks
        return []
    except Exception as e:
        return []

def main():
    # Read input from stdin (standard hook protocol)
    try:
        input_data = json.load(sys.stdin)
    except:
        input_data = {}

    context_lines = []

    # 1. Active Tasks
    active_tasks = get_active_tasks()
    if active_tasks:
        context_lines.append("## Active Context (from tasks)")
        for task in active_tasks:
            context_lines.append(f"- **{task['id']}**: {task['title']} ({task['status']})")
    else:
        context_lines.append("## Context Warning")
        context_lines.append("No active tasks found. Please use the `task_manager` tool (or `scripts/tasks.py`) to pick a task.")

    # 2. Latest Ledger
    latest_ledger = get_latest_file(LEDGER_DIR, "*.md")
    if latest_ledger:
        context_lines.append(f"\n## Latest Ledger ({os.path.basename(latest_ledger)})")
        try:
            with open(latest_ledger, "r") as f:
                # Read first 50 lines to avoid overwhelming context
                head = [next(f) for _ in range(50)]
                context_lines.append("".join(head))
        except StopIteration:
            pass

    # 3. Latest Handoff
    latest_handoff = get_latest_file(HANDOFF_DIR, "*.md")
    if latest_handoff:
        context_lines.append(f"\n## Latest Handoff ({os.path.basename(latest_handoff)})")
        try:
            with open(latest_handoff, "r") as f:
                head = [next(f) for _ in range(50)]
                context_lines.append("".join(head))
        except StopIteration:
            pass

    output = {
        "continue": True,
        "hookSpecificOutput": {
            "additionalContext": "\n".join(context_lines)
        }
    }

    print(json.dumps(output))

if __name__ == "__main__":
    main()
