#!/usr/bin/env python3
"""
Common MCP stdio protocol implementation for Adobe bridge servers.
Provides base classes for InDesign and Illustrator MCP adapters.
"""

import sys
import json
import requests
from typing import Dict, List, Any, Optional
from abc import ABC, abstractmethod


class AdobeSocketClient:
    """Wraps HTTP calls to the Adobe proxy server on localhost:8013"""

    def __init__(self, app: str, proxy_url: str = "http://localhost:8013"):
        """
        Initialize Adobe socket client.

        Args:
            app: Application name ("indesign" or "illustrator")
            proxy_url: URL of the proxy server (default: http://localhost:8013)
        """
        self.app = app
        self.proxy_url = proxy_url
        self.timeout = 20  # 20 second timeout per spec

    def _make_request(self, action: str, params: Dict[str, Any], retry_once: bool = False) -> Dict[str, Any]:
        """
        Make HTTP request to proxy with timeout and retry logic.

        Args:
            action: Action name to execute
            params: Parameters for the action
            retry_once: Whether to retry once on failure (for idempotent reads)

        Returns:
            Response dictionary from proxy

        Raises:
            Exception: On request failure after retries
        """
        payload = {
            "app": self.app,
            "action": action,
            "params": params
        }

        try:
            response = requests.post(
                f"{self.proxy_url}/execute",
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout as e:
            if retry_once and action in ["get_document_info", "list_frames"]:
                # Retry once for idempotent reads
                try:
                    response = requests.post(
                        f"{self.proxy_url}/execute",
                        json=payload,
                        timeout=self.timeout
                    )
                    response.raise_for_status()
                    return response.json()
                except Exception as retry_error:
                    raise Exception(f"Timeout after retry for {action}: {retry_error}")
            raise Exception(f"Timeout calling {action}: {e}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed for {action}: {e}")

    def create_new_document(self, width: float, height: float, units: str = "mm") -> Dict[str, Any]:
        """Create new document with specified dimensions."""
        return self._make_request("create_new_document", {
            "width": width,
            "height": height,
            "units": units
        })

    def open_template(self, path: str) -> Dict[str, Any]:
        """Open template document from path."""
        return self._make_request("open_template", {"path": path})

    def place_text_in_frame(self, frame_name: str, text: str) -> Dict[str, Any]:
        """Place text in specified frame."""
        return self._make_request("place_text_in_frame", {
            "frame_name": frame_name,
            "text": text
        })

    def place_image_in_frame(self, frame_name: str, url: str) -> Dict[str, Any]:
        """Place image in specified frame."""
        return self._make_request("place_image_in_frame", {
            "frame_name": frame_name,
            "url": url
        })

    def export_pdf(self, preset: str, output_path: str) -> Dict[str, Any]:
        """Export document as PDF."""
        return self._make_request("export_pdf", {
            "preset": preset,
            "output_path": output_path
        })


class MCPStdioServer(ABC):
    """Base class for MCP stdio protocol servers."""

    def __init__(self, server_name: str, version: str, app: str):
        """
        Initialize MCP stdio server.

        Args:
            server_name: Name of the MCP server (e.g., "adobe-indesign")
            version: Server version (e.g., "1.0.0")
            app: Adobe app name ("indesign" or "illustrator")
        """
        self.server_name = server_name
        self.version = version
        self.app = app
        self.client = AdobeSocketClient(app)

    @abstractmethod
    def get_tools(self) -> List[Dict[str, Any]]:
        """Return list of tools this server provides."""
        pass

    def validate_path(self, path: str) -> bool:
        """
        Security: Validate that path is within allowed directory.

        Args:
            path: File path to validate

        Returns:
            True if path is allowed, False otherwise
        """
        import os
        allowed_base = os.path.abspath("T:\\Projects\\pdf-orchestrator\\")
        abs_path = os.path.abspath(path)
        return abs_path.startswith(allowed_base)

    def emit_server_info(self):
        """Emit server_info message on startup."""
        info = {
            "type": "server_info",
            "name": self.server_name,
            "version": self.version
        }
        self._write_message(info)

    def emit_tools(self):
        """Emit tools list message."""
        tools_msg = {
            "type": "tools",
            "tools": self.get_tools()
        }
        self._write_message(tools_msg)

    def _write_message(self, msg: Dict[str, Any]):
        """Write JSON message to stdout."""
        sys.stdout.write(json.dumps(msg) + "\n")
        sys.stdout.flush()

    def handle_tool_call(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route tool call to appropriate handler.

        Args:
            tool_name: Name of tool to call
            params: Parameters for the tool

        Returns:
            Result dictionary
        """
        # Validate paths if present
        if "path" in params and not self.validate_path(params["path"]):
            raise ValueError(f"Path not allowed: {params['path']}. Only T:\\Projects\\pdf-orchestrator\\ allowed.")
        if "output_path" in params and not self.validate_path(params["output_path"]):
            raise ValueError(f"Output path not allowed: {params['output_path']}. Only T:\\Projects\\pdf-orchestrator\\ allowed.")

        # Route to client method
        if tool_name == "create_new_document":
            return self.client.create_new_document(
                params["width"],
                params["height"],
                params.get("units", "mm")
            )
        elif tool_name == "open_template":
            return self.client.open_template(params["path"])
        elif tool_name == "place_text_in_frame":
            return self.client.place_text_in_frame(
                params["frame_name"],
                params["text"]
            )
        elif tool_name == "place_image_in_frame":
            return self.client.place_image_in_frame(
                params["frame_name"],
                params["url"]
            )
        elif tool_name == "export_pdf":
            return self.client.export_pdf(
                params["preset"],
                params["output_path"]
            )
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def run(self):
        """Main event loop: emit handshake, then read stdin for tool calls."""
        # Emit handshake
        self.emit_server_info()
        self.emit_tools()

        # Read stdin line by line
        for line in sys.stdin:
            try:
                msg = json.loads(line.strip())

                if msg.get("type") == "tool_call":
                    tool_name = msg.get("name")
                    params = msg.get("params", {})

                    try:
                        result = self.handle_tool_call(tool_name, params)
                        response = {
                            "type": "tool_result",
                            "name": tool_name,
                            "result": result
                        }
                        self._write_message(response)
                    except Exception as e:
                        error_response = {
                            "type": "tool_error",
                            "name": tool_name,
                            "error": str(e)
                        }
                        self._write_message(error_response)

            except json.JSONDecodeError as e:
                error_msg = {
                    "type": "error",
                    "message": f"Invalid JSON: {e}"
                }
                self._write_message(error_msg)
            except Exception as e:
                error_msg = {
                    "type": "error",
                    "message": f"Unexpected error: {e}"
                }
                self._write_message(error_msg)
