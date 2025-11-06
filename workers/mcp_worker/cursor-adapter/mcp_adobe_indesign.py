#!/usr/bin/env python3
"""
MCP stdio adapter for Adobe InDesign.
Speaks MCP protocol over stdin/stdout and forwards to proxy at localhost:8013.
"""

import sys
from mcp_adobe_common import MCPStdioServer
from typing import Dict, List, Any


class AdobeInDesignMCPServer(MCPStdioServer):
    """MCP server for Adobe InDesign automation."""

    def __init__(self):
        super().__init__(
            server_name="adobe-indesign",
            version="1.0.0",
            app="indesign"
        )

    def get_tools(self) -> List[Dict[str, Any]]:
        """Return list of tools provided by InDesign adapter."""
        return [
            {
                "name": "create_new_document",
                "description": "Create a new InDesign document with specified dimensions",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "width": {
                            "type": "number",
                            "description": "Document width (in specified units)"
                        },
                        "height": {
                            "type": "number",
                            "description": "Document height (in specified units)"
                        },
                        "units": {
                            "type": "string",
                            "enum": ["mm", "cm", "in", "pt"],
                            "default": "mm",
                            "description": "Unit of measurement (mm, cm, in, pt)"
                        }
                    },
                    "required": ["width", "height"]
                }
            },
            {
                "name": "open_template",
                "description": "Open an InDesign template document from disk",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Absolute path to .indd or .idml template file (must be in T:\\Projects\\pdf-orchestrator\\)"
                        }
                    },
                    "required": ["path"]
                }
            },
            {
                "name": "place_text_in_frame",
                "description": "Place text content in a named text frame in the active document",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "frame_name": {
                            "type": "string",
                            "description": "Name of the text frame (as defined in InDesign)"
                        },
                        "text": {
                            "type": "string",
                            "description": "Text content to place in the frame"
                        }
                    },
                    "required": ["frame_name", "text"]
                }
            },
            {
                "name": "place_image_in_frame",
                "description": "Place an image in a named image frame in the active document",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "frame_name": {
                            "type": "string",
                            "description": "Name of the image frame (as defined in InDesign)"
                        },
                        "url": {
                            "type": "string",
                            "description": "File path or URL to the image"
                        }
                    },
                    "required": ["frame_name", "url"]
                }
            },
            {
                "name": "export_pdf",
                "description": "Export the active InDesign document as PDF",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "preset": {
                            "type": "string",
                            "description": "PDF export preset name (e.g., '[High Quality Print]', '[Press Quality]')",
                            "default": "[High Quality Print]"
                        },
                        "output_path": {
                            "type": "string",
                            "description": "Absolute path for output PDF file (must be in T:\\Projects\\pdf-orchestrator\\)"
                        }
                    },
                    "required": ["output_path"]
                }
            }
        ]


def main():
    """Entry point for InDesign MCP server."""
    server = AdobeInDesignMCPServer()
    server.run()


if __name__ == "__main__":
    main()
