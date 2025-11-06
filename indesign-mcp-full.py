#!/usr/bin/env python3
"""
Adobe InDesign MCP Server - Full Feature Set
Implements Core v1, Pro v2, and Enterprise v3 tools
Transport: stdio only
"""

import sys
import os
from typing import Optional, Literal, List, Dict, Any
from pathlib import Path

# Add the adb-mcp/mcp directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from mcp.server.fastmcp import FastMCP
from core import init, sendCommand, createCommand
import socket_client

# Create an MCP server
mcp_name = "Adobe InDesign MCP Server - Full"
mcp = FastMCP(mcp_name, log_level="ERROR")
print(f"{mcp_name} running on stdio", file=sys.stderr)

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 30

socket_client.configure(
    app=APPLICATION,
    url=PROXY_URL,
    timeout=PROXY_TIMEOUT
)

init(APPLICATION, socket_client)

# Store for idempotency
_request_cache: Dict[str, Any] = {}

def _handle_response(response: dict, request_id: Optional[str] = None) -> dict:
    """
    Convert internal response to standardized format.
    Returns { ok:true, ... } or { ok:false, error:{code,msg,details?} }
    """
    if request_id and request_id in _request_cache:
        return _request_cache[request_id]

    result = {}

    if response.get("status") == "SUCCESS":
        result = {
            "ok": True,
            "data": response.get("response", {}),
            "activeDocument": response.get("activeDocument")
        }
    else:
        result = {
            "ok": False,
            "error": {
                "code": "COMMAND_FAILED",
                "msg": response.get("message", "Unknown error"),
                "details": response
            }
        }

    if request_id:
        _request_cache[request_id] = result

    return result

def _validate_path(path: str, allow_unc: bool = False) -> str:
    """Validate and return absolute Windows path"""
    if not path:
        raise ValueError("Path cannot be empty")

    p = Path(path)

    if not allow_unc and path.startswith("\\\\"):
        raise ValueError("UNC paths not allowed")

    if not p.is_absolute():
        raise ValueError(f"Path must be absolute: {path}")

    return str(p.resolve())

# ============================================================================
# CORE V1 - Must-have tools
# ============================================================================

@mcp.tool()
def create_document(
    width: float,
    height: float,
    units: Literal["pt", "mm", "in"] = "pt",
    pages: int = 1,
    bleed: Optional[Dict[str, float]] = None,
    name: Optional[str] = None,
    preset: Optional[str] = None,
    request_id: Optional[str] = None
) -> dict:
    """
    Creates a new InDesign document.

    Args:
        width: Document width in specified units
        height: Document height in specified units
        units: Measurement units - "pt" (points), "mm" (millimeters), or "in" (inches)
        pages: Number of pages (default 1)
        bleed: Optional bleed settings {top, left, bottom, right} in same units
        name: Optional document name
        preset: Optional preset name to apply
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {...}} or {ok: false, error: {...}}
    """
    try:
        # Convert to points (InDesign's internal unit)
        unit_to_pt = {"pt": 1, "mm": 2.834645669, "in": 72}
        multiplier = unit_to_pt[units]

        width_pt = width * multiplier
        height_pt = height * multiplier

        # Default bleed
        bleed_settings = bleed or {"top": 0, "left": 0, "bottom": 0, "right": 0}
        bleed_pt = {k: v * multiplier for k, v in bleed_settings.items()}

        # Default margins (0.5 inch)
        margins = {"top": 36, "bottom": 36, "left": 36, "right": 36}

        command = createCommand("createDocument", {
            "pageWidth": width_pt,
            "pageHeight": height_pt,
            "pagesPerDocument": pages,
            "pagesFacing": False,
            "margins": margins,
            "columns": {"count": 1, "gutter": 12},
            "bleed": bleed_pt,
            "name": name,
            "preset": preset,
            "units": units
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "CREATE_DOCUMENT_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def load_template(
    path: str,
    use_master_pages: bool = True,
    request_id: Optional[str] = None
) -> dict:
    """
    Loads an InDesign template (.indt or .indd file).

    Args:
        path: Absolute path to template file
        use_master_pages: Whether to preserve master pages from template
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {...}} or {ok: false, error: {...}}
    """
    try:
        validated_path = _validate_path(path)

        if not Path(validated_path).exists():
            return {
                "ok": False,
                "error": {
                    "code": "FILE_NOT_FOUND",
                    "msg": f"Template not found: {validated_path}"
                }
            }

        command = createCommand("loadTemplate", {
            "path": validated_path,
            "useMasterPages": use_master_pages
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "LOAD_TEMPLATE_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def place_text(
    page: int,
    x: float,
    y: float,
    width: float,
    height: float,
    content: str,
    style: Optional[str] = None,
    overflow: Literal["expand", "truncate", "autoflow"] = "expand",
    request_id: Optional[str] = None
) -> dict:
    """
    Creates a text frame and places text content.

    Args:
        page: Page number (1-based)
        x: X position in points from left
        y: Y position in points from top
        width: Frame width in points
        height: Frame height in points
        content: Text content to place
        style: Optional paragraph style name to apply
        overflow: How to handle text overflow - "expand", "truncate", or "autoflow"
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {id, bounds}} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("placeText", {
            "page": page,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "content": content,
            "style": style,
            "overflow": overflow
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "PLACE_TEXT_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def place_image(
    page: int,
    x: float,
    y: float,
    path: str,
    width: Optional[float] = None,
    height: Optional[float] = None,
    fit: Literal["none", "frame", "content", "proportionally", "contentAware"] = "proportionally",
    request_id: Optional[str] = None
) -> dict:
    """
    Places an image in the document.

    Args:
        page: Page number (1-based)
        x: X position in points from left
        y: Y position in points from top
        path: Absolute path to image file
        width: Optional frame width (if not specified, uses image width)
        height: Optional frame height (if not specified, uses image height)
        fit: How to fit image - "none", "frame", "content", "proportionally", "contentAware"
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {id, bounds}} or {ok: false, error: {...}}
    """
    try:
        validated_path = _validate_path(path)

        if not Path(validated_path).exists():
            return {
                "ok": False,
                "error": {
                    "code": "FILE_NOT_FOUND",
                    "msg": f"Image not found: {validated_path}"
                }
            }

        command = createCommand("placeImage", {
            "page": page,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "path": validated_path,
            "fit": fit
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "PLACE_IMAGE_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def apply_style(
    target: Literal["text", "frame", "page", "object"],
    id: Any,
    style: str,
    request_id: Optional[str] = None
) -> dict:
    """
    Applies a style to text, frame, page, or object.

    Args:
        target: Type of target - "text", "frame", "page", or "object"
        id: Target identifier - can be string ID, or dict with {page, frameId?, range?}
        style: Style name to apply
        request_id: Optional idempotency key

    Returns:
        {ok: true} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("applyStyle", {
            "target": target,
            "id": id,
            "style": style
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "APPLY_STYLE_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def export_pdf(
    output_path: str,
    preset: Literal["High Quality Print", "Press Quality", "PDF/X-4", "Digital"] = "High Quality Print",
    include_marks: bool = False,
    use_doc_bleed: bool = True,
    tagged_pdf: bool = False,
    view_pdf: bool = False,
    request_id: Optional[str] = None
) -> dict:
    """
    Exports the document as PDF.

    Args:
        output_path: Absolute path for output PDF file
        preset: PDF export preset name
        include_marks: Include printer's marks
        use_doc_bleed: Use document bleed settings
        tagged_pdf: Create tagged (accessible) PDF
        view_pdf: Open PDF after export
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {path}} or {ok: false, error: {...}}
    """
    try:
        validated_path = _validate_path(output_path)

        # Ensure parent directory exists
        Path(validated_path).parent.mkdir(parents=True, exist_ok=True)

        command = createCommand("exportPDF", {
            "outputPath": validated_path,
            "preset": preset,
            "includeMarks": include_marks,
            "useDocBleed": use_doc_bleed,
            "taggedPDF": tagged_pdf,
            "viewPDF": view_pdf
        })

        response = sendCommand(command)
        result = _handle_response(response, request_id)

        if result.get("ok"):
            result["data"]["path"] = validated_path

        return result

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "EXPORT_PDF_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def save_document(
    path: str,
    overwrite: bool = False,
    request_id: Optional[str] = None
) -> dict:
    """
    Saves the document.

    Args:
        path: Absolute path for saving document (.indd)
        overwrite: Allow overwriting existing file
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {path}} or {ok: false, error: {...}}
    """
    try:
        validated_path = _validate_path(path)

        if not overwrite and Path(validated_path).exists():
            return {
                "ok": False,
                "error": {
                    "code": "FILE_EXISTS",
                    "msg": f"File exists and overwrite=False: {validated_path}"
                }
            }

        # Ensure parent directory exists
        Path(validated_path).parent.mkdir(parents=True, exist_ok=True)

        command = createCommand("saveDocument", {
            "path": validated_path,
            "overwrite": overwrite
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "SAVE_DOCUMENT_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def close_document(
    save: Literal["yes", "no", "prompt"] = "prompt",
    request_id: Optional[str] = None
) -> dict:
    """
    Closes the active document.

    Args:
        save: Save behavior - "yes", "no", or "prompt"
        request_id: Optional idempotency key

    Returns:
        {ok: true} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("closeDocument", {
            "save": save
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "CLOSE_DOCUMENT_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def read_document_info(
    request_id: Optional[str] = None
) -> dict:
    """
    Reads information about the active document.

    Returns:
        {ok: true, data: {name, pages, pageSize, bleed, styles, linksCount, fonts}}
        or {ok: false, error: {...}}
    """
    try:
        command = createCommand("readDocumentInfo", {})

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "READ_DOCUMENT_INFO_FAILED",
                "msg": str(e)
            }
        }

# ============================================================================
# PRO V2 - Layout and data ops
# ============================================================================

@mcp.tool()
def grid_frame_text(
    page: int,
    columns: int,
    gutter: float,
    margins: Dict[str, float],
    content: str,
    style: Optional[str] = None,
    request_id: Optional[str] = None
) -> dict:
    """
    Creates a grid-based text layout.

    Args:
        page: Page number (1-based)
        columns: Number of columns
        gutter: Space between columns in points
        margins: {top, left, bottom, right} in points
        content: Text content to flow
        style: Optional paragraph style name
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {frames: []}} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("gridFrameText", {
            "page": page,
            "columns": columns,
            "gutter": gutter,
            "margins": margins,
            "content": content,
            "style": style
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "GRID_FRAME_TEXT_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def table_from_csv(
    page: int,
    x: float,
    y: float,
    csv_path: str,
    width: float,
    max_height: Optional[float] = None,
    table_style: Optional[str] = None,
    header_row: bool = True,
    request_id: Optional[str] = None
) -> dict:
    """
    Creates a table from CSV data.

    Args:
        page: Page number (1-based)
        x: X position in points
        y: Y position in points
        csv_path: Absolute path to CSV file
        width: Table width in points
        max_height: Optional maximum height
        table_style: Optional table style name
        header_row: Treat first row as header
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {id, rows, cols}} or {ok: false, error: {...}}
    """
    try:
        validated_path = _validate_path(csv_path)

        if not Path(validated_path).exists():
            return {
                "ok": False,
                "error": {
                    "code": "FILE_NOT_FOUND",
                    "msg": f"CSV not found: {validated_path}"
                }
            }

        command = createCommand("tableFromCSV", {
            "page": page,
            "x": x,
            "y": y,
            "csvPath": validated_path,
            "width": width,
            "maxHeight": max_height,
            "tableStyle": table_style,
            "headerRow": header_row
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "TABLE_FROM_CSV_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def place_svg_chart(
    page: int,
    x: float,
    y: float,
    svg: str,
    width: float,
    height: float,
    request_id: Optional[str] = None
) -> dict:
    """
    Places an SVG chart in the document.

    Args:
        page: Page number (1-based)
        x: X position in points
        y: Y position in points
        svg: SVG content as string
        width: Chart width in points
        height: Chart height in points
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {id}} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("placeSVGChart", {
            "page": page,
            "x": x,
            "y": y,
            "svg": svg,
            "width": width,
            "height": height
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "PLACE_SVG_CHART_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def master_apply(
    master_name: str,
    pages: Any,  # Can be list of ints or "all"
    request_id: Optional[str] = None
) -> dict:
    """
    Applies a master page to specified pages.

    Args:
        master_name: Name of master page to apply
        pages: List of page numbers or "all"
        request_id: Optional idempotency key

    Returns:
        {ok: true} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("masterApply", {
            "masterName": master_name,
            "pages": pages
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "MASTER_APPLY_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def link_replace_all(
    find_dir: str,
    replace_dir: str,
    request_id: Optional[str] = None
) -> dict:
    """
    Replaces all linked file paths.

    Args:
        find_dir: Directory path to find
        replace_dir: Directory path to replace with
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {replaced: count}} or {ok: false, error: {...}}
    """
    try:
        find_path = _validate_path(find_dir)
        replace_path = _validate_path(replace_dir)

        command = createCommand("linkReplaceAll", {
            "findDir": find_path,
            "replaceDir": replace_path
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "LINK_REPLACE_ALL_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def find_replace_text(
    find: str,
    replace: str,
    scope: Literal["document", "page", "story"] = "document",
    style_constraint: Optional[str] = None,
    request_id: Optional[str] = None
) -> dict:
    """
    Finds and replaces text.

    Args:
        find: Text to find
        replace: Replacement text
        scope: Search scope - "document", "page", or "story"
        style_constraint: Optional style name to limit search
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {replaced: count}} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("findReplaceText", {
            "find": find,
            "replace": replace,
            "scope": scope,
            "styleConstraint": style_constraint
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "FIND_REPLACE_TEXT_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def toc_generate(
    style: str,
    include_levels: List[int],
    dest_page: Optional[int] = None,
    request_id: Optional[str] = None
) -> dict:
    """
    Generates a table of contents.

    Args:
        style: TOC style name
        include_levels: List of heading levels to include [1, 2, 3]
        dest_page: Optional destination page (default: beginning)
        request_id: Optional idempotency key

    Returns:
        {ok: true} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("tocGenerate", {
            "style": style,
            "includeLevels": include_levels,
            "destPage": dest_page
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "TOC_GENERATE_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def preflight_run(
    profile: Optional[str] = None,
    request_id: Optional[str] = None
) -> dict:
    """
    Runs preflight check on document.

    Args:
        profile: Optional preflight profile name (default: Basic)
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {errors: [], warnings: []}} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("preflightRun", {
            "profile": profile
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "PREFLIGHT_RUN_FAILED",
                "msg": str(e)
            }
        }

# ============================================================================
# ENTERPRISE V3 - QA, accessibility, packaging
# ============================================================================

@mcp.tool()
def accessibility_tag(
    order: Literal["reading", "articles"] = "reading",
    alt_text_policy: Literal["required", "optional"] = "required",
    lang: str = "en-US",
    request_id: Optional[str] = None
) -> dict:
    """
    Configures accessibility tagging for PDF export.

    Args:
        order: Reading order - "reading" or "articles"
        alt_text_policy: Alt text requirement - "required" or "optional"
        lang: Document language (e.g., "en-US")
        request_id: Optional idempotency key

    Returns:
        {ok: true} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("accessibilityTag", {
            "order": order,
            "altTextPolicy": alt_text_policy,
            "lang": lang
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "ACCESSIBILITY_TAG_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def check_brand_rules(
    palette: List[Dict[str, str]],
    fonts: List[str],
    min_logo_clearspace: float,
    request_id: Optional[str] = None
) -> dict:
    """
    Checks document against brand guidelines.

    Args:
        palette: List of allowed colors [{name, hex}]
        fonts: List of allowed font names
        min_logo_clearspace: Minimum clearspace around logo in points
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {passed: bool, notes: []}} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("checkBrandRules", {
            "palette": palette,
            "fonts": fonts,
            "minLogoClearspace": min_logo_clearspace
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "CHECK_BRAND_RULES_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def package_document(
    output_dir: str,
    copy_fonts: bool = True,
    copy_linked_graphics: bool = True,
    update_graphics: bool = True,
    report: bool = True,
    request_id: Optional[str] = None
) -> dict:
    """
    Packages document with all assets for handoff.

    Args:
        output_dir: Output directory path
        copy_fonts: Include fonts
        copy_linked_graphics: Include linked images
        update_graphics: Update modified links
        report: Generate package report
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {path, report}} or {ok: false, error: {...}}
    """
    try:
        validated_path = _validate_path(output_dir)

        # Ensure directory exists
        Path(validated_path).mkdir(parents=True, exist_ok=True)

        command = createCommand("packageDocument", {
            "outputDir": validated_path,
            "copyFonts": copy_fonts,
            "copyLinkedGraphics": copy_linked_graphics,
            "updateGraphics": update_graphics,
            "report": report
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "PACKAGE_DOCUMENT_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def export_variants(
    variants: List[Dict[str, str]],
    parallel: bool = False,
    request_id: Optional[str] = None
) -> dict:
    """
    Exports multiple PDF variants.

    Args:
        variants: List of export configs [{preset, outputPath}]
        parallel: Export in parallel (if supported)
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {exports: []}} or {ok: false, error: {...}}
    """
    try:
        # Validate all paths
        for variant in variants:
            variant["outputPath"] = _validate_path(variant["outputPath"])
            Path(variant["outputPath"]).parent.mkdir(parents=True, exist_ok=True)

        command = createCommand("exportVariants", {
            "variants": variants,
            "parallel": parallel
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "EXPORT_VARIANTS_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def document_snapshot(
    request_id: Optional[str] = None
) -> dict:
    """
    Creates a snapshot of current document state.

    Returns:
        {ok: true, data: {id, hash, pageThumbsTempDir, timestamp}}
        or {ok: false, error: {...}}
    """
    try:
        command = createCommand("documentSnapshot", {})

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "DOCUMENT_SNAPSHOT_FAILED",
                "msg": str(e)
            }
        }

# ============================================================================
# CROSS-CUTTING CONTROLS
# ============================================================================

@mcp.tool()
def set_units(
    units: Literal["pt", "mm", "in"],
    request_id: Optional[str] = None
) -> dict:
    """
    Sets the document's measurement units.

    Args:
        units: Unit type - "pt" (points), "mm" (millimeters), or "in" (inches)
        request_id: Optional idempotency key

    Returns:
        {ok: true} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("setUnits", {
            "units": units
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "SET_UNITS_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def set_styles(
    paragraph: Optional[List[Dict[str, Any]]] = None,
    character: Optional[List[Dict[str, Any]]] = None,
    object: Optional[List[Dict[str, Any]]] = None,
    request_id: Optional[str] = None
) -> dict:
    """
    Creates or updates document styles.

    Args:
        paragraph: List of paragraph styles [{name, spec}]
        character: List of character styles [{name, spec}]
        object: List of object styles [{name, spec}]
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {created: [], updated: []}} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("setStyles", {
            "paragraph": paragraph or [],
            "character": character or [],
            "object": object or []
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "SET_STYLES_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def batch(
    ops: List[Dict[str, Any]],
    request_id: Optional[str] = None
) -> dict:
    """
    Executes multiple operations atomically with rollback on failure.

    Args:
        ops: List of operations [{tool, args}]
        request_id: Optional idempotency key

    Returns:
        {ok: true, data: {results: []}} or {ok: false, error: {...}}
    """
    try:
        command = createCommand("batch", {
            "ops": ops
        })

        response = sendCommand(command)
        return _handle_response(response, request_id)

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "BATCH_FAILED",
                "msg": str(e)
            }
        }

@mcp.tool()
def ping() -> dict:
    """
    Health check endpoint.

    Returns:
        {ok: true, status: "ok", app: "InDesign", transport: "stdio"}
    """
    try:
        command = createCommand("ping", {})
        response = sendCommand(command)

        return {
            "ok": True,
            "status": "ok",
            "app": "InDesign",
            "transport": "stdio",
            "version": response.get("version", "unknown")
        }
    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "PING_FAILED",
                "msg": str(e)
            }
        }

@mcp.resource("config://instructions")
def get_instructions() -> str:
    """Instructions for using the InDesign MCP server"""
    return """
    Adobe InDesign MCP Server - Full Feature Set

    This server provides comprehensive InDesign automation via MCP.

    CORE V1 TOOLS:
    - create_document: Create new InDesign documents
    - load_template: Load .indt templates
    - place_text: Add text frames
    - place_image: Place images
    - apply_style: Apply paragraph/character/object styles
    - export_pdf: Export to PDF with presets
    - save_document: Save .indd files
    - close_document: Close active document
    - read_document_info: Get document metadata

    PRO V2 TOOLS:
    - grid_frame_text: Multi-column text layouts
    - table_from_csv: Import CSV as table
    - place_svg_chart: Place SVG graphics
    - master_apply: Apply master pages
    - link_replace_all: Batch update links
    - find_replace_text: Search and replace
    - toc_generate: Auto-generate table of contents
    - preflight_run: Quality checks

    ENTERPRISE V3 TOOLS:
    - accessibility_tag: Configure PDF accessibility
    - check_brand_rules: Validate brand guidelines
    - package_document: Package for handoff
    - export_variants: Export multiple versions
    - document_snapshot: Create state snapshot

    CROSS-CUTTING:
    - set_units: Set measurement units
    - set_styles: Batch create/update styles
    - batch: Atomic multi-operation execution
    - ping: Health check

    All tools return {ok: true, ...} or {ok: false, error: {...}}
    All paths must be absolute Windows paths.
    Supports idempotency via optional request_id parameter.
    """

if __name__ == "__main__":
    mcp.run()
