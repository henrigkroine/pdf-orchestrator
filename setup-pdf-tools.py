#!/usr/bin/env python3
"""
Setup script for extended PDF and image processing tools
Integrates with InDesign automation for complete PDF orchestration
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✓ {package} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install {package}: {e}")
        return False

def main():
    print("="*60)
    print("PDF ORCHESTRATOR - EXTENDED TOOLS SETUP")
    print("="*60)
    print()

    # Core packages for PDF manipulation
    core_packages = [
        ("pypdf2", "PDF manipulation - merge, split, rotate, encrypt"),
        ("pillow", "Image analysis and basic processing"),
        ("opencv-python", "Advanced image processing and CV"),
        ("pdfplumber", "Extract tables and structured data from PDFs"),
        ("reportlab", "Generate PDFs programmatically"),
    ]

    # Optional but recommended packages
    optional_packages = [
        ("pymupdf", "Fast PDF rendering (alternative to PyPDF2)"),
        ("pytesseract", "OCR for scanned PDFs"),
        ("pdf2image", "Convert PDF pages to images"),
        ("camelot-py[cv]", "High-accuracy table extraction"),
        ("pandas", "Data processing for extracted tables"),
        ("openpyxl", "Excel integration for data export"),
    ]

    print("INSTALLING CORE PACKAGES:")
    print("-"*40)
    for package, description in core_packages:
        print(f"\n{package}: {description}")
        install_package(package)

    print("\n" + "="*60)
    print("CORE PACKAGES INSTALLED!")
    print("="*60)

    # Ask about optional packages
    print("\nWould you like to install optional packages?")
    print("These provide additional functionality:")
    for package, description in optional_packages:
        print(f"  • {package}: {description}")

    response = input("\nInstall optional packages? (y/n): ").lower()
    if response == 'y':
        print("\nINSTALLING OPTIONAL PACKAGES:")
        print("-"*40)
        for package, description in optional_packages:
            print(f"\n{package}: {description}")
            install_package(package)

    print("\n" + "="*60)
    print("SETUP COMPLETE!")
    print("="*60)

    print("\nYou can now use these tools with InDesign automation:")
    print("  • Extract tables from PDFs and place in InDesign")
    print("  • Analyze images before placing in documents")
    print("  • Merge multiple PDFs after InDesign export")
    print("  • Add watermarks and encryption to final PDFs")
    print("  • OCR scanned documents for text extraction")

    print("\nExample usage:")
    print("-"*40)
    print("""
from PyPDF2 import PdfMerger, PdfReader
from PIL import Image
import pdfplumber

# Merge PDFs exported from InDesign
merger = PdfMerger()
merger.append('TEEI_Brief_Page1.pdf')
merger.append('TEEI_Brief_Page2.pdf')
merger.write('TEEI_Complete_Brief.pdf')

# Extract table from PDF
with pdfplumber.open('data.pdf') as pdf:
    table = pdf.pages[0].extract_table()
    # Now send table data to InDesign via MCP

# Analyze image before placing
img = Image.open('logo.png')
print(f"Image size: {img.size}")
print(f"Image mode: {img.mode}")
# Resize if needed before sending to InDesign
""")

if __name__ == "__main__":
    main()