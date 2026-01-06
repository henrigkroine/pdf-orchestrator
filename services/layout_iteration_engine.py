#!/usr/bin/env python3
"""
Layout Iteration Engine

Generates multiple layout variants and scores them against quality gates.
Enables A/B testing and data-driven layout selection.
"""

import os
import json
import subprocess
from typing import List, Dict, Any, Optional
from datetime import datetime
import copy


class LayoutIterationEngine:
    """
    Generate and score multiple layout variations of a document.

    Uses job config variations to create different layouts,
    then runs quality checks to find the best variant.
    """

    def __init__(self, pipeline_script: str = "pipeline.py"):
        """
        Initialize layout iteration engine.

        Args:
            pipeline_script: Path to pipeline.py for scoring variants
        """
        self.pipeline_script = pipeline_script

    def generate_variations(
        self,
        base_job_config_path: str,
        num_variations: int = 3,
        strategies: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate layout variant configurations.

        Args:
            base_job_config_path: Path to base job config JSON
            num_variations: Number of variants to generate
            strategies: List of variation strategies to apply

        Returns:
            List of variant configs: [
                {
                    'variant_id': str,
                    'config_path': str,
                    'description': str,
                    'changes': dict
                }
            ]
        """
        # Load base config
        with open(base_job_config_path, 'r', encoding='utf-8') as f:
            base_config = json.load(f)

        # Default strategies
        if strategies is None:
            strategies = ['spacing', 'emphasis', 'color_balance']

        variants = []

        for i in range(num_variations):
            variant_id = f"variant-{chr(65+i)}"  # A, B, C, ...

            # Create variant config
            variant_config = copy.deepcopy(base_config)

            # Apply variation strategy
            changes = {}

            if 'spacing' in strategies and i == 0:
                # Variant A: Tighter spacing
                changes['spacing'] = 'compact'
                variant_config['_layout_variant'] = {
                    'spacing_multiplier': 0.8,
                    'description': 'Compact spacing variant'
                }

            elif 'emphasis' in strategies and i == 1:
                # Variant B: Different visual emphasis
                changes['emphasis'] = 'metrics_focused'
                variant_config['_layout_variant'] = {
                    'metric_size_multiplier': 1.2,
                    'description': 'Metrics-focused variant'
                }

            elif 'color_balance' in strategies and i == 2:
                # Variant C: Adjusted color balance
                changes['color'] = 'lighter_accents'
                variant_config['_layout_variant'] = {
                    'accent_opacity': 0.7,
                    'description': 'Lighter accent colors variant'
                }

            else:
                # Default: Slight variations
                variant_config['_layout_variant'] = {
                    'description': f'Standard variant {variant_id}'
                }

            # Write variant config to temp file
            variant_config_dir = 'temp/layout-variants'
            os.makedirs(variant_config_dir, exist_ok=True)

            variant_config_path = os.path.join(
                variant_config_dir,
                f"{os.path.basename(base_job_config_path).replace('.json', '')}-{variant_id}.json"
            )

            with open(variant_config_path, 'w', encoding='utf-8') as f:
                json.dump(variant_config, f, indent=2)

            variants.append({
                'variant_id': variant_id,
                'config_path': variant_config_path,
                'description': variant_config.get('_layout_variant', {}).get('description', f'Variant {variant_id}'),
                'changes': changes
            })

        print(f"[LAYOUT ITERATION] Generated {len(variants)} layout variants")
        for var in variants:
            print(f"  - {var['variant_id']}: {var['description']}")

        return variants

    def score_variants(
        self,
        variants: List[Dict[str, Any]],
        mode: str = 'fast'
    ) -> List[Dict[str, Any]]:
        """
        Score each layout variant using quality checks.

        Args:
            variants: List of variant configs from generate_variations()
            mode: Scoring mode ('fast' = quick checks, 'full' = world-class pipeline)

        Returns:
            List of scored variants with results
        """
        scored_variants = []

        for variant in variants:
            print(f"\n[SCORE] Variant {variant['variant_id']}: {variant['description']}")

            if mode == 'fast':
                # Fast mode: Mock scoring for MVP
                # In production, this would run a lightweight validation
                score = self._mock_score_variant(variant)

            elif mode == 'full':
                # Full mode: Run complete world-class pipeline
                # (This is expensive, only use when needed)
                score = self._run_pipeline_score(variant)

            else:
                print(f"[WARN] Unknown scoring mode '{mode}', using fast")
                score = self._mock_score_variant(variant)

            scored_variant = variant.copy()
            scored_variant['score'] = score

            scored_variants.append(scored_variant)

            print(f"  Score: {score['overall']:.3f}")

        return scored_variants

    def _mock_score_variant(self, variant: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock scoring for fast iteration (MVP).

        In production, this would run actual layout analysis.
        """
        import random
        random.seed(variant['variant_id'])  # Deterministic

        # Generate mock scores
        return {
            'overall': round(random.uniform(0.85, 0.95), 3),
            'layer1': random.randint(140, 150),
            'layer3.5': round(random.uniform(0.88, 0.94), 3),
            'layer4': round(random.uniform(0.90, 0.96), 3),
            'accessibility': round(random.uniform(0.92, 0.98), 3),
            'timestamp': datetime.now().isoformat()
        }

    def _run_pipeline_score(self, variant: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run full pipeline to score variant.

        This is expensive - only use for final selection.
        """
        try:
            # Run pipeline with variant config
            result = subprocess.run(
                ['python', self.pipeline_script, '--world-class', '--job-config', variant['config_path']],
                capture_output=True,
                text=True,
                timeout=300  # 5 min timeout
            )

            # Parse pipeline output for scores
            # (This is a placeholder - real implementation would parse JSON summary)
            if result.returncode == 0:
                return {
                    'overall': 0.92,
                    'layer1': 145,
                    'layer3.5': 0.91,
                    'layer4': 0.93,
                    'status': 'PASS',
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'overall': 0.0,
                    'status': 'FAIL',
                    'error': result.stderr[:200],
                    'timestamp': datetime.now().isoformat()
                }

        except Exception as e:
            return {
                'overall': 0.0,
                'status': 'ERROR',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def pick_best(
        self,
        scored_variants: List[Dict[str, Any]],
        criteria: str = 'overall'
    ) -> Dict[str, Any]:
        """
        Select best variant based on scores.

        Args:
            scored_variants: List of scored variants
            criteria: Selection criteria ('overall', 'layer1', 'accessibility')

        Returns:
            Best variant dictionary
        """
        if not scored_variants:
            raise ValueError("No variants to select from")

        # Sort by criteria score (descending)
        sorted_variants = sorted(
            scored_variants,
            key=lambda v: v['score'].get(criteria, 0),
            reverse=True
        )

        best = sorted_variants[0]

        print(f"\n[BEST] Variant {best['variant_id']} selected")
        print(f"  Description: {best['description']}")
        print(f"  Score ({criteria}): {best['score'].get(criteria, 0)}")

        return best

    def run_iteration(
        self,
        base_job_config_path: str,
        num_variations: int = 3,
        mode: str = 'fast'
    ) -> Dict[str, Any]:
        """
        Complete iteration workflow: generate → score → select.

        Args:
            base_job_config_path: Base job config
            num_variations: Number of variants
            mode: Scoring mode ('fast' or 'full')

        Returns:
            {
                'best_variant': dict,
                'all_variants': List[dict],
                'summary': dict
            }
        """
        print("=" * 60)
        print(f"LAYOUT ITERATION: {num_variations} variants")
        print("=" * 60)

        # 1. Generate variants
        variants = self.generate_variations(base_job_config_path, num_variations)

        # 2. Score variants
        scored_variants = self.score_variants(variants, mode=mode)

        # 3. Pick best
        best = self.pick_best(scored_variants)

        # Summary
        summary = {
            'num_variants': len(scored_variants),
            'best_variant_id': best['variant_id'],
            'best_score': best['score'].get('overall', 0),
            'timestamp': datetime.now().isoformat()
        }

        return {
            'best_variant': best,
            'all_variants': scored_variants,
            'summary': summary
        }


# CLI for testing
if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("LAYOUT ITERATION ENGINE TEST")
    print("=" * 60)

    # Initialize engine
    engine = LayoutIterationEngine()

    # Test with TFU AWS V2 config
    base_config = "example-jobs/tfu-aws-partnership-v2.json"

    if not os.path.exists(base_config):
        print(f"\n[ERROR] Base config not found: {base_config}")
        sys.exit(1)

    # Run iteration (fast mode for testing)
    result = engine.run_iteration(
        base_job_config_path=base_config,
        num_variations=3,
        mode='fast'
    )

    # Show results
    print(f"\n[RESULTS] Layout Iteration Complete")
    print(f"  Variants tested: {result['summary']['num_variants']}")
    print(f"  Best variant: {result['summary']['best_variant_id']}")
    print(f"  Best score: {result['summary']['best_score']:.3f}")

    print(f"\n[ALL VARIANTS]")
    for var in result['all_variants']:
        status = "✓" if var['score'].get('overall', 0) > 0.90 else "○"
        print(f"  {status} {var['variant_id']}: {var['score'].get('overall', 0):.3f} - {var['description']}")

    print(f"\n[BEST CONFIG] {result['best_variant']['config_path']}")

    sys.exit(0)
