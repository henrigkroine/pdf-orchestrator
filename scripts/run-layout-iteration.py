#!/usr/bin/env python3
"""
Layout Iteration CLI

Standalone tool for running layout iteration experiments.
Tests multiple layout variants and selects the best one.

Usage:
    python scripts/run-layout-iteration.py <job_config_path> [options]

Examples:
    # Basic usage (3 variants, fast scoring)
    python scripts/run-layout-iteration.py example-jobs/tfu-aws-partnership-v2.json

    # 5 variants with full pipeline scoring
    python scripts/run-layout-iteration.py example-jobs/tfu-aws-partnership-v2.json --variants 5 --mode full

    # Export best variant config
    python scripts/run-layout-iteration.py example-jobs/tfu-aws-partnership-v2.json --export
"""

import os
import sys
import argparse
import json
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.layout_iteration_engine import LayoutIterationEngine


def print_banner():
    """Print CLI banner"""
    print("=" * 70)
    print("LAYOUT ITERATION ENGINE - CLI")
    print("=" * 70)
    print()


def print_results_table(all_variants):
    """Print variants in a formatted table"""
    print("\n" + "=" * 70)
    print("VARIANT COMPARISON")
    print("=" * 70)
    print()
    print(f"{'Variant':<12} {'Score':<10} {'Status':<10} {'Description':<35}")
    print("-" * 70)

    for var in all_variants:
        variant_id = var['variant_id']
        score = var['score'].get('overall', 0)
        status_icon = "✓" if score > 0.90 else "○"
        description = var['description'][:35]

        print(f"{variant_id:<12} {score:<10.3f} {status_icon:<10} {description:<35}")

    print()


def export_best_variant(best_variant, output_path):
    """Export best variant config to file"""
    export_data = {
        'variant_id': best_variant['variant_id'],
        'description': best_variant['description'],
        'score': best_variant['score'],
        'config_path': best_variant['config_path'],
        'changes': best_variant['changes'],
        'exported_at': datetime.now().isoformat()
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2)

    print(f"[EXPORT] Best variant details saved to: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description='Run layout iteration experiments on PDF job configs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )

    parser.add_argument(
        'job_config',
        help='Path to base job config JSON file'
    )

    parser.add_argument(
        '--variants', '-n',
        type=int,
        default=3,
        help='Number of layout variants to generate (default: 3)'
    )

    parser.add_argument(
        '--mode', '-m',
        choices=['fast', 'full'],
        default='fast',
        help='Scoring mode: fast (mock scores) or full (run pipeline) (default: fast)'
    )

    parser.add_argument(
        '--strategies', '-s',
        nargs='+',
        default=['spacing', 'emphasis', 'color_balance'],
        help='Variation strategies to apply (default: spacing emphasis color_balance)'
    )

    parser.add_argument(
        '--export', '-e',
        action='store_true',
        help='Export best variant details to JSON'
    )

    parser.add_argument(
        '--export-path',
        default='temp/best-variant.json',
        help='Export file path (default: temp/best-variant.json)'
    )

    args = parser.parse_args()

    # Validate job config exists
    if not os.path.exists(args.job_config):
        print(f"[ERROR] Job config not found: {args.job_config}")
        sys.exit(1)

    # Print banner
    print_banner()

    # Initialize engine
    print("[INIT] Initializing Layout Iteration Engine...")
    engine = LayoutIterationEngine()

    # Run iteration
    print(f"\n[RUN] Testing {args.variants} layout variants")
    print(f"      Base config: {args.job_config}")
    print(f"      Scoring mode: {args.mode}")
    print(f"      Strategies: {', '.join(args.strategies)}")
    print()

    try:
        result = engine.run_iteration(
            base_job_config_path=args.job_config,
            num_variations=args.variants,
            mode=args.mode
        )

        # Print results table
        print_results_table(result['all_variants'])

        # Print summary
        best = result['best_variant']
        summary = result['summary']

        print("=" * 70)
        print("BEST VARIANT SELECTED")
        print("=" * 70)
        print(f"  ID: {best['variant_id']}")
        print(f"  Description: {best['description']}")
        print(f"  Score: {best['score'].get('overall', 0):.3f}")
        print(f"  Config: {best['config_path']}")

        if best.get('changes'):
            print(f"  Changes: {best['changes']}")

        print()
        print(f"[OK] Iteration complete - tested {summary['num_variants']} variants")
        print(f"     Best score: {summary['best_score']:.3f}")

        # Export if requested
        if args.export:
            os.makedirs(os.path.dirname(args.export_path), exist_ok=True)
            export_best_variant(best, args.export_path)

        # Exit with success
        sys.exit(0)

    except Exception as e:
        print(f"\n[ERROR] Layout iteration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
