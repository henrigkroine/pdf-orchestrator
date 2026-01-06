#!/usr/bin/env python3
"""
Autopilot CLI - Single-Command AI-Powered Document Generation

Transform high-level job specs into world-class partnership documents.

Usage:
    python autopilot.py jobs/aws-tfu-2025.yaml

    python autopilot.py jobs/aws-tfu-2025.yaml --llm anthropic

Features:
    - Parses simple YAML job specifications
    - Plans content using RAG + partner profiles
    - Generates narrative with LLM
    - Runs full world-class pipeline
    - Creates AI-generated executive reports

Requirements:
    - Job spec YAML/JSON file (see jobs/schema.md)
    - Optional: ANTHROPIC_API_KEY environment variable for LLM mode

Output:
    - Pipeline job config (example-jobs/autopilot-{job_id}.json)
    - Content JSON (exports/{job_id}-content.json)
    - PDF outputs (exports/)
    - Executive report (reports/autopilot/{job_id}-EXECUTIVE-REPORT.md)
"""

import sys
import os
import argparse
from pathlib import Path

# Add repo root to path
repo_root = Path(__file__).parent
sys.path.insert(0, str(repo_root))

# Load .env file if it exists
try:
    from dotenv import load_dotenv
    env_path = repo_root / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    # python-dotenv not installed, skip
    pass

from services.autopilot_orchestrator import AutopilotOrchestrator
from services.llm_client import LLMClient


def main():
    """Main CLI entrypoint."""
    parser = argparse.ArgumentParser(
        description="Autopilot: AI-powered document generation from job specs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate document with offline mode (default)
  python autopilot.py jobs/aws-tfu-2025.yaml

  # Generate with LLM-powered content
  export ANTHROPIC_API_KEY=sk-ant-...
  python autopilot.py jobs/aws-tfu-2025.yaml --llm anthropic

  # Minimal demo
  python autopilot.py jobs/aws-tfu-demo.yaml

For more information, see jobs/schema.md
        """
    )

    parser.add_argument(
        "job_spec",
        help="Path to job specification YAML/JSON file"
    )

    parser.add_argument(
        "--llm",
        choices=["anthropic", "none"],
        default=None,  # Will auto-detect based on API key
        help="LLM provider (default: auto-detect based on ANTHROPIC_API_KEY)"
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        default=True,
        help="Print detailed progress (default: True)"
    )

    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress progress messages"
    )

    args = parser.parse_args()

    # Print banner
    if not args.quiet:
        print()
        print("=" * 70)
        print("AUTOPILOT - AI-Powered Document Generation".center(70))
        print("=" * 70)
        print()

    # Validate job spec exists
    job_spec_path = Path(args.job_spec)
    if not job_spec_path.exists():
        print(f"ERROR: Job spec not found: {args.job_spec}")
        print(f"       Create a job spec YAML file (see jobs/schema.md for format)")
        sys.exit(1)

    # Determine LLM provider - FAIL FAST if API key missing
    if args.llm is None:
        # DEFAULT to anthropic (LLM mode required)
        llm_provider = "anthropic"
        if not args.quiet:
            print("[LLM] Provider: anthropic (default - LLM mode required)")

        # FAIL FAST if API key not set
        if not os.environ.get("ANTHROPIC_API_KEY"):
            print()
            print("ERROR: ANTHROPIC_API_KEY environment variable is not set")
            print()
            print("Autopilot requires LLM mode by default. You have two options:")
            print()
            print("  1. Set your Anthropic API key:")
            print("     set ANTHROPIC_API_KEY=sk-ant-your-key-here")
            print()
            print("  2. OR explicitly request offline mode:")
            print("     python autopilot.py jobs/aws-tfu-2025.yaml --llm none")
            print()
            print("Offline mode uses deterministic templates instead of AI-generated content.")
            print()
            sys.exit(1)
    else:
        # User explicitly specified --llm flag
        llm_provider = args.llm
        if not args.quiet:
            print(f"[LLM] Provider: {llm_provider} (explicitly set via --llm flag)")

        # If user explicitly requested anthropic, require API key
        if llm_provider == "anthropic" and not os.environ.get("ANTHROPIC_API_KEY"):
            print()
            print("ERROR: --llm anthropic specified but ANTHROPIC_API_KEY not set")
            print()
            print("Set your Anthropic API key:")
            print("  set ANTHROPIC_API_KEY=sk-ant-your-key-here")
            print()
            sys.exit(1)

    # Create LLM client (no more silent fallbacks)
    try:
        if llm_provider == "anthropic":
            llm_client = LLMClient(provider="anthropic")
            if not llm_client.is_available():
                print()
                print("ERROR: Anthropic client initialization failed")
                print()
                print("Possible causes:")
                print("  - Invalid API key format")
                print("  - Network connectivity issues")
                print("  - Anthropic SDK not installed (pip install anthropic)")
                print()
                sys.exit(1)
        else:
            # Explicit offline mode
            llm_client = LLMClient(provider="none")

        if not args.quiet:
            info = llm_client.get_provider_info()
            print(f"Model: {info['model']}")
            print(f"Available: {info['available']}")
            if info['available'] and info['provider'] == 'anthropic':
                print("  -> Using LLM for planning, content generation, and analysis")
            else:
                print("  -> Using offline deterministic fallbacks (explicit --llm none)")
            print()

    except Exception as e:
        print()
        print(f"FATAL ERROR: Failed to initialize LLM client: {e}")
        print()
        print("If you want to bypass LLM mode, use:")
        print("  python autopilot.py jobs/aws-tfu-2025.yaml --llm none")
        print()
        sys.exit(1)

    # Run autopilot
    try:
        orchestrator = AutopilotOrchestrator(
            repo_root=str(repo_root),
            llm_client=llm_client,
            verbose=(not args.quiet and args.verbose)
        )

        result = orchestrator.run(str(job_spec_path))

        # Success
        if not args.quiet:
            print()
            print("=" * 70)
            print("AUTOPILOT COMPLETE".center(70))
            print("=" * 70)
            print()
            print(f"Job ID: {result['job_id']}")
            print()
            print("Outputs:")
            print(f"  Job Config : {result['job_config_path']}")
            print(f"  Content    : {result['content_path']}")
            for pdf in result.get('pdf_paths', []):
                print(f"  PDF        : {pdf}")
            print(f"  Report     : {result['executive_report_path']}")
            print()
            print("Next steps:")
            print(f"  1. Review executive report: {result['executive_report_path']}")
            print(f"  2. Check PDF outputs in exports/")
            print(f"  3. Share with stakeholders")
            print()

        sys.exit(0)

    except FileNotFoundError as e:
        print(f"\nERROR: {e}")
        print(f"       Check that all required files exist")
        sys.exit(1)

    except ValueError as e:
        print(f"\nValidation Error: {e}")
        print(f"                  Check job spec format (see jobs/schema.md)")
        sys.exit(1)

    except Exception as e:
        print(f"\nUnexpected Error: {e}")
        import traceback
        if args.verbose:
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
