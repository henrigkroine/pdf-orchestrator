#!/usr/bin/env python3
"""
Check InDesign document page size and diagnose export issues
"""

import sys
import json
import requests

MCP_PROXY_URL = 'http://localhost:8013'
APPLICATION = "indesign"


def execute_script(script: str) -> dict:
    """Execute ExtendScript in InDesign"""
    response = requests.post(
        f'{MCP_PROXY_URL}/execute',
        json={
            'application': APPLICATION,
            'script': script
        },
        headers={'Content-Type': 'application/json'}
    )
    response.raise_for_status()
    return response.json()


def check_document_info():
    """Get detailed document information"""
    script = """
    (function() {
        if (app.documents.length === 0) {
            return {error: "No document open"};
        }

        var doc = app.activeDocument;
        var page = doc.pages[0];

        return {
            documentName: doc.name,
            pageCount: doc.pages.length,
            pageWidth: doc.documentPreferences.pageWidth,
            pageHeight: doc.documentPreferences.pageHeight,
            pageWidthInches: doc.documentPreferences.pageWidth / 72,
            pageHeightInches: doc.documentPreferences.pageHeight / 72,
            facingPages: doc.documentPreferences.facingPages,
            marginTop: doc.marginPreferences.top,
            marginBottom: doc.marginPreferences.bottom,
            marginLeft: doc.marginPreferences.left,
            marginRight: doc.marginPreferences.right,
            firstPageBounds: page.bounds,
            measurementUnits: doc.viewPreferences.horizontalMeasurementUnits.toString()
        };
    })();
    """

    result = execute_script(script)
    return result


def check_pdf_export_settings():
    """Check current PDF export preferences"""
    script = """
    (function() {
        var prefs = app.pdfExportPreferences;
        return {
            pageRange: prefs.pageRange.toString(),
            exportReaderSpreads: prefs.exportReaderSpreads,
            pdfColorSpace: prefs.pdfColorSpace.toString(),
            includeICCProfiles: prefs.includeICCProfiles,
            standardsCompliance: prefs.standardsCompliance.toString(),
            useDocumentBleedWithPDF: prefs.useDocumentBleedWithPDF
        };
    })();
    """

    result = execute_script(script)
    return result


def main():
    print("=" * 80)
    print("InDesign Document Size Diagnostic")
    print("=" * 80)

    try:
        # Check document info
        print("\n1. Document Information:")
        print("-" * 80)
        doc_info = check_document_info()

        if 'error' in doc_info:
            print(f"ERROR: {doc_info['error']}")
            return 1

        print(f"Document name: {doc_info.get('documentName')}")
        print(f"Page count: {doc_info.get('pageCount')}")
        print(f"Page size (points): {doc_info.get('pageWidth')} x {doc_info.get('pageHeight')}")
        print(f"Page size (inches): {doc_info.get('pageWidthInches'):.2f}\" x {doc_info.get('pageHeightInches'):.2f}\"")
        print(f"Facing pages: {doc_info.get('facingPages')}")
        print(f"Margins (T/B/L/R): {doc_info.get('marginTop')}, {doc_info.get('marginBottom')}, "
              f"{doc_info.get('marginLeft')}, {doc_info.get('marginRight')}")
        print(f"First page bounds: {doc_info.get('firstPageBounds')}")
        print(f"Measurement units: {doc_info.get('measurementUnits')}")

        # Expected size
        expected_width = 612
        expected_height = 792
        actual_width = doc_info.get('pageWidth')
        actual_height = doc_info.get('pageHeight')

        print("\n2. Page Size Validation:")
        print("-" * 80)
        if actual_width == expected_width and actual_height == expected_height:
            print("✅ PASS: Document is correct Letter size (8.5\" x 11\")")
        else:
            print(f"❌ FAIL: Document size mismatch!")
            print(f"  Expected: {expected_width} x {expected_height} pts (8.5\" x 11\")")
            print(f"  Actual: {actual_width} x {actual_height} pts "
                  f"({actual_width/72:.2f}\" x {actual_height/72:.2f}\")")

        # Check PDF export settings
        print("\n3. PDF Export Preferences:")
        print("-" * 80)
        export_settings = check_pdf_export_settings()
        for key, value in export_settings.items():
            print(f"{key}: {value}")

        return 0

    except Exception as e:
        print(f"ERROR: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
