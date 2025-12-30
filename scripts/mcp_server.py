#!/usr/bin/env python3
"""
MCP Server Adapter for Agent Harness.
Wraps existing scripts/tasks.py and other utilities into an MCP-compliant server.
"""
import sys
import os
import json
import asyncio
import subprocess

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import local modules if needed, though we will primarily subprocess to existing CLI tools
# to ensure consistent behavior with the existing environment.
TASKS_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tasks.py")
MEMORY_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "memory.py")

async def run_script(script_path, args, input_data=None):
    """Runs a python script and returns stdout."""
    cmd = [sys.executable, script_path] + args + ["--format", "json"]

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        error_msg = stderr.decode() if stderr else "Unknown error"
        try:
             # Try to parse stdout for JSON error even if return code is non-zero
             out_json = json.loads(stdout.decode())
             if "error" in out_json:
                 return out_json
        except:
            pass
        raise RuntimeError(f"Command failed: {error_msg}")

    output = stdout.decode().strip()
    try:
        if not output:
            return {"success": True}
        return json.loads(output)
    except json.JSONDecodeError:
        return {"raw_output": output}

async def handle_tool_call(name, arguments):
    """Dispatches tool calls to appropriate scripts."""

    # --- TASKS ---
    if name == "task_create":
        args = ["create", arguments["category"], arguments["title"]]
        if "description" in arguments:
            args.extend(["--desc", arguments["description"]])
        if "priority" in arguments:
            args.extend(["--priority", arguments["priority"]])
        if "dependencies" in arguments:
            args.extend(["--dependencies", arguments["dependencies"]])
        return await run_script(TASKS_SCRIPT, args)

    elif name == "task_list":
        args = ["list"]
        if "status" in arguments:
            args.extend(["--status", arguments["status"]])
        if "category" in arguments:
            args.extend(["--category", arguments["category"]])
        return await run_script(TASKS_SCRIPT, args)

    elif name == "task_update":
        return await run_script(TASKS_SCRIPT, ["update", arguments["task_id"], arguments["status"]])

    elif name == "task_show":
        return await run_script(TASKS_SCRIPT, ["show", arguments["task_id"]])

    elif name == "task_context":
        return await run_script(TASKS_SCRIPT, ["context"])

    elif name == "task_next":
        return await run_script(TASKS_SCRIPT, ["next"])

    elif name == "task_archive":
        return await run_script(TASKS_SCRIPT, ["archive", arguments["task_id"]])

    # --- MEMORY ---
    elif name == "memory_create":
        args = ["create", arguments["title"], arguments["content"]]
        if "tags" in arguments:
            args.extend(["--tags", arguments["tags"]])
        return await run_script(MEMORY_SCRIPT, args)

    elif name == "memory_list":
        args = ["list"]
        if "tag" in arguments:
            args.extend(["--tag", arguments["tag"]])
        return await run_script(MEMORY_SCRIPT, args)

    elif name == "memory_read":
        return await run_script(MEMORY_SCRIPT, ["read", arguments["filename"]])

    else:
        raise ValueError(f"Unknown tool: {name}")

# --- MCP Protocol Handling ---

async def main():
    # Basic JSON-RPC loop over stdin/stdout
    while True:
        try:
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break

            request = json.loads(line)

            # JSON-RPC 2.0 Validation
            if request.get("jsonrpc") != "2.0":
                continue

            msg_id = request.get("id")
            method = request.get("method")
            params = request.get("params", {})

            response = {
                "jsonrpc": "2.0",
                "id": msg_id
            }

            try:
                if method == "initialize":
                    response["result"] = {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "agent-harness-tools",
                            "version": "1.0.0"
                        }
                    }

                elif method == "notifications/initialized":
                    # No response needed for notifications
                    continue

                elif method == "tools/list":
                    response["result"] = {
                        "tools": [
                            {
                                "name": "task_create",
                                "description": "Create a new development task.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "category": {"type": "string", "enum": ["foundation", "infrastructure", "domain", "presentation", "migration", "features", "testing", "review", "security", "research"]},
                                        "title": {"type": "string"},
                                        "description": {"type": "string"},
                                        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                                        "dependencies": {"type": "string"}
                                    },
                                    "required": ["category", "title"]
                                }
                            },
                            {
                                "name": "task_list",
                                "description": "List existing tasks.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {"type": "string"},
                                        "category": {"type": "string"}
                                    }
                                }
                            },
                            {
                                "name": "task_update",
                                "description": "Update task status.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "task_id": {"type": "string"},
                                        "status": {"type": "string"}
                                    },
                                    "required": ["task_id", "status"]
                                }
                            },
                            {
                                "name": "task_show",
                                "description": "Show task details.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "task_id": {"type": "string"}
                                    },
                                    "required": ["task_id"]
                                }
                            },
                            {
                                "name": "task_context",
                                "description": "Show currently active tasks (in_progress).",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {}
                                }
                            },
                            {
                                "name": "task_next",
                                "description": "Suggest next task to work on.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {}
                                }
                            },
                            {
                                "name": "task_archive",
                                "description": "Archive a task.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "task_id": {"type": "string"}
                                    },
                                    "required": ["task_id"]
                                }
                            },
                            {
                                "name": "memory_create",
                                "description": "Create a long-term memory.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "content": {"type": "string"},
                                        "tags": {"type": "string"}
                                    },
                                    "required": ["title", "content"]
                                }
                            },
                            {
                                "name": "memory_list",
                                "description": "List memories.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "tag": {"type": "string"}
                                    }
                                }
                            },
                             {
                                "name": "memory_read",
                                "description": "Read a memory.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "filename": {"type": "string"}
                                    },
                                    "required": ["filename"]
                                }
                            }
                        ]
                    }

                elif method == "tools/call":
                    name = params.get("name")
                    args = params.get("arguments", {})
                    result = await handle_tool_call(name, args)
                    response["result"] = {
                        "content": [
                            {
                                "type": "text",
                                "text": json.dumps(result, indent=2)
                            }
                        ]
                    }

                else:
                    # Ignore other methods or return error
                    continue # or method not found

            except Exception as e:
                response["error"] = {
                    "code": -32000,
                    "message": str(e)
                }

            # Send response
            print(json.dumps(response), flush=True)

        except Exception as e:
            # Fatal error in loop
            print(json.dumps({"jsonrpc": "2.0", "error": {"code": -32700, "message": str(e)}, "id": None}), flush=True)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
