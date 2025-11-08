#!/usr/bin/env python3
"""
Export Optimizer - Usage Examples

Demonstrates all export profiles and common usage patterns.
"""

from export_optimizer import ExportOptimizer, ExportPurpose
import os


def example_1_basic_export():
    """Example 1: Basic export with specific purpose"""
    print("\n" + "="*80)
    print("EXAMPLE 1: Basic Export")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    result = optimizer.export_document(
        output_path="exports/TEEI_AWS_Partnership.pdf",
        purpose=ExportPurpose.PARTNERSHIP_PRESENTATION.value
    )

    print(f"Success: {result['success']}")
    print(f"File size: {result['file_size_mb']} MB")
    print(f"Quality score: {result['validation']['score']}/100")


def example_2_auto_detection():
    """Example 2: Auto-detect purpose from filename"""
    print("\n" + "="*80)
    print("EXAMPLE 2: Auto-Detection from Filename")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    # Filename contains "PRINT" → auto-detects print_production
    result = optimizer.export_document(
        output_path="exports/TEEI_Brochure_PRINT_READY.pdf",
        document_metadata={
            "filename": "TEEI_Brochure_PRINT_READY.pdf"
        }
    )

    detected_purpose = result['settings']['_metadata']['purpose']
    print(f"Detected purpose: {detected_purpose}")
    print(f"Used profile: {result['settings']['name']}")


def example_3_all_profiles():
    """Example 3: Export same document with all 7 profiles"""
    print("\n" + "="*80)
    print("EXAMPLE 3: All Export Profiles")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    purposes = [
        ExportPurpose.PRINT_PRODUCTION.value,
        ExportPurpose.PARTNERSHIP_PRESENTATION.value,
        ExportPurpose.DIGITAL_MARKETING.value,
        ExportPurpose.ACCESSIBILITY_FIRST.value,
        ExportPurpose.DRAFT_REVIEW.value,
        ExportPurpose.ARCHIVE_PRESERVATION.value,
        ExportPurpose.WEB_OPTIMIZED.value
    ]

    print("Exporting TEEI_AWS document with all 7 profiles:\n")

    for purpose in purposes:
        result = optimizer.export_document(
            output_path=f"exports/TEEI_AWS_{purpose}.pdf",
            purpose=purpose
        )

        if result['success']:
            profile_name = result['settings']['name']
            file_size = result['file_size_mb']
            resolution = result['settings']['resolution']
            print(f"✓ {purpose:30s} | {file_size:6.1f} MB | {resolution} DPI | {profile_name}")


def example_4_batch_export():
    """Example 4: Batch export multiple documents"""
    print("\n" + "="*80)
    print("EXAMPLE 4: Batch Export")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    jobs = [
        {
            "output_path": "exports/TEEI_AWS_Presentation.pdf",
            "purpose": ExportPurpose.PARTNERSHIP_PRESENTATION.value,
            "metadata": {"filename": "TEEI_AWS_Presentation.pdf"}
        },
        {
            "output_path": "exports/TEEI_AWS_Print_Version.pdf",
            "purpose": ExportPurpose.PRINT_PRODUCTION.value,
            "metadata": {"filename": "TEEI_AWS_Print_Version.pdf"}
        },
        {
            "output_path": "exports/TEEI_AWS_Web_Version.pdf",
            "purpose": ExportPurpose.WEB_OPTIMIZED.value,
            "metadata": {"filename": "TEEI_AWS_Web_Version.pdf"}
        }
    ]

    results = optimizer.export_batch(jobs)

    # Summary
    print("\nBatch Export Summary:")
    successful = sum(1 for r in results if r['success'])
    print(f"Total: {len(jobs)} documents")
    print(f"Successful: {successful}")
    print(f"Failed: {len(jobs) - successful}")

    # File sizes
    total_size = sum(r.get('file_size_mb', 0) for r in results)
    print(f"Total size: {total_size:.1f} MB")


def example_5_custom_settings():
    """Example 5: Custom settings with overrides"""
    print("\n" + "="*80)
    print("EXAMPLE 5: Custom Settings Override")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    # Start with partnership_presentation, but customize
    settings = optimizer.optimize_for_purpose(
        ExportPurpose.PARTNERSHIP_PRESENTATION.value
    )

    # Override specific settings
    settings['resolution'] = 200  # Higher than default 150 DPI
    settings['compression']['quality'] = 'Maximum'  # Better quality

    result = optimizer.export_document(
        output_path="exports/TEEI_AWS_HighRes.pdf",
        settings=settings
    )

    print(f"Custom resolution: {settings['resolution']} DPI")
    print(f"Custom quality: {settings['compression']['quality']}")
    print(f"File size: {result['file_size_mb']} MB")


def example_6_validation_report():
    """Example 6: Review validation report"""
    print("\n" + "="*80)
    print("EXAMPLE 6: Validation Report")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    result = optimizer.export_document(
        output_path="exports/TEEI_AWS_Validated.pdf",
        purpose=ExportPurpose.PARTNERSHIP_PRESENTATION.value
    )

    validation = result['validation']

    print(f"Quality Score: {validation['score']}/100")
    print(f"\nChecks Performed: {len(validation['checks'])}")
    for check in validation['checks']:
        print(f"  ✓ {check}")

    if validation['warnings']:
        print(f"\nWarnings: {len(validation['warnings'])}")
        for warning in validation['warnings']:
            print(f"  ⚠ {warning}")

    if validation['errors']:
        print(f"\nErrors: {len(validation['errors'])}")
        for error in validation['errors']:
            print(f"  ✗ {error}")


def example_7_print_production():
    """Example 7: Print production with PDF/X-4"""
    print("\n" + "="*80)
    print("EXAMPLE 7: Print Production (PDF/X-4)")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    result = optimizer.export_document(
        output_path="exports/TEEI_Brochure_PRINT.pdf",
        purpose=ExportPurpose.PRINT_PRODUCTION.value
    )

    settings = result['settings']

    print("Print Production Settings:")
    print(f"  Standard: {settings['pdfStandard']}")
    print(f"  Color: {settings['colorProfile']}")
    print(f"  Resolution: {settings['resolution']} DPI")
    print(f"  Bleed: {settings['bleed']['top']}mm all sides")
    print(f"  Crop marks: {settings['marks']['cropMarks']}")
    print(f"  Registration marks: {settings['marks']['registrationMarks']}")
    print(f"  Color bars: {settings['marks']['colorBars']}")


def example_8_accessibility():
    """Example 8: Accessible PDF (PDF/UA)"""
    print("\n" + "="*80)
    print("EXAMPLE 8: Accessible PDF (PDF/UA)")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    result = optimizer.export_document(
        output_path="exports/TEEI_Course_Materials_Accessible.pdf",
        purpose=ExportPurpose.ACCESSIBILITY_FIRST.value
    )

    settings = result['settings']

    print("Accessibility Settings:")
    print(f"  Standard: {settings['pdfStandard']}")
    print(f"  Tagged PDF: {settings['optimization']['createTaggedPDF']}")
    print(f"  Bookmarks: {settings['optimization'].get('generateBookmarks', False)}")
    print(f"  Structure: {settings['optimization'].get('includeStructure', False)}")
    print(f"  Alt text required: {settings['optimization'].get('altTextRequired', False)}")


def example_9_web_optimized():
    """Example 9: Web-optimized with linearization"""
    print("\n" + "="*80)
    print("EXAMPLE 9: Web-Optimized (Linearized)")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    result = optimizer.export_document(
        output_path="exports/TEEI_Newsletter_Web.pdf",
        purpose=ExportPurpose.WEB_OPTIMIZED.value
    )

    settings = result['settings']

    print("Web Optimization Settings:")
    print(f"  Resolution: {settings['resolution']} DPI (web-friendly)")
    print(f"  Linearized: {settings['optimization'].get('linearize', False)}")
    print(f"  Optimized for web: {settings['optimization']['optimizeForWeb']}")
    print(f"  File size: {result['file_size_mb']} MB")
    print(f"  Target: {settings['fileSizeTarget']}")


def example_10_list_profiles():
    """Example 10: List all available profiles"""
    print("\n" + "="*80)
    print("EXAMPLE 10: List All Profiles")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    profiles = optimizer.list_profiles()

    print(f"Available Export Profiles ({len(profiles)} total):\n")

    for profile in profiles:
        print(f"{profile['purpose']}")
        print(f"  Name: {profile['name']}")
        print(f"  Description: {profile['description']}\n")


def example_11_profile_info():
    """Example 11: Get detailed profile information"""
    print("\n" + "="*80)
    print("EXAMPLE 11: Profile Information")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    info = optimizer.get_profile_info(ExportPurpose.PRINT_PRODUCTION.value)

    print(f"{info['name']}")
    print(f"{info['description']}\n")
    print("Best for:")
    for use_case in info['best_for']:
        print(f"  • {use_case}")


def example_12_file_size_comparison():
    """Example 12: Compare file sizes across profiles"""
    print("\n" + "="*80)
    print("EXAMPLE 12: File Size Comparison")
    print("="*80 + "\n")

    optimizer = ExportOptimizer()

    purposes = [
        ExportPurpose.PRINT_PRODUCTION.value,
        ExportPurpose.PARTNERSHIP_PRESENTATION.value,
        ExportPurpose.WEB_OPTIMIZED.value,
        ExportPurpose.DRAFT_REVIEW.value
    ]

    print("Same document, different profiles:\n")
    print(f"{'Profile':<30} {'Resolution':<12} {'Size':<10} {'Purpose'}")
    print("-" * 80)

    for purpose in purposes:
        settings = optimizer.optimize_for_purpose(purpose)
        profile_name = settings['name'].split('(')[0].strip()
        resolution = f"{settings['resolution']} DPI"
        target = settings.get('fileSizeTarget', 'N/A')

        # Note: File size will vary based on actual document
        print(f"{profile_name:<30} {resolution:<12} {target:<10} {purpose}")


def run_all_examples():
    """Run all examples"""
    print("\n" + "="*80)
    print("EXPORT OPTIMIZER - USAGE EXAMPLES")
    print("="*80)

    # Create exports directory
    os.makedirs("exports", exist_ok=True)

    # Run examples
    example_1_basic_export()
    example_2_auto_detection()
    example_3_all_profiles()
    example_4_batch_export()
    example_5_custom_settings()
    example_6_validation_report()
    example_7_print_production()
    example_8_accessibility()
    example_9_web_optimized()
    example_10_list_profiles()
    example_11_profile_info()
    example_12_file_size_comparison()

    print("\n" + "="*80)
    print("ALL EXAMPLES COMPLETED")
    print("="*80 + "\n")


if __name__ == "__main__":
    # Run specific example or all
    import sys

    if len(sys.argv) > 1:
        example_num = sys.argv[1]
        example_func = f"example_{example_num}"

        if example_func in globals():
            globals()[example_func]()
        else:
            print(f"Unknown example: {example_num}")
            print("Available examples: 1-12")
    else:
        run_all_examples()
