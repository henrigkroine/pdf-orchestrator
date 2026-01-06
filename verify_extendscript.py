#!/usr/bin/env python3
"""
ExtendScript Syntax Verifier
Performs basic syntax checks on .jsx files before execution
"""

import re
import sys
from pathlib import Path

def verify_extendscript(script_path):
    """Verify ExtendScript syntax and structure"""

    if not script_path.exists():
        return False, f"File not found: {script_path}"

    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()

    issues = []
    warnings = []

    # Check 1: Balanced braces
    brace_count = content.count('{') - content.count('}')
    if brace_count != 0:
        issues.append(f"Unbalanced braces: {brace_count} extra {'opening' if brace_count > 0 else 'closing'}")

    # Check 2: Balanced parentheses
    paren_count = content.count('(') - content.count(')')
    if paren_count != 0:
        issues.append(f"Unbalanced parentheses: {paren_count} extra {'opening' if paren_count > 0 else 'closing'}")

    # Check 3: Balanced brackets
    bracket_count = content.count('[') - content.count(']')
    if bracket_count != 0:
        issues.append(f"Unbalanced brackets: {bracket_count} extra {'opening' if bracket_count > 0 else 'closing'}")

    # Check 4: Function declarations
    functions = re.findall(r'function\s+(\w+)\s*\(', content)
    if functions:
        print(f"  Found {len(functions)} function(s): {', '.join(functions)}")

    # Check 5: Main function exists
    if 'function main()' not in content:
        warnings.append("No main() function found")

    # Check 6: Main function is called
    if re.search(r'^main\(\);', content, re.MULTILINE):
        print("  [OK] main() is called")
    else:
        warnings.append("main() function not called")

    # Check 7: InDesign API usage
    indesign_objects = [
        'app.activeDocument',
        'app.documents',
        'app.fonts',
        'page.textFrames',
        'page.rectangles',
        'doc.colors',
        'doc.pages'
    ]

    api_usage = []
    for obj in indesign_objects:
        if obj in content:
            api_usage.append(obj)

    if api_usage:
        print(f"  [OK] Uses InDesign API: {', '.join(api_usage[:3])}...")

    # Check 8: Color definitions
    if 'TEEI_Nordshore' in content and 'TEEI_Gold' in content:
        print("  [OK] TEEI brand colors defined")
    else:
        warnings.append("TEEI brand colors not found")

    # Check 9: Font references
    if 'Lora' in content and 'Roboto Flex' in content:
        print("  [OK] TEEI brand fonts referenced")
    else:
        warnings.append("TEEI brand fonts not found")

    # Check 10: Error handling
    if 'try' in content and 'catch' in content:
        print("  [OK] Has error handling")
    else:
        warnings.append("No error handling (try/catch)")

    # Check 11: Alert messages
    alerts = re.findall(r'alert\(["\']([^"\']+)["\']', content)
    if alerts:
        print(f"  [INFO] Has {len(alerts)} alert(s)")

    return len(issues) == 0, issues, warnings

def main():
    script_path = Path("populate_aws_partnership_content.jsx")

    print("=" * 70)
    print("ExtendScript Syntax Verifier")
    print("=" * 70)
    print(f"\nVerifying: {script_path}")
    print()

    valid, issues, warnings = verify_extendscript(script_path)

    if valid:
        print("\n[SUCCESS] SYNTAX CHECK PASSED")

        if warnings:
            print(f"\n[WARNING] {len(warnings)} warning(s):")
            for w in warnings:
                print(f"  - {w}")
    else:
        print("\n[FAILED] SYNTAX CHECK FAILED")
        print(f"\n{len(issues)} error(s) found:")
        for i in issues:
            print(f"  - {i}")

        if warnings:
            print(f"\n{len(warnings)} warning(s):")
            for w in warnings:
                print(f"  - {w}")

        sys.exit(1)

    print("\n" + "=" * 70)
    print("Script is ready for execution")
    print("=" * 70)
    print("\nNext step: python populate_content.py")
    print()

if __name__ == "__main__":
    main()
