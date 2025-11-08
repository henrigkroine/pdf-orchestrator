"""
InDesign Integration Example

Demonstrates how to use Typography Automation with Adobe InDesign via MCP.
This example shows the complete workflow from element extraction to style application.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from typography_automation import TypographyAutomation
import json


def extract_text_elements_from_indesign():
    """
    Extract text elements from InDesign document
    (In real usage, this would use the MCP connection)
    """
    # Mock data - in real usage, extract from InDesign via MCP
    elements = [
        {
            'id': 'text-frame-1',
            'type': 'title',
            'content': 'TEEI AWS Partnership',
            'frameWidth': 500,
            'frameHeight': 100,
            'currentFont': 'Arial',
            'currentSize': 36,
            'x': 40,
            'y': 700,
            'page': 1
        },
        {
            'id': 'text-frame-2',
            'type': 'h2',
            'content': 'Together for Ukraine Program',
            'frameWidth': 500,
            'frameHeight': 80,
            'currentFont': 'Arial',
            'currentSize': 24,
            'x': 40,
            'y': 600,
            'page': 1
        },
        {
            'id': 'text-frame-3',
            'type': 'body',
            'content': 'Through AWS cloud education, we empower displaced students with critical technical skills for careers in cloud computing, data analytics, and software development. Our comprehensive curriculum combines hands-on training with mentorship and career support.',
            'frameWidth': 450,
            'frameHeight': 300,
            'currentFont': 'Arial',
            'currentSize': 12,
            'x': 40,
            'y': 500,
            'page': 1
        }
    ]

    return elements


def apply_to_indesign_frame(frame_id, typography_spec, mcp_connection=None):
    """
    Apply typography specification to InDesign text frame
    (In real usage, this would use the MCP connection)
    """
    if mcp_connection:
        # Real MCP implementation would be here
        pass
    else:
        # Mock implementation for demonstration
        print(f"\n  Applying to frame: {frame_id}")
        print(f"    Font: {typography_spec['font']} {typography_spec['weight']}")
        print(f"    Size: {typography_spec['fontSize']}pt")
        print(f"    Leading: {typography_spec['fontSize'] * typography_spec['lineHeight']:.1f}pt")
        print(f"    Tracking: {typography_spec['tracking'] * 1000:.0f}")
        print(f"    Color: {typography_spec['color']}")
        print(f"    Alignment: {typography_spec['alignment']}")


def create_indesign_paragraph_styles(styles, doc=None):
    """
    Create InDesign paragraph styles from typography system
    """
    if doc:
        # Real InDesign document manipulation
        pass
    else:
        # Mock implementation
        print("\n📋 Creating InDesign Paragraph Styles:")
        for style in styles:
            print(f"\n  Style: {style['name']}")
            print(f"    Font: {style['fontFamily']} {style['fontStyle']}")
            print(f"    Size: {style['pointSize']}pt")
            print(f"    Leading: {style['leading']}pt")
            print(f"    Tracking: {style['tracking']}")
            print(f"    Spacing: {style['spaceBefore']}pt before, {style['spaceAfter']}pt after")


def main():
    print('🎨 InDesign Integration Example\n')
    print('=' * 60)

    # Step 1: Extract text elements from InDesign
    print('\n1. Extracting text elements from InDesign document...')
    elements = extract_text_elements_from_indesign()
    print(f'   Found {len(elements)} text frames')

    # Step 2: Initialize typography automation
    print('\n2. Initializing typography automation...')
    automation = TypographyAutomation({
        'preventCutoffs': True,
        'cutoffThreshold': 0.95,
        'maxFontSizeReduction': 6
    })
    print('   ✅ Automation ready')

    # Step 3: Apply automatic typography
    print('\n3. Applying automatic typography...')
    result = automation.apply_automatic_typography(elements)
    print(f'   ✅ Processed {result["stats"]["elementsProcessed"]} elements')
    print(f'   ✅ Prevented {result["stats"]["cutoffsPrevented"]} cutoffs')
    print(f'   ✅ Optimized {result["stats"]["sizesOptimized"]} sizes')

    # Step 4: Apply to InDesign frames
    print('\n4. Applying optimized typography to InDesign frames...')
    for element in result['elements']:
        frame_id = element['original'].get('id', 'unknown')
        optimized = element['optimized']

        apply_to_indesign_frame(frame_id, optimized)

    # Step 5: Create paragraph styles
    print('\n5. Creating InDesign paragraph styles...')
    styles = automation.export_indesign_styles()
    create_indesign_paragraph_styles(styles)

    # Step 6: Export results
    print('\n6. Exporting results...')
    output_dir = os.path.dirname(__file__)

    # Export full result
    result_path = os.path.join(output_dir, 'indesign-integration-result.json')
    with open(result_path, 'w') as f:
        json.dump(result, f, indent=2)
    print(f'   ✅ Result: {result_path}')

    # Export styles
    styles_path = os.path.join(output_dir, 'indesign-paragraph-styles.json')
    with open(styles_path, 'w') as f:
        json.dump(styles, f, indent=2)
    print(f'   ✅ Styles: {styles_path}')

    # Export typography system
    system_path = os.path.join(output_dir, 'typography-system.json')
    automation.export_to_json(system_path)
    print(f'   ✅ System: {system_path}')

    # Step 7: Summary
    print('\n' + '=' * 60)
    print('📊 Summary:')
    print(f'  Total Elements: {result["summary"]["totalElements"]}')
    print(f'  Average Confidence: {result["summary"]["averageConfidence"]}%')
    print(f'\n  Hierarchy Distribution:')
    for level, count in result['summary']['hierarchyDistribution'].items():
        print(f'    {level}: {count}')

    print('\n' + '=' * 60)
    print('✅ InDesign integration example complete!')
    print('\nNext steps:')
    print('  1. Connect to actual InDesign document via MCP')
    print('  2. Extract real text frames with properties')
    print('  3. Apply optimized typography to frames')
    print('  4. Import paragraph styles into InDesign')


if __name__ == '__main__':
    main()
