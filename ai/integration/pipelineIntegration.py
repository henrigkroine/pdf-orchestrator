#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline Integration for Tier 3 AI Features

This module provides integration points for RAG, Image Generation,
and Accessibility features into the main pipeline.

Layers:
  - Layer 0: RAG Content Retrieval + Image Generation (Pre-Generation)
  - Layer 5: Accessibility Validation & Remediation (Post-Gemini)

Usage:
  from ai.integration.pipelineIntegration import run_layer_0, run_layer_5

  # Before document generation
  rag_results = run_layer_0(job_config)

  # After Layer 4 (Gemini Vision)
  accessibility_results = run_layer_5(pdf_path, job_config)
"""

import os
import sys
import json
import subprocess
from pathlib import Path

class Layer0Integration:
    """
    Layer 0: Planning & Asset Preparation
    - RAG content retrieval
    - Image generation
    """

    @staticmethod
    def run(job_config_path):
        """
        Execute Layer 0: RAG + Image Generation

        Returns:
            dict: Results from RAG and image generation
        """
        print("\n[Layer 0] PLANNING & ASSET PREPARATION")
        print("=" * 60)

        # Load job config
        with open(job_config_path, 'r', encoding='utf-8') as f:
            job_config = json.load(f)

        results = {
            "rag": None,
            "imageGeneration": None,
            "success": True,
            "errors": []
        }

        # Step 1: RAG Content Retrieval
        if job_config.get('planning', {}).get('rag', {}).get('enabled', False):
            rag_result = Layer0Integration.run_rag(job_config)
            results["rag"] = rag_result

            if not rag_result["success"]:
                results["success"] = False
                results["errors"].append("RAG retrieval failed")
        else:
            print("[Layer 0] RAG: SKIPPED (disabled)")

        # Step 2: Image Generation
        if job_config.get('generation', {}).get('imageGeneration', {}).get('enabled', False):
            image_result = Layer0Integration.run_image_generation(job_config_path)
            results["imageGeneration"] = image_result

            if not image_result["success"]:
                results["success"] = False
                results["errors"].append("Image generation failed")
        else:
            print("[Layer 0] Image Generation: SKIPPED (disabled)")

        return results

    @staticmethod
    def run_rag(job_config):
        """
        Execute RAG content retrieval
        """
        print("\n[RAG] Retrieving relevant content from past documents...")

        partner = job_config.get('data', {}).get('partner', 'Unknown')
        industry = job_config.get('data', {}).get('industry', 'technology')
        doc_type = job_config.get('template', 'partnership')

        # Build query
        query = f"{industry} {doc_type} {partner}"

        # Run RAG orchestrator
        rag_script = os.path.join(
            os.path.dirname(__file__), '..', 'rag', 'ragOrchestrator.js'
        )

        try:
            result = subprocess.run(
                ['node', rag_script, '--suggest', industry, doc_type],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0:
                print("[RAG] ✓ Content retrieval successful")
                # Parse suggestions from output
                suggestions = Layer0Integration.parse_rag_output(result.stdout)

                return {
                    "success": True,
                    "query": query,
                    "suggestions": suggestions,
                    "durationMs": 0  # Parse from output if available
                }
            else:
                print(f"[RAG] ⚠️ Retrieval failed: {result.stderr}")
                return {
                    "success": False,
                    "error": result.stderr,
                    "suggestions": []
                }

        except subprocess.TimeoutExpired:
            print("[RAG] ⚠️ Retrieval timed out")
            return {
                "success": False,
                "error": "Timeout",
                "suggestions": []
            }
        except Exception as e:
            print(f"[RAG] ⚠️ Error: {e}")
            return {
                "success": False,
                "error": str(e),
                "suggestions": []
            }

    @staticmethod
    def parse_rag_output(output):
        """
        Parse RAG suggestions from CLI output
        """
        # Simple parser - In production, use structured JSON output
        suggestions = []

        if "HEADLINE:" in output:
            # Extract headline suggestions
            pass

        if "CTA:" in output:
            # Extract CTA suggestions
            pass

        return suggestions

    @staticmethod
    def run_image_generation(job_config_path):
        """
        Execute image generation
        """
        print("\n[ImageGen] Generating brand-compliant images...")

        image_script = os.path.join(
            os.path.dirname(__file__), '..', 'image-gen', 'imageGenerator.js'
        )

        try:
            result = subprocess.run(
                ['node', image_script, '--generate', job_config_path],
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode == 0:
                print("[ImageGen] ✓ Images generated successfully")

                # Parse results from output
                image_data = Layer0Integration.parse_image_output(result.stdout)

                return {
                    "success": True,
                    "images": image_data.get("images", {}),
                    "cacheHitRate": image_data.get("cacheHitRate", "0%"),
                    "costUSD": image_data.get("estimatedCostUSD", "0.00")
                }
            else:
                print(f"[ImageGen] ⚠️ Generation failed: {result.stderr}")
                return {
                    "success": False,
                    "error": result.stderr
                }

        except subprocess.TimeoutExpired:
            print("[ImageGen] ⚠️ Generation timed out")
            return {
                "success": False,
                "error": "Timeout"
            }
        except Exception as e:
            print(f"[ImageGen] ⚠️ Error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def parse_image_output(output):
        """
        Parse image generation results from output
        """
        # Simple parser - look for JSON in output
        import re

        json_match = re.search(r'\{[\s\S]*\}', output)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except:
                pass

        return {}


class Layer5Integration:
    """
    Layer 5: Accessibility Validation & Remediation
    """

    @staticmethod
    def run(pdf_path, job_config_path):
        """
        Execute Layer 5: Accessibility validation and remediation

        Returns:
            dict: Accessibility validation results
        """
        print("\n[Layer 5] ACCESSIBILITY VALIDATION & REMEDIATION")
        print("=" * 60)

        # Load job config
        with open(job_config_path, 'r', encoding='utf-8') as f:
            job_config = json.load(f)

        accessibility_config = job_config.get('validation', {}).get('accessibility', {})

        if not accessibility_config.get('enabled', False):
            print("[Layer 5] Accessibility: SKIPPED (disabled)")
            return {
                "enabled": False,
                "success": True,
                "message": "Accessibility validation disabled"
            }

        # Run accessibility validator
        print(f"[Accessibility] Validating: {pdf_path}")

        accessibility_script = os.path.join(
            os.path.dirname(__file__), '..', 'accessibility', 'accessibilityRemediator.js'
        )

        auto_fix = accessibility_config.get('autoRemediation', {}).get('enabled', False)
        output_dir = accessibility_config.get('reportDir', 'reports/accessibility')

        # Build command
        cmd = ['node', accessibility_script, '--pdf', pdf_path]
        if auto_fix:
            cmd.append('--auto-fix')

        # Set output path
        output_filename = f"accessibility-{Path(pdf_path).stem}-{int(os.time.time())}.json"
        output_path = os.path.join(output_dir, output_filename)
        cmd.extend(['--output', output_path])

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes max
            )

            # Exit codes: 0 = pass, 1 = fail, 3 = infrastructure error
            if result.returncode == 0:
                print("[Accessibility] ✓ PASS - Document meets accessibility standards")
                print(f"[Accessibility] Report: {output_path}")

                return {
                    "enabled": True,
                    "success": True,
                    "passed": True,
                    "reportPath": output_path,
                    "exitCode": 0
                }

            elif result.returncode == 1:
                print("[Accessibility] ❌ FAIL - Accessibility issues detected")
                print(result.stdout)
                print(f"[Accessibility] Report: {output_path}")

                return {
                    "enabled": True,
                    "success": True,
                    "passed": False,
                    "reportPath": output_path,
                    "exitCode": 1,
                    "message": "Accessibility validation failed"
                }

            else:  # returncode == 3
                print(f"[Accessibility] ⚠️ Infrastructure error (exit code {result.returncode})")
                print(result.stderr)

                return {
                    "enabled": True,
                    "success": False,
                    "passed": False,
                    "exitCode": result.returncode,
                    "error": result.stderr,
                    "message": "Infrastructure error during validation"
                }

        except subprocess.TimeoutExpired:
            print("[Accessibility] ⚠️ Validation timed out (>5 minutes)")
            return {
                "enabled": True,
                "success": False,
                "passed": False,
                "error": "Timeout",
                "message": "Accessibility validation timed out"
            }

        except Exception as e:
            print(f"[Accessibility] ⚠️ Error: {e}")
            return {
                "enabled": True,
                "success": False,
                "passed": False,
                "error": str(e),
                "message": f"Error during accessibility validation: {str(e)}"
            }


def run_layer_0(job_config_path):
    """
    Run Layer 0: Planning & Asset Preparation

    Args:
        job_config_path (str): Path to job configuration JSON

    Returns:
        dict: Results from Layer 0
    """
    return Layer0Integration.run(job_config_path)


def run_layer_5(pdf_path, job_config_path):
    """
    Run Layer 5: Accessibility Validation & Remediation

    Args:
        pdf_path (str): Path to PDF to validate
        job_config_path (str): Path to job configuration JSON

    Returns:
        dict: Results from Layer 5
    """
    return Layer5Integration.run(pdf_path, job_config_path)


if __name__ == "__main__":
    # CLI for testing
    import argparse

    parser = argparse.ArgumentParser(description="Test Tier 3 Pipeline Integration")
    parser.add_argument("--layer", choices=["0", "5"], required=True, help="Layer to test")
    parser.add_argument("--job-config", required=True, help="Path to job config")
    parser.add_argument("--pdf", help="Path to PDF (required for Layer 5)")

    args = parser.parse_args()

    if args.layer == "0":
        print("Testing Layer 0: Planning & Asset Preparation")
        results = run_layer_0(args.job_config)
        print("\nResults:")
        print(json.dumps(results, indent=2))

    elif args.layer == "5":
        if not args.pdf:
            print("Error: --pdf required for Layer 5")
            sys.exit(1)

        print("Testing Layer 5: Accessibility Validation")
        results = run_layer_5(args.pdf, args.job_config)
        print("\nResults:")
        print(json.dumps(results, indent=2))
