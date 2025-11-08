#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Intelligent Export Optimizer for PDF Orchestrator

Automatically selects optimal export settings based on document purpose:
- Print production (PDF/X-4, CMYK, 300 DPI, bleed)
- Digital presentation (sRGB, 150 DPI, optimized)
- Draft/review (fast, compressed)
- Accessibility (PDF/UA compliance)

Usage:
    from export_optimizer import ExportOptimizer

    optimizer = ExportOptimizer()
    settings = optimizer.optimize_for_purpose("partnership_presentation")
    result = optimizer.export_document(settings)
"""

import sys
import os
import json
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional
import hashlib

# Add InDesign automation modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client


class ExportPurpose(Enum):
    """Document export purposes with predefined optimization profiles"""
    PRINT_PRODUCTION = "print_production"
    PARTNERSHIP_PRESENTATION = "partnership_presentation"
    DIGITAL_MARKETING = "digital_marketing"
    ACCESSIBILITY_FIRST = "accessibility_first"
    DRAFT_REVIEW = "draft_review"
    ARCHIVE_PRESERVATION = "archive_preservation"
    WEB_OPTIMIZED = "web_optimized"


class ColorProfile(Enum):
    """Color management profiles"""
    CMYK_COATED = "ISO Coated v2 (ECI)"
    CMYK_UNCOATED = "ISO Uncoated"
    SRGB = "sRGB IEC61966-2.1"
    ADOBE_RGB = "Adobe RGB (1998)"
    DISPLAY_P3 = "Display P3"


class PDFStandard(Enum):
    """PDF compliance standards"""
    PDFX_4 = "PDF/X-4:2010"
    PDFX_3 = "PDF/X-3:2002"
    PDFX_1A = "PDF/X-1a:2001"
    PDFA_2 = "PDF/A-2b"
    PDFUA = "PDF/UA-1"
    STANDARD = "Standard"


class ExportOptimizer:
    """Intelligent PDF export optimization system"""

    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the export optimizer

        Args:
            config_path: Optional path to custom configuration JSON
        """
        self.config = self._load_config(config_path)
        self.mcp_initialized = False

        # Load export profiles
        self.profiles = self._initialize_profiles()

    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Load configuration from file or use defaults"""
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                return json.load(f)

        # Default configuration
        return {
            "mcp_server": {
                "application": "indesign",
                "proxy_url": "http://localhost:8013",
                "timeout": 60
            },
            "output_directory": "exports",
            "validation_enabled": True,
            "auto_backup": True
        }

    def _initialize_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Initialize export optimization profiles"""
        return {
            ExportPurpose.PRINT_PRODUCTION.value: {
                "name": "Print Production (PDF/X-4)",
                "description": "Professional print-ready with bleed and trim marks",
                "pdf_standard": PDFStandard.PDFX_4.value,
                "color_profile": ColorProfile.CMYK_COATED.value,
                "color_conversion": "Convert to Destination (Preserve Numbers)",
                "resolution": 300,
                "compression": {
                    "images": "JPEG",
                    "quality": "Maximum",
                    "downsample": False
                },
                "bleed": {
                    "enabled": True,
                    "top": 3,  # mm
                    "bottom": 3,
                    "left": 3,
                    "right": 3
                },
                "marks": {
                    "crop_marks": True,
                    "bleed_marks": True,
                    "registration_marks": True,
                    "color_bars": True,
                    "page_information": True
                },
                "fonts": {
                    "embed_all": True,
                    "subset_threshold": 0  # Embed complete fonts
                },
                "optimization": {
                    "optimize_for_web": False,
                    "create_tagged_pdf": False
                },
                "compatibility": "Acrobat 7 (PDF 1.6)",
                "export_preset": "High Quality Print"
            },

            ExportPurpose.PARTNERSHIP_PRESENTATION.value: {
                "name": "Partnership Presentation (High-Quality Digital)",
                "description": "Premium digital document for stakeholder presentations",
                "pdf_standard": PDFStandard.STANDARD.value,
                "color_profile": ColorProfile.SRGB.value,
                "color_conversion": "Convert to Destination",
                "resolution": 150,  # Optimal for screens
                "compression": {
                    "images": "JPEG",
                    "quality": "High",
                    "downsample": True,
                    "downsample_to": 150
                },
                "bleed": {
                    "enabled": False
                },
                "marks": {
                    "crop_marks": False,
                    "bleed_marks": False,
                    "registration_marks": False,
                    "color_bars": False,
                    "page_information": False
                },
                "fonts": {
                    "embed_all": True,
                    "subset_threshold": 100  # Subset when < 100% used
                },
                "optimization": {
                    "optimize_for_web": True,
                    "create_tagged_pdf": True,
                    "generate_thumbnails": True,
                    "view_pdf_after_export": False
                },
                "compatibility": "Acrobat 7 (PDF 1.6)",
                "export_preset": "High Quality Print",
                "file_size_target": "balanced"  # Balance quality vs size
            },

            ExportPurpose.DIGITAL_MARKETING.value: {
                "name": "Digital Marketing (Web-Optimized)",
                "description": "Fast-loading web document with sRGB color",
                "pdf_standard": PDFStandard.STANDARD.value,
                "color_profile": ColorProfile.SRGB.value,
                "color_conversion": "Convert to Destination",
                "resolution": 96,  # Web resolution
                "compression": {
                    "images": "JPEG",
                    "quality": "Medium",
                    "downsample": True,
                    "downsample_to": 96
                },
                "bleed": {
                    "enabled": False
                },
                "marks": {
                    "crop_marks": False,
                    "bleed_marks": False,
                    "registration_marks": False,
                    "color_bars": False,
                    "page_information": False
                },
                "fonts": {
                    "embed_all": True,
                    "subset_threshold": 100
                },
                "optimization": {
                    "optimize_for_web": True,
                    "create_tagged_pdf": False,
                    "generate_thumbnails": True,
                    "view_pdf_after_export": False,
                    "linearize": True  # Fast web view
                },
                "compatibility": "Acrobat 5 (PDF 1.4)",
                "export_preset": "Smallest File Size",
                "file_size_target": "minimal"
            },

            ExportPurpose.ACCESSIBILITY_FIRST.value: {
                "name": "Accessibility-First (PDF/UA)",
                "description": "WCAG 2.1 AA compliant with full accessibility features",
                "pdf_standard": PDFStandard.PDFUA.value,
                "color_profile": ColorProfile.SRGB.value,
                "color_conversion": "Convert to Destination",
                "resolution": 150,
                "compression": {
                    "images": "JPEG",
                    "quality": "High",
                    "downsample": True,
                    "downsample_to": 150
                },
                "bleed": {
                    "enabled": False
                },
                "marks": {
                    "crop_marks": False,
                    "bleed_marks": False,
                    "registration_marks": False,
                    "color_bars": False,
                    "page_information": False
                },
                "fonts": {
                    "embed_all": True,
                    "subset_threshold": 0  # Full embed for accessibility
                },
                "optimization": {
                    "optimize_for_web": True,
                    "create_tagged_pdf": True,
                    "generate_bookmarks": True,
                    "generate_thumbnails": True,
                    "include_structure": True,
                    "alt_text_required": True
                },
                "compatibility": "Acrobat 7 (PDF 1.6)",
                "export_preset": "High Quality Print"
            },

            ExportPurpose.DRAFT_REVIEW.value: {
                "name": "Draft Review (Fast Preview)",
                "description": "Quick draft for internal review, optimized for speed",
                "pdf_standard": PDFStandard.STANDARD.value,
                "color_profile": ColorProfile.SRGB.value,
                "color_conversion": "No Color Conversion",
                "resolution": 72,  # Low res for speed
                "compression": {
                    "images": "JPEG",
                    "quality": "Medium",
                    "downsample": True,
                    "downsample_to": 72
                },
                "bleed": {
                    "enabled": False
                },
                "marks": {
                    "crop_marks": False,
                    "bleed_marks": False,
                    "registration_marks": False,
                    "color_bars": False,
                    "page_information": True  # Show page info for review
                },
                "fonts": {
                    "embed_all": False,  # Speed over portability
                    "subset_threshold": 100
                },
                "optimization": {
                    "optimize_for_web": False,
                    "create_tagged_pdf": False,
                    "view_pdf_after_export": True  # Auto-open for review
                },
                "compatibility": "Acrobat 5 (PDF 1.4)",
                "export_preset": "Smallest File Size"
            },

            ExportPurpose.ARCHIVE_PRESERVATION.value: {
                "name": "Archive (PDF/A-2)",
                "description": "Long-term preservation with embedded resources",
                "pdf_standard": PDFStandard.PDFA_2.value,
                "color_profile": ColorProfile.SRGB.value,
                "color_conversion": "Convert to Destination",
                "resolution": 300,  # High quality for preservation
                "compression": {
                    "images": "JPEG",
                    "quality": "Maximum",
                    "downsample": False  # Preserve original quality
                },
                "bleed": {
                    "enabled": False
                },
                "marks": {
                    "crop_marks": False,
                    "bleed_marks": False,
                    "registration_marks": False,
                    "color_bars": False,
                    "page_information": False
                },
                "fonts": {
                    "embed_all": True,
                    "subset_threshold": 0  # Full embedding required for PDF/A
                },
                "optimization": {
                    "optimize_for_web": False,
                    "create_tagged_pdf": True,
                    "include_metadata": True,
                    "preserve_editability": False
                },
                "compatibility": "Acrobat 7 (PDF 1.6)",
                "export_preset": "High Quality Print"
            },

            ExportPurpose.WEB_OPTIMIZED.value: {
                "name": "Web-Optimized (Linearized)",
                "description": "Fast page-at-a-time download for web viewing",
                "pdf_standard": PDFStandard.STANDARD.value,
                "color_profile": ColorProfile.SRGB.value,
                "color_conversion": "Convert to Destination",
                "resolution": 96,
                "compression": {
                    "images": "JPEG",
                    "quality": "Medium",
                    "downsample": True,
                    "downsample_to": 96
                },
                "bleed": {
                    "enabled": False
                },
                "marks": {
                    "crop_marks": False,
                    "bleed_marks": False,
                    "registration_marks": False,
                    "color_bars": False,
                    "page_information": False
                },
                "fonts": {
                    "embed_all": True,
                    "subset_threshold": 100
                },
                "optimization": {
                    "optimize_for_web": True,
                    "create_tagged_pdf": True,
                    "linearize": True,
                    "generate_thumbnails": True
                },
                "compatibility": "Acrobat 6 (PDF 1.5)",
                "export_preset": "Smallest File Size"
            }
        }

    def detect_purpose(self, document_metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Intelligently detect document purpose from metadata

        Args:
            document_metadata: Document information (filename, tags, content)

        Returns:
            Detected export purpose
        """
        if not document_metadata:
            return ExportPurpose.PARTNERSHIP_PRESENTATION.value

        # Extract indicators
        filename = document_metadata.get('filename', '').lower()
        tags = [tag.lower() for tag in document_metadata.get('tags', [])]
        content_keywords = [kw.lower() for kw in document_metadata.get('keywords', [])]

        # Detection rules (priority order)
        if any(kw in filename for kw in ['print', 'production', 'offset', 'cmyk']):
            return ExportPurpose.PRINT_PRODUCTION.value

        if any(kw in filename for kw in ['web', 'online', 'website']):
            return ExportPurpose.WEB_OPTIMIZED.value

        if any(kw in filename for kw in ['draft', 'review', 'wip', 'temp']):
            return ExportPurpose.DRAFT_REVIEW.value

        if any(kw in filename for kw in ['archive', 'preservation', 'pdf-a']):
            return ExportPurpose.ARCHIVE_PRESERVATION.value

        if any(kw in filename for kw in ['accessible', 'wcag', 'ada', 'section508']):
            return ExportPurpose.ACCESSIBILITY_FIRST.value

        if any(kw in filename for kw in ['marketing', 'social', 'campaign']):
            return ExportPurpose.DIGITAL_MARKETING.value

        # Check tags
        if 'print' in tags or 'production' in tags:
            return ExportPurpose.PRINT_PRODUCTION.value

        if 'accessibility' in tags or 'a11y' in tags:
            return ExportPurpose.ACCESSIBILITY_FIRST.value

        # Default for partnership/presentation documents
        if any(kw in filename for kw in ['partnership', 'presentation', 'proposal', 'aws', 'teei']):
            return ExportPurpose.PARTNERSHIP_PRESENTATION.value

        # Default fallback
        return ExportPurpose.PARTNERSHIP_PRESENTATION.value

    def optimize_for_purpose(self, purpose: str, overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Get optimized export settings for a specific purpose

        Args:
            purpose: Export purpose (use ExportPurpose enum values)
            overrides: Optional settings to override

        Returns:
            Complete export settings dictionary
        """
        if purpose not in self.profiles:
            raise ValueError(f"Unknown export purpose: {purpose}. Valid options: {list(self.profiles.keys())}")

        # Get base profile
        settings = self.profiles[purpose].copy()

        # Apply overrides if provided
        if overrides:
            settings.update(overrides)

        # Add metadata
        settings['_metadata'] = {
            'purpose': purpose,
            'optimized_at': datetime.now().isoformat(),
            'optimizer_version': '1.0.0'
        }

        return settings

    def _init_mcp_connection(self):
        """Initialize MCP connection to InDesign"""
        if self.mcp_initialized:
            return

        config = self.config['mcp_server']
        socket_client.configure(
            app=config['application'],
            url=config['proxy_url'],
            timeout=config['timeout']
        )
        init(config['application'], socket_client)
        self.mcp_initialized = True
        print("[Export Optimizer] MCP connection initialized")

    def _send_command(self, action: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """Send command to InDesign via MCP"""
        response = sendCommand(createCommand(action, options))
        if response.get("status") != "SUCCESS":
            print(f"[WARNING] Command {action} response: {response}")
        return response

    def export_document(
        self,
        output_path: str,
        purpose: Optional[str] = None,
        settings: Optional[Dict[str, Any]] = None,
        document_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Export document with optimized settings

        Args:
            output_path: Output PDF file path
            purpose: Export purpose (auto-detected if not provided)
            settings: Pre-computed settings (will optimize if not provided)
            document_metadata: Document metadata for auto-detection

        Returns:
            Export result with validation report
        """
        # Initialize MCP connection
        self._init_mcp_connection()

        # Determine purpose if not provided
        if not purpose and not settings:
            purpose = self.detect_purpose(document_metadata)
            print(f"[Export Optimizer] Auto-detected purpose: {purpose}")

        # Get optimized settings
        if not settings:
            settings = self.optimize_for_purpose(purpose)

        # Create output directory
        output_dir = os.path.dirname(output_path) or self.config['output_directory']
        os.makedirs(output_dir, exist_ok=True)

        # Build export options for InDesign
        export_options = self._build_export_options(settings)

        print(f"\n{'='*80}")
        print(f"EXPORTING: {settings['name']}")
        print(f"{'='*80}")
        print(f"Purpose: {settings.get('description', 'N/A')}")
        print(f"Standard: {settings.get('pdf_standard', 'Standard')}")
        print(f"Color: {settings.get('color_profile', 'Default')}")
        print(f"Resolution: {settings.get('resolution', 150)} DPI")
        print(f"Output: {output_path}")
        print(f"{'='*80}\n")

        # Export PDF
        response = self._send_command("exportPDF", {
            "outputPath": output_path,
            "preset": settings.get('export_preset', 'High Quality Print'),
            "options": export_options
        })

        # Prepare result
        result = {
            "success": response.get("response", {}).get("success", False),
            "output_path": output_path,
            "settings": settings,
            "file_size": None,
            "validation": None
        }

        # Get file info if export succeeded
        if result["success"] and os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            result["file_size"] = file_size
            result["file_size_mb"] = round(file_size / (1024 * 1024), 2)

            print(f"\n[SUCCESS] PDF exported successfully!")
            print(f"Location: {output_path}")
            print(f"File size: {result['file_size_mb']} MB")

            # Run validation if enabled
            if self.config.get('validation_enabled', True):
                result["validation"] = self._validate_export(output_path, settings)
        else:
            print(f"\n[ERROR] PDF export failed")
            print(f"Response: {response}")

        print(f"\n{'='*80}\n")

        return result

    def _build_export_options(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Convert settings to InDesign export options"""
        options = {
            "exportReaderSpreads": False,
            "generateThumbnails": settings.get('optimization', {}).get('generate_thumbnails', True),
            "optimizePDF": settings.get('optimization', {}).get('optimize_for_web', False),
            "viewPDFAfterExporting": settings.get('optimization', {}).get('view_pdf_after_export', False)
        }

        # Add bleed settings if enabled
        if settings.get('bleed', {}).get('enabled', False):
            bleed = settings['bleed']
            options['useDocumentBleedWithPDF'] = True
            options['bleedTop'] = bleed.get('top', 3)
            options['bleedBottom'] = bleed.get('bottom', 3)
            options['bleedInside'] = bleed.get('left', 3)
            options['bleedOutside'] = bleed.get('right', 3)

        # Add marks settings
        if any(settings.get('marks', {}).values()):
            marks = settings['marks']
            options['includeAllPrinterMarks'] = False  # Use custom marks
            options['cropMarks'] = marks.get('crop_marks', False)
            options['bleedMarks'] = marks.get('bleed_marks', False)
            options['registrationMarks'] = marks.get('registration_marks', False)
            options['colorBars'] = marks.get('color_bars', False)
            options['pageInformationMarks'] = marks.get('page_information', False)

        return options

    def _validate_export(self, pdf_path: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate exported PDF against settings

        Args:
            pdf_path: Path to exported PDF
            settings: Export settings used

        Returns:
            Validation report
        """
        validation = {
            "timestamp": datetime.now().isoformat(),
            "checks": [],
            "warnings": [],
            "errors": [],
            "score": 100
        }

        try:
            # Basic file checks
            if not os.path.exists(pdf_path):
                validation["errors"].append("PDF file not found")
                validation["score"] = 0
                return validation

            file_size = os.path.getsize(pdf_path)
            validation["checks"].append(f"File exists ({round(file_size / 1024, 2)} KB)")

            # File size validation
            file_size_mb = file_size / (1024 * 1024)
            target = settings.get('file_size_target', 'balanced')

            if target == 'minimal' and file_size_mb > 10:
                validation["warnings"].append(f"File size ({file_size_mb:.1f} MB) larger than expected for minimal target")
                validation["score"] -= 10
            elif target == 'balanced' and file_size_mb > 50:
                validation["warnings"].append(f"File size ({file_size_mb:.1f} MB) larger than expected for balanced target")
                validation["score"] -= 5

            # TODO: Add more validation checks
            # - PDF/X compliance validation
            # - Font embedding check
            # - Color profile verification
            # - Resolution check
            # - Accessibility validation (for PDF/UA)

            validation["checks"].append("Basic validation completed")

        except Exception as e:
            validation["errors"].append(f"Validation error: {str(e)}")
            validation["score"] = 50

        return validation

    def export_batch(self, jobs: list) -> list:
        """
        Export multiple documents with optimized settings

        Args:
            jobs: List of export jobs, each with {output_path, purpose, metadata}

        Returns:
            List of export results
        """
        results = []

        print(f"\n{'='*80}")
        print(f"BATCH EXPORT: {len(jobs)} documents")
        print(f"{'='*80}\n")

        for i, job in enumerate(jobs, 1):
            print(f"[{i}/{len(jobs)}] Exporting {job['output_path']}...")

            result = self.export_document(
                output_path=job['output_path'],
                purpose=job.get('purpose'),
                document_metadata=job.get('metadata')
            )

            results.append(result)

        # Summary
        successful = sum(1 for r in results if r['success'])
        print(f"\n{'='*80}")
        print(f"BATCH COMPLETE: {successful}/{len(jobs)} successful")
        print(f"{'='*80}\n")

        return results

    def get_profile_info(self, purpose: str) -> Dict[str, Any]:
        """Get information about an export profile"""
        if purpose not in self.profiles:
            return None

        profile = self.profiles[purpose]
        return {
            "name": profile.get('name'),
            "description": profile.get('description'),
            "best_for": self._get_best_use_cases(purpose)
        }

    def _get_best_use_cases(self, purpose: str) -> list:
        """Get recommended use cases for an export purpose"""
        use_cases = {
            ExportPurpose.PRINT_PRODUCTION.value: [
                "Commercial offset printing",
                "Professional print shops",
                "Magazine/brochure production",
                "High-quality marketing materials"
            ],
            ExportPurpose.PARTNERSHIP_PRESENTATION.value: [
                "Stakeholder presentations",
                "Partnership proposals",
                "Executive briefings",
                "Client deliverables"
            ],
            ExportPurpose.DIGITAL_MARKETING.value: [
                "Email campaigns",
                "Social media shares",
                "Website downloads",
                "Quick promotional materials"
            ],
            ExportPurpose.ACCESSIBILITY_FIRST.value: [
                "Government documents (Section 508)",
                "Educational materials",
                "Public-facing documents",
                "WCAG 2.1 compliance required"
            ],
            ExportPurpose.DRAFT_REVIEW.value: [
                "Internal review cycles",
                "Quick stakeholder feedback",
                "Work-in-progress sharing",
                "Fast iteration"
            ],
            ExportPurpose.ARCHIVE_PRESERVATION.value: [
                "Long-term storage",
                "Legal documents",
                "Historical records",
                "Compliance archives"
            ],
            ExportPurpose.WEB_OPTIMIZED.value: [
                "Website embedding",
                "Online documentation",
                "Fast page-at-a-time loading",
                "Mobile-friendly viewing"
            ]
        }

        return use_cases.get(purpose, [])

    def list_profiles(self) -> list:
        """List all available export profiles"""
        return [
            {
                "purpose": purpose,
                "name": profile['name'],
                "description": profile['description']
            }
            for purpose, profile in self.profiles.items()
        ]


def main():
    """CLI interface for export optimizer"""
    import argparse

    parser = argparse.ArgumentParser(description="Intelligent PDF Export Optimizer")
    parser.add_argument('output_path', help='Output PDF file path')
    parser.add_argument('--purpose', choices=[p.value for p in ExportPurpose],
                       help='Export purpose (auto-detected if not provided)')
    parser.add_argument('--list-profiles', action='store_true',
                       help='List all export profiles')
    parser.add_argument('--profile-info', help='Get info about a specific profile')

    args = parser.parse_args()

    optimizer = ExportOptimizer()

    if args.list_profiles:
        print("\nAvailable Export Profiles:\n")
        for profile in optimizer.list_profiles():
            print(f"{profile['purpose']}")
            print(f"  Name: {profile['name']}")
            print(f"  Description: {profile['description']}\n")
        return

    if args.profile_info:
        info = optimizer.get_profile_info(args.profile_info)
        if info:
            print(f"\n{info['name']}")
            print(f"{info['description']}\n")
            print("Best for:")
            for use_case in info['best_for']:
                print(f"  • {use_case}")
            print()
        else:
            print(f"Unknown profile: {args.profile_info}")
        return

    # Export document
    result = optimizer.export_document(
        output_path=args.output_path,
        purpose=args.purpose
    )

    # Exit with appropriate code
    sys.exit(0 if result['success'] else 1)


if __name__ == "__main__":
    main()
