#!/usr/bin/env python3
"""
Performance Intelligence - Analytics and Recommendations

Tracks document performance and provides data-driven recommendations.
Storage: JSONL format for simple append-only logging.
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from collections import defaultdict, Counter


class PerformanceTracker:
    """
    Track document pipeline runs and provide performance analytics.

    Logs stored as JSONL (JSON Lines) in analytics/performance/log.jsonl
    """

    def __init__(self, store_path: str = "analytics/performance/log.jsonl"):
        """
        Initialize performance tracker.

        Args:
            store_path: Path to JSONL log file
        """
        self.store_path = store_path

        # Ensure directory exists
        os.makedirs(os.path.dirname(store_path), exist_ok=True)

        # Load existing logs for analysis
        self.logs = self._load_logs()

    def _load_logs(self) -> List[Dict[str, Any]]:
        """
        Load all logs from JSONL file.

        Returns:
            List of log records
        """
        logs = []

        if not os.path.exists(self.store_path):
            return logs

        try:
            with open(self.store_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        logs.append(json.loads(line))
        except Exception as e:
            print(f"[WARN] Failed to load performance logs: {e}")

        return logs

    def log_run(self, record: Dict[str, Any]) -> None:
        """
        Log one document pipeline run.

        Args:
            record: {
                'job_id': str,
                'partner_id': str,
                'doc_family': str,
                'timestamp': str (ISO),
                'layout_variant': str | None,
                'scores': {
                    'layer0': float,
                    'layer1': float,
                    'layer2': str (PASS/FAIL),
                    'layer3': float,
                    'layer3.5': float,
                    'layer4': float,
                    'layer5': float
                },
                'ai_tier1_score': float,
                'gemini_score': float,
                'accessibility_compliance': float,
                'overall_status': str (PASS/FAIL),
                'metadata': dict  # Optional additional info
            }
        """
        # Add timestamp if not present
        if 'timestamp' not in record:
            record['timestamp'] = datetime.now().isoformat()

        # Append to JSONL file
        try:
            with open(self.store_path, 'a', encoding='utf-8') as f:
                f.write(json.dumps(record) + '\n')

            # Update in-memory logs
            self.logs.append(record)

        except Exception as e:
            print(f"[ERROR] Failed to log performance record: {e}")

    def get_recommendations(self, partner_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze past runs and return recommendations.

        Args:
            partner_id: Optional filter by partner

        Returns:
            {
                'typical_page_counts': List[int],
                'high_scoring_patterns': List[str],
                'common_issues': List[str],
                'avg_scores': dict,
                'num_runs_analyzed': int,
                'confidence': float (0-1)
            }
        """
        # Filter logs
        relevant_logs = self.logs
        if partner_id:
            relevant_logs = [log for log in self.logs if log.get('partner_id') == partner_id]

        if not relevant_logs:
            return {
                'typical_page_counts': [],
                'high_scoring_patterns': [],
                'common_issues': ["No historical data available"],
                'avg_scores': {},
                'num_runs_analyzed': 0,
                'confidence': 0.0
            }

        # Analyze scores
        scores_by_layer = defaultdict(list)
        overall_statuses = []
        layout_variants = []

        for log in relevant_logs:
            if 'scores' in log:
                for layer, score in log['scores'].items():
                    if isinstance(score, (int, float)):
                        scores_by_layer[layer].append(score)

            overall_statuses.append(log.get('overall_status', 'UNKNOWN'))

            if log.get('layout_variant'):
                layout_variants.append(log['layout_variant'])

        # Compute averages
        avg_scores = {}
        for layer, scores in scores_by_layer.items():
            avg_scores[layer] = sum(scores) / len(scores)

        # Identify patterns
        high_scoring_patterns = []
        if layout_variants:
            variant_counter = Counter(layout_variants)
            most_common_variant = variant_counter.most_common(1)[0][0]
            high_scoring_patterns.append(f"Layout variant '{most_common_variant}' used most often")

        # Common issues
        common_issues = []
        fail_count = overall_statuses.count('FAIL')
        if fail_count > len(relevant_logs) * 0.2:  # More than 20% failures
            common_issues.append(f"{fail_count} of {len(relevant_logs)} runs failed quality gates")

        # Check for consistently low scores
        for layer, avg_score in avg_scores.items():
            if avg_score < 0.85:
                common_issues.append(f"{layer} consistently scores low (avg: {avg_score:.2f})")

        # Compute confidence based on sample size
        confidence = min(len(relevant_logs) / 20, 1.0)  # Full confidence at 20+ runs

        return {
            'typical_page_counts': [4],  # TFU AWS standard (can be computed from metadata)
            'high_scoring_patterns': high_scoring_patterns if high_scoring_patterns else ["Insufficient data for pattern analysis"],
            'common_issues': common_issues if common_issues else ["No significant issues detected"],
            'avg_scores': avg_scores,
            'num_runs_analyzed': len(relevant_logs),
            'confidence': confidence
        }

    def get_stats(self) -> Dict[str, Any]:
        """
        Get overall performance statistics.

        Returns:
            {
                'total_runs': int,
                'unique_partners': int,
                'pass_rate': float,
                'avg_layer_scores': dict
            }
        """
        if not self.logs:
            return {
                'total_runs': 0,
                'unique_partners': 0,
                'pass_rate': 0.0,
                'avg_layer_scores': {}
            }

        # Count unique partners
        unique_partners = set(log.get('partner_id') for log in self.logs if log.get('partner_id'))

        # Pass rate
        pass_count = sum(1 for log in self.logs if log.get('overall_status') == 'PASS')
        pass_rate = pass_count / len(self.logs) if self.logs else 0.0

        # Average scores per layer
        scores_by_layer = defaultdict(list)
        for log in self.logs:
            if 'scores' in log:
                for layer, score in log['scores'].items():
                    if isinstance(score, (int, float)):
                        scores_by_layer[layer].append(score)

        avg_layer_scores = {}
        for layer, scores in scores_by_layer.items():
            avg_layer_scores[layer] = sum(scores) / len(scores)

        return {
            'total_runs': len(self.logs),
            'unique_partners': len(unique_partners),
            'pass_rate': pass_rate,
            'avg_layer_scores': avg_layer_scores
        }

    def get_partner_history(self, partner_id: str) -> List[Dict[str, Any]]:
        """
        Get all runs for a specific partner.

        Args:
            partner_id: Partner identifier

        Returns:
            List of log records for this partner
        """
        return [log for log in self.logs if log.get('partner_id') == partner_id]


# CLI for testing
if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("PERFORMANCE TRACKER TEST")
    print("=" * 60)

    # Initialize tracker
    tracker = PerformanceTracker()

    # Get stats
    stats = tracker.get_stats()
    print(f"\n[STATS] Performance Tracker:")
    print(f"  Total runs: {stats['total_runs']}")
    print(f"  Unique partners: {stats['unique_partners']}")
    print(f"  Pass rate: {stats['pass_rate']:.1%}")

    if stats['avg_layer_scores']:
        print(f"\n[SCORES] Average scores per layer:")
        for layer, score in stats['avg_layer_scores'].items():
            print(f"  {layer}: {score:.3f}")

    # Test logging a run
    print("\n[TEST] Logging test run...")
    test_record = {
        'job_id': 'test-001',
        'partner_id': 'aws',
        'doc_family': 'tfu_aws_partnership',
        'timestamp': datetime.now().isoformat(),
        'layout_variant': 'A',
        'scores': {
            'layer0': 0.96,
            'layer1': 145,
            'layer2': 'PASS',
            'layer3': 0.0,
            'layer3.5': 0.92,
            'layer4': 0.94,
            'layer5': 0.97
        },
        'ai_tier1_score': 0.92,
        'gemini_score': 0.94,
        'accessibility_compliance': 0.97,
        'overall_status': 'PASS'
    }

    tracker.log_run(test_record)
    print("  [OK] Test record logged")

    # Get recommendations
    print("\n[RECOMMENDATIONS] For partner 'aws':")
    recs = tracker.get_recommendations('aws')
    print(f"  Confidence: {recs['confidence']:.2%}")
    print(f"  Runs analyzed: {recs['num_runs_analyzed']}")

    if recs['avg_scores']:
        print(f"  Average scores:")
        for layer, score in recs['avg_scores'].items():
            print(f"    {layer}: {score:.3f}")

    print(f"  Patterns: {recs['high_scoring_patterns'][0]}")
    print(f"  Issues: {recs['common_issues'][0]}")

    sys.exit(0)
