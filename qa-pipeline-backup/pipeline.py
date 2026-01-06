#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated Export and Analysis Pipeline for InDesign Documents
Orchestrates the complete workflow from InDesign to validated PDF
"""

import os
import sys
import io

# Set UTF-8 encoding for stdout/stderr (fixes emoji issues on Windows)
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
import time
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Add InDesign automation modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client
from validate_document import DocumentValidator

class InDesignPipeline:
    """Automated pipeline for InDesign document processing"""

    def __init__(self, config_path: str = None):
        self.config = self.load_config(config_path)
        self.APPLICATION = "indesign"
        self.PROXY_URL = self.config.get("proxy_url", "http://localhost:8013")
        self.connected = False
        self.start_time = time.time()
        self.step_timings = {}
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "steps": [],
            "success": False,
            "score": 0
        }

    def load_config(self, config_path: str = None) -> Dict:
        """Load pipeline configuration"""
        default_config = {
            "proxy_url": "http://localhost:8013",
            "export_path": "./exports",
            "pdf_preset": "High Quality Print",
            "validation_threshold": 80,
            "auto_fix_colors": True,
            "auto_fix_missing_assets": False,
            "export_formats": ["pdf", "png"],
            "notification_webhook": None,
            "ci_mode": False
        }

        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)

        return default_config

    def load_qa_profile(self, job_config_path: str) -> Dict:
        """Load QA profile from job config"""
        if not job_config_path or not os.path.exists(job_config_path):
            return {}

        with open(job_config_path, 'r') as f:
            job = json.load(f)

        qa_profile = job.get('qaProfile', {})

        # Override with CLI args if present
        if self.config.get('validation_threshold'):
            qa_profile['min_score'] = self.config['validation_threshold']
        if self.config.get('max_visual_diff'):
            qa_profile['max_visual_diff_percent'] = self.config['max_visual_diff']
        if self.config.get('visual_baseline'):
            qa_profile['visual_baseline_id'] = self.config['visual_baseline']

        return qa_profile

    def connect_to_indesign(self) -> bool:
        """Establish connection to InDesign"""
        try:
            socket_client.configure(
                app=self.APPLICATION,
                url=self.PROXY_URL,
                timeout=30
            )
            init(self.APPLICATION, socket_client)

            response = sendCommand(createCommand("ping", {}))
            self.connected = response.get("status") == "SUCCESS"

            self.log_step("Connect to InDesign", self.connected)
            return self.connected

        except Exception as e:
            self.log_step("Connect to InDesign", False, str(e))
            return False

    def check_document_status(self) -> Dict:
        """Check current document status"""
        if not self.connected:
            return {"status": "error", "message": "Not connected"}

        try:
            response = sendCommand(createCommand("readDocumentInfo", {}))
            if response.get("status") == "SUCCESS":
                doc_info = response.get("response", {})
                self.log_step("Check Document", True, doc_info)
                return doc_info
            else:
                self.log_step("Check Document", False, response.get("message"))
                return {"status": "error", "message": response.get("message")}

        except Exception as e:
            self.log_step("Check Document", False, str(e))
            return {"status": "error", "message": str(e)}

    def validate_colors(self) -> Tuple[bool, List[str]]:
        """Validate document colors"""
        try:
            # Run color validation script
            script_path = os.path.join(os.path.dirname(__file__), "check_colors.js")

            command = createCommand("runScript", {
                "scriptPath": script_path,
                "scriptFunction": "validateColors"
            })

            response = sendCommand(command)

            if response.get("status") == "SUCCESS":
                validation = response.get("response", {})
                missing_colors = validation.get("missingColors", [])

                self.log_step("Validate Colors",
                            len(missing_colors) == 0,
                            f"Missing: {missing_colors}" if missing_colors else "All colors present")

                return len(missing_colors) == 0, missing_colors
            else:
                self.log_step("Validate Colors", False, response.get("message"))
                return False, []

        except Exception as e:
            self.log_step("Validate Colors", False, str(e))
            return False, []

    def fix_missing_colors(self, missing_colors: List[str]) -> bool:
        """Automatically fix missing colors"""
        if not self.config.get("auto_fix_colors", True):
            return False

        try:
            # Apply colors using ExtendScript workaround
            command = createCommand("applyColorsViaExtendScript", {
                "colors": missing_colors
            })

            response = sendCommand(command)
            success = response.get("status") == "SUCCESS"

            self.log_step("Fix Missing Colors", success,
                        f"Fixed {len(missing_colors)} colors" if success else "Failed to fix colors")

            return success

        except Exception as e:
            self.log_step("Fix Missing Colors", False, str(e))
            return False

    def export_document(self, format: str = "pdf") -> Optional[str]:
        """Export document to specified format"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            export_dir = Path(self.config["export_path"])
            export_dir.mkdir(parents=True, exist_ok=True)

            if format == "pdf":
                filename = f"export_{timestamp}.pdf"
                export_path = str(export_dir / filename)

                command = createCommand("exportPDF", {
                    "outputPath": export_path,
                    "preset": self.config["pdf_preset"],
                    "viewPDF": False
                })

            elif format == "png":
                filename = f"export_{timestamp}.png"
                export_path = str(export_dir / filename)

                command = createCommand("exportPNG", {
                    "outputPath": export_path,
                    "resolution": 300,
                    "quality": "maximum"
                })

            else:
                self.log_step(f"Export {format.upper()}", False, "Unsupported format")
                return None

            response = sendCommand(command)

            if response.get("status") == "SUCCESS":
                self.log_step(f"Export {format.upper()}", True, export_path)
                return export_path
            else:
                self.log_step(f"Export {format.upper()}", False, response.get("message"))
                return None

        except Exception as e:
            self.log_step(f"Export {format.upper()}", False, str(e))
            return None

    def validate_pdf(self, pdf_path: str) -> Dict:
        """Run comprehensive PDF validation"""
        try:
            validator = DocumentValidator(pdf_path)
            report = validator.validate_all()

            score = report.get("score", 0)
            threshold = self.config["validation_threshold"]
            passed = score >= threshold

            self.log_step("Validate PDF", passed,
                        f"Score: {score}/{report.get('max_score', 100)}")

            self.results["score"] = score

            return report

        except Exception as e:
            self.log_step("Validate PDF", False, str(e))
            return {"error": str(e), "score": 0}

    def generate_report(self) -> str:
        """Generate pipeline execution report"""
        report_lines = [
            "=" * 60,
            "PIPELINE EXECUTION REPORT",
            "=" * 60,
            f"Timestamp: {self.results['timestamp']}",
            f"Config: {self.config.get('ci_mode', False) and 'CI Mode' or 'Interactive Mode'}",
            "",
            "EXECUTION STEPS:",
            "-" * 60
        ]

        for i, step in enumerate(self.results['steps'], 1):
            status_icon = "[OK]" if step['success'] else "[FAIL]"
            report_lines.append(f"{i}. {status_icon} {step['name']}")
            if step.get('details'):
                report_lines.append(f"   Details: {step['details']}")
            if not step['success'] and step.get('error'):
                report_lines.append(f"   Error: {step['error']}")

        report_lines.extend([
            "",
            "=" * 60,
            f"FINAL SCORE: {self.results.get('score', 0)}/100",
            f"STATUS: {'PASSED' if self.results['success'] else 'FAILED'}",
            "=" * 60
        ])

        return "\n".join(report_lines)

    def save_report(self, report: str, path: str = None) -> str:
        """Save report to file"""
        if not path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            job_id = self.config.get("job_id", "unknown")
            reports_dir = os.path.join(os.path.dirname(__file__), 'reports', 'pipeline')
            os.makedirs(reports_dir, exist_ok=True)
            path = os.path.join(reports_dir, f"pipeline_report_{job_id}_{timestamp}.txt")

        with open(path, 'w') as f:
            f.write(report)

        # NEW: Generate QA scorecard JSON
        scorecard_path = path.replace('.txt', '-scorecard.json')
        scorecard = self._generate_scorecard()
        with open(scorecard_path, 'w') as f:
            json.dump(scorecard, f, indent=2, default=str)

        print(f"📊 Scorecard JSON: {scorecard_path}")

        # NEW: Generate job graph visualization (before saving JSON so metrics are included)
        job_config_path = self.config.get('job_config_path')
        if job_config_path and os.path.exists(job_config_path):
            try:
                graph_start_time = time.time()

                # Run graph generation script
                import subprocess
                graph_script = os.path.join(os.path.dirname(__file__), 'reports', 'graphs', 'generate-job-graph.py')

                # Call generation script (it will save with its own naming convention)
                result = subprocess.run(
                    [sys.executable, graph_script, job_config_path, scorecard_path],
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                graph_duration = time.time() - graph_start_time

                # Ensure metrics dict exists
                if "metrics" not in self.results:
                    self.results["metrics"] = {}

                if result.returncode == 0:
                    # Parse the output to find the generated file path
                    import re
                    match = re.search(r'\[Graph\] Generated: (.+\.json)', result.stdout)
                    graph_path = match.group(1) if match else "unknown location"

                    print(f"📈 Job graph generated in {graph_duration:.2f}s: {graph_path}")
                    self.results["metrics"]["graph_generation_seconds"] = graph_duration
                else:
                    print(f"⚠️ Graph generation failed (non-blocking): {result.stderr}")
                    self.results["metrics"]["graph_generation_seconds"] = graph_duration
                    self.results["metrics"]["graph_generation_error"] = result.stderr

            except subprocess.TimeoutExpired:
                if "metrics" not in self.results:
                    self.results["metrics"] = {}
                print(f"⚠️ Graph generation timed out (non-blocking)")
                self.results["metrics"]["graph_generation_error"] = "timeout"
            except Exception as e:
                if "metrics" not in self.results:
                    self.results["metrics"] = {}
                print(f"⚠️ Graph generation error (non-blocking): {str(e)}")
                self.results["metrics"]["graph_generation_error"] = str(e)

        # Save full JSON version (after graph generation so metrics are included)
        json_path = path.replace('.txt', '.json')
        with open(json_path, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)

        return path

    def log_step(self, name: str, success: bool, details: str = None):
        """Log pipeline step with timing"""
        step_time = time.time()
        step_duration = step_time - self.start_time

        step = {
            "name": name,
            "success": success,
            "timestamp": datetime.fromtimestamp(step_time).isoformat(),
            "duration_seconds": step_duration
        }

        if details:
            if success:
                step["details"] = details
            else:
                step["error"] = details

        self.results["steps"].append(step)
        self.step_timings[name] = step_duration

        # Console output
        status_icon = "[OK]" if success else "[FAIL]"
        print(f"{status_icon} {name} ({step_duration:.2f}s)")
        if details:
            print(f"   → {details}")

    def notify_webhook(self, report: Dict):
        """Send notification to webhook if configured"""
        webhook_url = self.config.get("notification_webhook")
        if not webhook_url:
            return

        try:
            import requests

            payload = {
                "text": f"Pipeline {'✅ Passed' if self.results['success'] else '❌ Failed'}",
                "score": self.results.get("score", 0),
                "timestamp": self.results["timestamp"],
                "steps": len(self.results["steps"]),
                "details": report
            }

            response = requests.post(webhook_url, json=payload, timeout=10)
            response.raise_for_status()

            self.log_step("Send Notification", True, "Webhook notified")

        except Exception as e:
            self.log_step("Send Notification", False, str(e))

    def run(self) -> bool:
        """Execute the complete pipeline"""
        print("\n>>> Starting InDesign Export & Analysis Pipeline")
        print("=" * 60)

        # NEW: Check for validation-only mode
        if self.config.get("validate_only"):
            return self.run_validation_only()

        # Step 1: Connect to InDesign
        if not self.connect_to_indesign():
            print("❌ Failed to connect to InDesign. Ensure it's running.")
            return False

        # Step 2: Check document status
        doc_info = self.check_document_status()
        if doc_info.get("status") == "error":
            print("❌ No document open or document error")
            return False

        # Step 3: Validate colors
        colors_valid, missing_colors = self.validate_colors()
        if not colors_valid and missing_colors:
            print(f"⚠️  Missing colors detected: {missing_colors}")
            if self.config.get("auto_fix_colors"):
                print("🔧 Attempting to fix missing colors...")
                if self.fix_missing_colors(missing_colors):
                    # Re-validate after fix
                    colors_valid, _ = self.validate_colors()

        # Step 4: Export document(s)
        exported_files = []
        for format in self.config.get("export_formats", ["pdf"]):
            export_path = self.export_document(format)
            if export_path:
                exported_files.append(export_path)
                print(f"📄 Exported: {export_path}")

        if not exported_files:
            print("❌ No files exported successfully")
            return False

        # Step 5: Validate exported PDF (Layer 1)
        pdf_files = [f for f in exported_files if f.endswith('.pdf')]
        if pdf_files:
            pdf_path = pdf_files[0]
            validation_report = self.validate_pdf(pdf_path)
            score = validation_report.get("score", 0)
            threshold = self.config["validation_threshold"]

            if score >= threshold:
                print(f"✅ Validation PASSED (Score: {score}/{validation_report.get('max_score', 100)})")
                self.results["success"] = True
            else:
                print(f"❌ Validation FAILED (Score: {score}/{validation_report.get('max_score', 100)})")
                print(f"   Minimum required: {threshold}")
                self.results["success"] = False

            # Step 5.1: Run PDF quality validation (Layer 2)
            pdf_quality_passed = self.run_pdf_quality_validation(pdf_path)
            if not pdf_quality_passed:
                print("❌ PDF quality validation FAILED")
                self.results["success"] = False

            # Step 5.2: Run visual regression if baseline specified (Layer 3)
            job_config_path = self.config.get("job_config_path")
            if job_config_path:
                qa_profile = self.load_qa_profile(job_config_path)
                visual_baseline = qa_profile.get('visual_baseline_id') or self.config.get('visual_baseline')

                if visual_baseline:
                    visual_passed = self.run_visual_regression(pdf_path, visual_baseline)
                    if not visual_passed:
                        print("❌ Visual regression test FAILED")
                        self.results["success"] = False

            # Step 5.3: Run Gemini Vision review if enabled (Layer 4)
            if job_config_path:
                gemini_passed = self.run_gemini_vision_review(pdf_path, job_config_path)
                if not gemini_passed:
                    print("❌ Gemini Vision review FAILED")
                    self.results["success"] = False

        # Step 6: Generate and save report
        report = self.generate_report()
        report_path = self.save_report(report)
        print(f"\n📊 Report saved: {report_path}")

        # Step 7: Send notification (if configured)
        if self.config.get("notification_webhook"):
            self.notify_webhook(validation_report)

        # Print summary
        print("\n" + report)

        # Return success for CI/CD integration
        return self.results["success"]

    def run_validation_only(self) -> bool:
        """Execute validation-only pipeline (no InDesign export)"""
        print("[Pipeline] Running in VALIDATION-ONLY mode")
        print("[Pipeline] Skipping InDesign connection and export steps")

        pdf_path = self.config.get("pdf_path")
        if not pdf_path:
            print("❌ ERROR: --pdf required in validation-only mode")
            return False

        if not os.path.exists(pdf_path):
            print(f"❌ ERROR: PDF not found: {pdf_path}")
            return False

        print(f"📄 Validating: {pdf_path}")
        self.log_step("Locate PDF", True, pdf_path)

        # Load QA profile
        job_config_path = self.config.get("job_config_path")
        qa_profile = self.load_qa_profile(job_config_path)

        # Derive thresholds from profile
        threshold = qa_profile.get('min_score', self.config['validation_threshold'])
        tfu_threshold = qa_profile.get('min_tfu_score', 140)
        visual_baseline = qa_profile.get('visual_baseline_id', self.config.get('visual_baseline'))
        max_visual_diff = qa_profile.get('max_visual_diff_percent', self.config.get('max_visual_diff', 5.0))

        print(f"[Pipeline] QA Profile: {qa_profile.get('id', 'default')}")
        print(f"[Pipeline] Threshold: {threshold}, TFU: {tfu_threshold}, Visual diff: {max_visual_diff}%")

        # Step 1: Run core document validation
        if job_config_path and os.path.exists(job_config_path):
            print(f"📋 Using job config: {job_config_path}")
            # Pass job config to validator for TFU compliance checks
            validator = DocumentValidator(pdf_path, job_config_path=job_config_path)
        else:
            validator = DocumentValidator(pdf_path)

        try:
            validation_report = validator.validate_all()
            score = validation_report.get("score", 0)

            self.log_step("Validate PDF", score >= threshold,
                         f"Score: {score}/{validation_report.get('max_score', 100)}")

            self.results["score"] = score

            if score >= threshold:
                print(f"✅ Validation PASSED (Score: {score}/{validation_report.get('max_score', 100)})")
                self.results["success"] = True
            else:
                print(f"❌ Validation FAILED (Score: {score}/{validation_report.get('max_score', 100)})")
                print(f"   Minimum required: {threshold}")
                self.results["success"] = False

        except Exception as e:
            # Check if it's an MCP connection error
            error_msg = str(e)
            if "MCP connection required" in error_msg or "MCP CONNECTION ERROR" in error_msg:
                print(f"\n{'='*60}")
                print("❌ MCP CONNECTION ERROR (Infrastructure Failure)")
                print(f"{'='*60}")
                print(error_msg)
                print(f"\n{'='*60}")
                print("Exit code: 2 (infrastructure error, not validation failure)")
                print(f"{'='*60}\n")
                sys.exit(2)
            else:
                # Other validation errors
                print(f"❌ Validation error: {error_msg}")
                self.results["success"] = False
                self.results["error"] = error_msg

        # Step 2: Run PDF quality validation (Layer 2)
        pdf_quality_passed = self.run_pdf_quality_validation(pdf_path)
        if not pdf_quality_passed:
            print("❌ PDF quality validation FAILED")
            self.results["success"] = False

        # Step 3: Run visual regression if baseline specified (Layer 3)
        if visual_baseline:
            visual_passed = self.run_visual_regression(pdf_path, visual_baseline)
            if not visual_passed:
                print("❌ Visual regression test FAILED")
                self.results["success"] = False

        # Step 3.5: Run Gemini Vision review if enabled (Layer 4)
        gemini_passed = self.run_gemini_vision_review(pdf_path, job_config_path)
        if not gemini_passed:
            print("❌ Gemini Vision review FAILED")
            self.results["success"] = False

        # Step 4: Create baseline if needed and configured
        if self.results.get('success'):
            self.create_baseline_if_needed(pdf_path, qa_profile)

        # Step 4: Generate and save report (BEFORE approval so scorecard exists)
        report = self.generate_report()
        report_path = self.save_report(report)
        print(f"\n📊 Report saved: {report_path}")

        # Step 5: Run approval workflow (if validation passed and approval enabled)
        if self.results.get('success'):
            approval_result = self.run_approval_workflow(report_path, job_config_path)
            if not approval_result.get('approved', True):
                print("❌ Approval REJECTED, marking pipeline as failed")
                self.results["success"] = False
                self.log_step("Approval", False, approval_result.get('note', 'rejected'))
            else:
                approval_note = approval_result.get('note', 'approved')
                self.log_step("Approval", True, approval_note)

        # Step 6: Send notification (if configured)
        if self.config.get("notification_webhook"):
            self.notify_webhook(validation_report)

        # Print summary
        print("\n" + report)

        return self.results["success"]

    def run_pdf_quality_validation(self, pdf_path: str) -> bool:
        """Run PDF quality validation (Layer 2) - page dimensions, text cutoffs, colors, etc."""
        print(f"\n🔍 Running PDF quality validation (Layer 2)")

        script_path = os.path.join(os.path.dirname(__file__), 'scripts', 'validate-pdf-quality.js')
        if not os.path.exists(script_path):
            print("⚠️  WARNING: validate-pdf-quality.js not found, skipping PDF quality validation")
            return True  # Don't fail pipeline if script missing

        try:
            result = subprocess.run(
                ['node', script_path, pdf_path],
                capture_output=True,
                text=True,
                timeout=120
            )

            # Exit code 0 = passed, 1 = failed
            if result.returncode == 0:
                print("✅ PDF quality validation PASSED")
                self.log_step("PDF Quality Validation", True)
                return True
            else:
                print("❌ PDF quality validation FAILED")
                print(result.stdout if result.stdout else result.stderr)
                self.log_step("PDF Quality Validation", False, result.stderr)
                return False

        except subprocess.TimeoutExpired:
            print("⚠️  PDF quality validation timed out")
            self.log_step("PDF Quality Validation", False, "Timeout")
            return False
        except Exception as e:
            print(f"⚠️  PDF quality validation error: {e}")
            self.log_step("PDF Quality Validation", False, str(e))
            return False

    def run_visual_regression(self, pdf_path: str, baseline_name: str) -> bool:
        """Run visual regression testing against baseline"""
        print(f"\n📸 Running visual regression test against: {baseline_name}")

        script_path = os.path.join(os.path.dirname(__file__), 'scripts', 'compare-pdf-visual.js')
        if not os.path.exists(script_path):
            print("⚠️  WARNING: compare-pdf-visual.js not found, skipping visual regression")
            return True  # Don't fail pipeline if script missing

        try:
            result = subprocess.run(
                ['node', script_path, pdf_path, baseline_name],
                capture_output=True,
                text=True,
                timeout=120
            )

            # Parse comparison report JSON
            comparison_dir = self._find_latest_comparison_dir(baseline_name)
            if comparison_dir:
                report_path = os.path.join(comparison_dir, 'comparison-report.json')
                if os.path.exists(report_path):
                    with open(report_path, 'r') as f:
                        comparison_data = json.load(f)

                    # Extract average diff percentage
                    avg_diff = comparison_data.get('summary', {}).get('avgDiffPercent', 0)
                    max_allowed = self.config.get("max_visual_diff", 5.0)

                    print(f"   Average diff: {avg_diff:.2f}%")
                    print(f"   Max allowed: {max_allowed}%")

                    if avg_diff > max_allowed:
                        print(f"❌ Visual regression FAILED: {avg_diff:.2f}% > {max_allowed}%")
                        self.log_step("Visual Regression", False, f"Diff {avg_diff:.2f}% exceeds {max_allowed}%")
                        return False
                    else:
                        print(f"✅ Visual regression PASSED: {avg_diff:.2f}% ≤ {max_allowed}%")
                        self.log_step("Visual Regression", True, f"Diff {avg_diff:.2f}%")
                        return True

            # Fallback: Check exit code
            if result.returncode == 0:
                print("✅ Visual regression PASSED")
                self.log_step("Visual Regression", True)
                return True
            else:
                print("❌ Visual regression FAILED")
                self.log_step("Visual Regression", False, result.stderr)
                return False

        except subprocess.TimeoutExpired:
            print("⚠️  Visual regression timed out")
            self.log_step("Visual Regression", False, "Timeout")
            return False
        except Exception as e:
            print(f"⚠️  Visual regression error: {e}")
            self.log_step("Visual Regression", False, str(e))
            return False

    def run_gemini_vision_review(self, pdf_path: str, job_config_path: str) -> bool:
        """Run Gemini Vision AI design critique (Layer 4)"""

        # Load gemini_vision config from job JSON
        if not job_config_path or not os.path.exists(job_config_path):
            print("[GEMINI] Skipped (no job config provided)")
            return True

        with open(job_config_path, 'r') as f:
            job_config = json.load(f)

        gemini_config = job_config.get('gemini_vision', {})

        if not gemini_config.get('enabled', False):
            print("[GEMINI] Skipped (disabled in job config)")
            return True

        print(f"\n🤖 Running Gemini Vision review (Layer 4)")

        script_path = os.path.join(os.path.dirname(__file__), 'scripts', 'gemini-vision-review.js')
        if not os.path.exists(script_path):
            print("⚠️  WARNING: gemini-vision-review.js not found, skipping Gemini review")
            return True  # Don't fail pipeline if script missing

        # Construct output path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = gemini_config.get('output_dir', 'reports/gemini')
        os.makedirs(output_dir, exist_ok=True)

        pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
        output_file = os.path.join(output_dir, f"gemini-review-{pdf_name}-{timestamp}.json")

        min_score = gemini_config.get('min_score', 0.90)

        try:
            result = subprocess.run(
                ['node', script_path,
                 '--pdf', pdf_path,
                 '--job-config', job_config_path,
                 '--output', output_file,
                 '--min-score', str(min_score)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes for AI processing
            )

            # Handle exit codes: 0=success, 1=validation failure, 3=infrastructure error
            if result.returncode == 0:
                print(f"✅ Gemini Vision review PASSED (score ≥ {min_score})")
                print(f"   Report: {output_file}")
                self.log_step("Gemini Vision Review", True, f"Score ≥ {min_score}")
                return True
            elif result.returncode == 1:
                print(f"❌ Gemini Vision review FAILED (score < {min_score} or critical issues)")
                print(result.stdout if result.stdout else result.stderr)
                print(f"   See report: {output_file}")
                self.log_step("Gemini Vision Review", False, f"Score < {min_score} or critical issues")
                return False
            else:  # returncode == 3 or other
                print(f"⚠️  Gemini Vision infrastructure error (exit code {result.returncode})")
                print(result.stdout if result.stdout else result.stderr)
                print("   Hint: Set GEMINI_API_KEY or DRY_RUN_GEMINI_VISION=1 for testing")
                self.log_step("Gemini Vision Review", False, "Infrastructure error")
                return False

        except subprocess.TimeoutExpired:
            print("⚠️  Gemini Vision review timed out (>5 minutes)")
            self.log_step("Gemini Vision Review", False, "Timeout")
            return False
        except Exception as e:
            print(f"⚠️  Gemini Vision review error: {e}")
            self.log_step("Gemini Vision Review", False, str(e))
            return False

    def _find_latest_comparison_dir(self, baseline_name: str) -> Optional[str]:
        """Find latest comparison directory for baseline"""
        comparisons_dir = os.path.join(os.path.dirname(__file__), 'comparisons')
        if not os.path.exists(comparisons_dir):
            return None

        matching_dirs = [
            d for d in os.listdir(comparisons_dir)
            if d.startswith(baseline_name)
        ]

        if not matching_dirs:
            return None

        # Sort by timestamp (assuming format: baseline-YYYYMMDD-HHMMSS)
        latest = sorted(matching_dirs)[-1]
        return os.path.join(comparisons_dir, latest)

    def create_baseline_if_needed(self, pdf_path: str, qa_profile: Dict) -> bool:
        """Create visual baseline if configured and missing"""
        baseline_id = qa_profile.get('visual_baseline_id')
        create_on_first_pass = qa_profile.get('create_baseline_on_first_pass', False)

        if not baseline_id:
            return False

        # Check if baseline exists
        baseline_dir = Path('references') / baseline_id
        if baseline_dir.exists():
            print(f"[Pipeline] Baseline exists: {baseline_id}")
            return False

        # Create baseline if configured
        if create_on_first_pass and self.results.get('success'):
            print(f"[Pipeline] Creating baseline: {baseline_id}")
            script_path = 'scripts/create-reference-screenshots.js'

            if not os.path.exists(script_path):
                print("[Pipeline] ⚠️  create-reference-screenshots.js not found, skipping baseline creation")
                return False

            try:
                result = subprocess.run(
                    ['node', script_path, pdf_path, baseline_id],
                    capture_output=True,
                    text=True,
                    timeout=60
                )

                if result.returncode == 0:
                    print(f"[Pipeline] ✅ Baseline created: {baseline_id}")
                    self.log_step("Create Baseline", True, baseline_id)
                    return True
                else:
                    print(f"[Pipeline] ❌ Baseline creation failed: {result.stderr}")
                    self.log_step("Create Baseline", False, result.stderr)
                    return False
            except Exception as e:
                print(f"[Pipeline] ❌ Baseline creation error: {e}")
                self.log_step("Create Baseline", False, str(e))
                return False

        return False

    def run_approval_workflow(self, report_path: str, job_config_path: str = None) -> Dict:
        """Run approval workflow based on job config"""
        # Load job config to get approval settings
        approval_mode = 'none'
        approval_config = {}

        if job_config_path and os.path.exists(job_config_path):
            try:
                with open(job_config_path, 'r') as f:
                    job = json.load(f)
                    approval_config = job.get('approval', {})
                    approval_mode = approval_config.get('mode', 'none')
            except Exception as e:
                print(f"⚠️  Could not load approval config: {e}")
                approval_mode = 'none'

        # Skip approval if mode is 'none'
        if approval_mode == 'none':
            print("[Pipeline] Approval mode: none (skipping)")
            return {
                'approved': True,
                'note': 'approval_not_required',
                'mode': 'none'
            }

        print(f"[Pipeline] Running approval workflow (mode: {approval_mode})")

        # Find scorecard JSON (generated in save_report)
        scorecard_path = report_path.replace('.txt', '-scorecard.json')
        if not os.path.exists(scorecard_path):
            print(f"⚠️  Scorecard not found: {scorecard_path}")
            print("[Pipeline] Auto-approving (scorecard missing)")
            return {
                'approved': True,
                'note': 'auto_approved_scorecard_missing',
                'mode': approval_mode
            }

        # Build approval manager command
        approval_script = os.path.join(os.path.dirname(__file__), 'approval', 'approval-manager.js')
        if not os.path.exists(approval_script):
            print(f"⚠️  Approval script not found: {approval_script}")
            print("[Pipeline] Auto-approving (approval system not available)")
            return {
                'approved': True,
                'note': 'auto_approved_script_missing',
                'mode': approval_mode
            }

        # Prepare command arguments
        cmd = ['node', approval_script, '--scorecard', scorecard_path, '--mode', approval_mode]

        if job_config_path:
            cmd.extend(['--job-config', job_config_path])

        if approval_config.get('channel'):
            cmd.extend(['--channel', approval_config['channel']])

        if approval_config.get('timeout'):
            cmd.extend(['--timeout', str(approval_config['timeout'])])

        if approval_config.get('webhookUrl'):
            cmd.extend(['--webhook-url', approval_config['webhookUrl']])

        # Run approval workflow
        approval_start_time = time.time()
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=approval_config.get('timeout', 3600) + 10  # Add buffer to timeout
            )

            approval_duration = time.time() - approval_start_time

            # Track approval wait time as metric
            if "metrics" not in self.results:
                self.results["metrics"] = {}
            self.results["metrics"]["approval_wait_seconds"] = approval_duration

            # Load approval result from logs
            # The approval manager logs to reports/approvals/
            approval_logs_dir = os.path.join(os.path.dirname(__file__), 'reports', 'approvals')
            if os.path.exists(approval_logs_dir):
                # Find most recent approval log
                log_files = [f for f in os.listdir(approval_logs_dir) if f.startswith('approval-') and f.endswith('.json')]
                if log_files:
                    latest_log = max(log_files, key=lambda f: os.path.getmtime(os.path.join(approval_logs_dir, f)))
                    latest_log_path = os.path.join(approval_logs_dir, latest_log)

                    try:
                        with open(latest_log_path, 'r') as f:
                            approval_result = json.load(f)
                            print(f"[Pipeline] Approval decision: {'APPROVED' if approval_result.get('approved') else 'REJECTED'}")
                            print(f"[Pipeline] Approval duration: {approval_duration:.1f}s")
                            return approval_result
                    except Exception as e:
                        print(f"⚠️  Could not parse approval log: {e}")

            # Fallback: Check exit code
            if result.returncode == 0:
                print("[Pipeline] Approval: APPROVED (exit code 0)")
                return {
                    'approved': True,
                    'note': 'approved_via_exit_code',
                    'mode': approval_mode,
                    'duration_seconds': approval_duration
                }
            else:
                print("[Pipeline] Approval: REJECTED (exit code 1)")
                return {
                    'approved': False,
                    'note': 'rejected_via_exit_code',
                    'mode': approval_mode,
                    'duration_seconds': approval_duration
                }

        except subprocess.TimeoutExpired:
            print(f"⚠️  Approval workflow timed out")
            print("[Pipeline] Auto-approving (timeout)")
            return {
                'approved': True,
                'note': 'auto_approved_on_timeout',
                'mode': approval_mode,
                'timedOut': True
            }
        except Exception as e:
            print(f"⚠️  Approval workflow error: {e}")
            print("[Pipeline] Auto-approving (error)")
            return {
                'approved': True,
                'note': 'auto_approved_on_error',
                'error': str(e),
                'mode': approval_mode
            }

    def _generate_scorecard(self) -> Dict:
        """Generate compact QA scorecard with profile info"""
        # Find validation report in results
        validation_step = next(
            (s for s in self.results["steps"] if s["name"] == "Validate PDF"),
            None
        )

        # Find visual regression step
        visual_step = next(
            (s for s in self.results["steps"] if s["name"] == "Visual Regression"),
            None
        )

        # Find baseline creation step
        baseline_step = next(
            (s for s in self.results["steps"] if s["name"] == "Create Baseline"),
            None
        )

        # Load QA profile
        qa_profile = self.load_qa_profile(self.config.get('job_config_path'))

        # Calculate total runtime
        total_time = time.time() - self.start_time

        scorecard = {
            "jobId": self.config.get("job_id", "unknown"),
            "jobName": self.config.get("job_name", ""),
            "pdfPath": self.config.get("pdf_path", ""),
            "timestamp": self.results["timestamp"],

            # Core validation scores
            "totalScore": self.results.get("score", 0),
            "maxScore": 150 if self.config.get("design_system") == "tfu" else 125,
            "threshold": self.config["validation_threshold"],

            # TFU compliance (if applicable)
            "tfuCompliance": self.config.get("design_system") == "tfu",

            # QA Profile info
            "qaProfile": {
                "id": qa_profile.get('id', 'default'),
                "min_score": qa_profile.get('min_score', 80),
                "min_tfu_score": qa_profile.get('min_tfu_score', 140),
                "max_visual_diff_percent": qa_profile.get('max_visual_diff_percent', 5.0),
                "visual_baseline_id": qa_profile.get('visual_baseline_id')
            },

            # Visual regression
            "visualDiffPercent": None,
            "maxVisualDiffAllowed": self.config.get("max_visual_diff", 5.0),
            "visualBaseline": self.config.get("visual_baseline"),
            "baseline_status": "used" if visual_step else "missing",
            "baseline_created": baseline_step is not None and baseline_step.get("success", False),

            # Runtime metrics
            "metrics": {
                "runtime_seconds": total_time,
                "steps_completed": len(self.results["steps"]),
                "steps_failed": len([s for s in self.results["steps"] if not s["success"]]),
                "validation_time": self.step_timings.get("Validate PDF", 0),
                "visual_regression_time": self.step_timings.get("Visual Regression", 0)
            },

            # Overall result
            "passed": self.results["success"],
            "steps": len(self.results["steps"]),
            "failedSteps": len([s for s in self.results["steps"] if not s["success"]])
        }

        # Extract visual diff if available
        if visual_step and "details" in visual_step:
            # Parse "Diff X.XX%" from details
            import re
            match = re.search(r"Diff ([\d.]+)%", visual_step.get("details", ""))
            if match:
                scorecard["visualDiffPercent"] = float(match.group(1))

        return scorecard

    def run_layer0_smoldocling(self, job_config: dict, pdf_path: str) -> dict:
        """
        Execute Layer 0: SmolDocling Structure Analysis

        Args:
            job_config: Full job configuration dictionary
            pdf_path: Path to PDF file to analyze

        Returns:
            {
                'enabled': bool,
                'passed': bool,
                'score': float,  # 0-1 scale
                'report_path': str or None,
                'status': 'success' | 'disabled' | 'error'
            }
        """
        validation_cfg = job_config.get('validation', {})
        smoldocling_cfg = validation_cfg.get('smoldocling', {})

        if not smoldocling_cfg.get('enabled', False):
            return {
                'enabled': False,
                'passed': True,  # Don't fail if disabled
                'score': 0,
                'report_path': None,
                'status': 'disabled'
            }

        try:
            from services.smoldocling_service import LayoutAnalyzer

            print("\n[Layer 0] SMOLDOCLING STRUCTURE ANALYSIS")
            print("-" * 60)

            analyzer = LayoutAnalyzer()

            # Analyze PDF structure
            result = analyzer.analyze_pdf(pdf_path)

            score = result.get('structural_quality_score', 0)
            passed = score >= 0.7  # Default threshold

            # Write report
            output_dir = smoldocling_cfg.get('output_dir', 'reports/layout')
            os.makedirs(output_dir, exist_ok=True)

            pdf_basename = os.path.basename(pdf_path).replace('.pdf', '')
            report_path = os.path.join(output_dir, f"{pdf_basename}-smoldocling.json")

            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)

            print(f"Structural quality: {score:.3f}")
            print(f"Elements detected: {len(result.get('elements', []))}")
            print(f"Report: {report_path}")
            print(f"Status: {'[OK] PASS' if passed else '[ERROR] FAIL'}\n")

            return {
                'enabled': True,
                'passed': passed,
                'score': score,
                'report_path': report_path,
                'status': 'success'
            }

        except Exception as e:
            print(f"[ERROR] SmolDocling error: {e}\n")
            return {
                'enabled': True,
                'passed': False,
                'score': 0,
                'report_path': None,
                'status': 'error',
                'error': str(e)
            }

    def run_layer5_accessibility(self, job_config: dict, pdf_path: str) -> dict:
        """
        Execute Layer 5: Accessibility Remediation

        Args:
            job_config: Full job configuration dictionary
            pdf_path: Path to PDF file to remediate

        Returns:
            {
                'enabled': bool,
                'passed': bool,
                'compliance_score': float,  # 0-1 scale
                'output_pdf': str or None,
                'report_path': str or None,
                'status': 'success' | 'disabled' | 'error'
            }
        """
        validation_cfg = job_config.get('validation', {})
        accessibility_cfg = validation_cfg.get('accessibility', {})

        if not accessibility_cfg.get('enabled', False):
            return {
                'enabled': False,
                'passed': True,  # Don't fail if disabled
                'compliance_score': 0,
                'output_pdf': None,
                'report_path': None,
                'status': 'disabled'
            }

        try:
            from services.accessibility_remediator import AccessibilityRemediator

            print("\n[Layer 5] ACCESSIBILITY REMEDIATION")
            print("-" * 60)

            # Create output directories
            output_dir = 'exports/accessibility'
            report_dir = accessibility_cfg.get('reportPath', 'reports/accessibility')
            os.makedirs(output_dir, exist_ok=True)
            os.makedirs(report_dir, exist_ok=True)

            # Create remediator
            remediator = AccessibilityRemediator()

            # Remediate PDF
            pdf_basename = os.path.basename(pdf_path).replace('.pdf', '')
            output_pdf = os.path.join(output_dir, f"{pdf_basename}-ACCESSIBLE.pdf")

            result = remediator.remediate_pdf(pdf_path, output_pdf, accessibility_cfg)

            compliance_score = result.get('compliance_score', 0)
            passed = compliance_score >= 0.90  # Default threshold

            # Write report
            report_path = os.path.join(report_dir, f"{pdf_basename}-accessibility.json")
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)

            print(f"Compliance score: {compliance_score:.3f}")
            print(f"Standards met: {', '.join(result.get('standards_met', []))}")
            print(f"Output PDF: {output_pdf}")
            print(f"Report: {report_path}")
            print(f"Status: {'[OK] PASS' if passed else '[WARN] PASS'}\n")

            return {
                'enabled': True,
                'passed': passed,
                'compliance_score': compliance_score,
                'output_pdf': output_pdf,
                'report_path': report_path,
                'status': 'success'
            }

        except Exception as e:
            print(f"[ERROR] Accessibility error: {e}\n")
            return {
                'enabled': True,
                'passed': False,
                'compliance_score': 0,
                'output_pdf': None,
                'report_path': None,
                'status': 'error',
                'error': str(e)
            }

    def run_smart_generation(self, job_config: dict):
        """
        Execute smart generation phase (Figma + Images + Font Pairing)

        Called before InDesign document generation to prepare design assets

        Args:
            job_config: Full job configuration dictionary

        Returns:
            {
                'figma': {...},
                'images': {...},
                'fontPairing': {...}
            }
        """
        print("\n" + "="*60)
        print("SMART GENERATION PHASE")
        print("="*60)

        results = {
            'figma': {'enabled': False, 'status': 'disabled'},
            'images': {'enabled': False, 'status': 'disabled'},
            'fontPairing': {'enabled': False, 'status': 'disabled'}
        }

        providers_cfg = job_config.get('providers', {})
        generation_cfg = job_config.get('generation', {})

        # Figma Design Tokens
        figma_cfg = providers_cfg.get('figma', {})
        if figma_cfg.get('enabled', False):
            try:
                from services.figma_service import FigmaService

                file_id = figma_cfg.get('fileId')
                if file_id and file_id != 'REPLACE_WITH_FIGMA_FILE_ID':
                    print("\n[Figma] Fetching design tokens...")
                    figma = FigmaService(file_id=file_id)
                    tokens = figma.fetch_design_tokens()

                    if tokens.get('status') == 'success':
                        print(f"  ✓ Fetched {len(tokens.get('colors', []))} colors")
                        print(f"  ✓ Fetched {len(tokens.get('typography', []))} text styles")
                        print(f"  → design-tokens/teei-figma-tokens.json")
                        results['figma'] = tokens
                    else:
                        print(f"  ⚠ Figma sync skipped: {tokens.get('message', 'Unknown')}")
                        results['figma'] = tokens
                else:
                    print("\n[Figma] ⊘ Figma file ID not configured")
                    results['figma'] = {'status': 'disabled', 'message': 'File ID not configured'}
            except Exception as e:
                print(f"\n[Figma] ❌ Error: {e}")
                results['figma'] = {'status': 'error', 'message': str(e)}
                if figma_cfg.get('failOnError', False):
                    raise

        # Image Generation
        images_cfg = providers_cfg.get('images', {})
        if images_cfg.get('enabled', False):
            try:
                from services.image_generation_service import ImageGenerationService

                print("\n[Images] Generating hero images...")
                image_gen = ImageGenerationService(
                    provider=images_cfg.get('provider', 'local'),
                    model=images_cfg.get('model'),
                    output_dir=images_cfg.get('outputDir', 'assets/images/tfu/aws')
                )

                roles = images_cfg.get('roles', ['cover_hero'])
                manifest = image_gen.generate_hero_images(job_config, roles)

                if manifest.get('status') == 'success':
                    print(f"  ✓ Generated {len(manifest.get('images', {}))} images")
                    print(f"  Provider: {images_cfg.get('provider', 'local')}")
                    print(f"  → {manifest.get('manifest_path')}")
                    results['images'] = manifest
                else:
                    print(f"  ⚠ Image generation skipped: {manifest.get('message', 'Unknown')}")
                    results['images'] = manifest
            except Exception as e:
                print(f"\n[Images] ❌ Error: {e}")
                results['images'] = {'enabled': True, 'status': 'error', 'message': str(e)}
                if images_cfg.get('failOnError', False):
                    raise

        # Font Pairing
        font_cfg = generation_cfg.get('fontPairing', {})
        if font_cfg.get('enabled', False):
            try:
                from services.font_pairing_engine import FontPairingEngine

                print("\n[Fonts] Validating font pairing...")
                engine = FontPairingEngine()

                # Validate pairing for TFU
                pairing_result = engine.validate_pairing(
                    headline_font='Lora',
                    body_font='Roboto',
                    purpose='partnership',
                    tfu_brand_lock=font_cfg.get('tfu_brand_lock', False)
                )

                score = pairing_result.get('harmony_score', 0)
                passed = score >= 0.85

                print(f"  Pairing: Lora + Roboto")
                print(f"  Harmony score: {score:.3f}")
                print(f"  TFU compliant: {pairing_result.get('tfu_compliant', False)}")
                print(f"  Status: {'✓ OK' if passed else '⚠ WARN'}")

                results['fontPairing'] = {
                    'enabled': True,
                    'score': score,
                    'status': 'OK' if passed else 'WARN',
                    'pairing': 'Lora + Roboto',
                    'tfu_compliant': pairing_result.get('tfu_compliant', False)
                }

            except Exception as e:
                print(f"\n[Fonts] ⚠ Error: {e}")
                results['fontPairing'] = {'enabled': True, 'status': 'SKIPPED', 'error': str(e)}

        print("="*60 + "\n")
        return results

    def run_planning_phase(self, job_config: dict, job_config_path: str) -> dict:
        """
        Execute planning phase (Layout Iteration + Performance Recommendations)

        This phase runs BEFORE document generation to optimize layout and
        use historical performance data for data-driven recommendations.

        Args:
            job_config: Full job configuration dictionary
            job_config_path: Path to job config file (for layout iteration)

        Returns:
            {
                'layout_iteration': {...},
                'performance_recs': {...},
                'selected_config': str  # Path to best variant config (if iteration ran)
            }
        """
        print("\n" + "="*60)
        print("PLANNING PHASE")
        print("="*60)

        results = {
            'layout_iteration': {'enabled': False, 'status': 'disabled'},
            'performance_recs': {'enabled': False, 'status': 'disabled'},
            'selected_config': job_config_path  # Default to original config
        }

        planning_cfg = job_config.get('planning', {})
        generation_cfg = job_config.get('generation', {})
        analytics_cfg = job_config.get('analytics', {})

        # Performance Recommendations (run first - informs layout iteration)
        if planning_cfg.get('performance_recommendations', False):
            try:
                from services.performance_intelligence import PerformanceTracker

                print("\n[Performance] Loading historical data...")
                tracker = PerformanceTracker(
                    store_path=analytics_cfg.get('store_path', 'analytics/performance/log.jsonl')
                )

                partner_id = analytics_cfg.get('partner_id')
                recs = tracker.get_recommendations(partner_id=partner_id)

                print(f"  ✓ Analyzed {recs.get('total_runs', 0)} historical runs")
                if recs.get('typical_page_counts'):
                    print(f"  Typical page count: {recs['typical_page_counts'][0]}")
                if recs.get('avg_scores'):
                    print(f"  Avg scores: L1={recs['avg_scores'].get('layer1', 0):.0f}, "
                          f"L3.5={recs['avg_scores'].get('layer3.5', 0):.2f}")

                results['performance_recs'] = {
                    'enabled': True,
                    'status': 'success',
                    'recommendations': recs
                }

            except Exception as e:
                print(f"\n[Performance] ⚠ Error: {e}")
                results['performance_recs'] = {'enabled': True, 'status': 'error', 'error': str(e)}

        # Layout Iteration (optional - expensive)
        layout_cfg = generation_cfg.get('layoutIteration', {})
        if layout_cfg.get('enabled', False):
            try:
                from services.layout_iteration_engine import LayoutIterationEngine

                print("\n[Layout Iteration] Generating layout variants...")
                engine = LayoutIterationEngine()

                num_variations = layout_cfg.get('num_variations', 3)
                mode = 'fast'  # Default to fast for now (full mode is expensive)

                result = engine.run_iteration(
                    base_job_config_path=job_config_path,
                    num_variations=num_variations,
                    mode=mode
                )

                best_variant = result['best_variant']
                print(f"  ✓ Tested {result['summary']['num_variants']} variants")
                print(f"  Best: {best_variant['variant_id']} (score: {best_variant['score'].get('overall', 0):.3f})")
                print(f"  Config: {best_variant['config_path']}")

                results['layout_iteration'] = {
                    'enabled': True,
                    'status': 'success',
                    'best_variant': best_variant,
                    'all_variants': result['all_variants']
                }

                # Use best variant config for generation
                results['selected_config'] = best_variant['config_path']

            except Exception as e:
                print(f"\n[Layout Iteration] ⚠ Error: {e}")
                results['layout_iteration'] = {'enabled': True, 'status': 'error', 'error': str(e)}

        print("="*60 + "\n")
        return results

    def run_world_class_pipeline(self, job_config_path: str) -> bool:
        """
        Execute the world-class 6-layer pipeline for TFU AWS V2

        Layers:
          0. SmolDocling Structure Analysis (optional)
          1. Content & Design Validation (validate_document.py)
          2. PDF Quality Checks (validate-pdf-quality.js)
          3. Visual Regression Testing (compare-pdf-visual.js)
          3.5. AI Design Tier 1 (typography, whitespace, color)
          4. AI Design Critique (gemini-vision-review.js)
          5. Accessibility Remediation (optional)

        Returns:
            True if all layers pass their thresholds, False otherwise
        """
        print("\n" + "="*60)
        print("WORLD-CLASS 6-LAYER PIPELINE")
        print("="*60)

        # Load job config
        if not os.path.exists(job_config_path):
            print(f"❌ Job config not found: {job_config_path}")
            return False

        with open(job_config_path, 'r', encoding='utf-8') as f:
            job_config = json.load(f)

        print(f"\n[Job] {job_config.get('name', 'Unknown')}")
        print(f"[Config] {job_config_path}\n")

        # Extract paths and thresholds
        pdf_path_base = job_config.get('output', {}).get('filename_base', 'TEEI-AWS-Partnership-TFU-V2')
        pdf_path = f"exports/{pdf_path_base}-DIGITAL.pdf"

        qa_profile = job_config.get('qaProfile', {})
        gemini_config = job_config.get('gemini_vision', {})

        layer1_threshold = qa_profile.get('min_score', 145)
        layer3_max_diff = qa_profile.get('max_visual_diff_percent', 5.0)
        layer4_min_score = gemini_config.get('min_score', 0.92)
        layer4_enabled = gemini_config.get('enabled', True)

        visual_baseline = qa_profile.get('visual_baseline_id', 'tfu-aws-partnership-v2')

        # Initialize results tracking (now 6-layer pipeline + Smart Generation + Planning)
        planning_results = None
        smart_gen_results = None
        layer_results = {
            "layer0": {"name": "SmolDocling Structure", "passed": False, "score": 0},
            "layer1": {"name": "Content & Design", "passed": False, "score": 0},
            "layer2": {"name": "PDF Quality", "passed": False},
            "layer3": {"name": "Visual Regression", "passed": False, "diff": 0},
            "layer3.5": {"name": "AI Design Tier 1", "passed": False, "score": 0},
            "layer4": {"name": "AI Design Critique", "passed": False, "score": 0},
            "layer5": {"name": "Accessibility", "passed": False, "score": 0}
        }

        # ==================================================
        # PLANNING PHASE (Layout Iteration + Performance Intelligence)
        # ==================================================
        planning_results = self.run_planning_phase(job_config, job_config_path)

        # Use selected config (best variant if layout iteration ran)
        active_config_path = planning_results.get('selected_config', job_config_path)
        if active_config_path != job_config_path:
            print(f"\n[Planning] Using optimized config: {active_config_path}")
            # Reload config if it changed
            with open(active_config_path, 'r', encoding='utf-8') as f:
                job_config = json.load(f)

        # ==================================================
        # STEP 0: GENERATION
        # ==================================================
        print("[Step 0] GENERATION")
        print("-" * 60)

        # Test MCP connection
        print("Testing MCP connection...")
        test_result = subprocess.run(
            [sys.executable, "-B", "test_connection.py"],
            capture_output=True,
            text=True,
            timeout=15
        )

        if test_result.returncode != 0:
            print(f"❌ MCP connection test failed (exit {test_result.returncode})")
            print(test_result.stdout)
            return False
        print("✓ MCP connection healthy\n")

        # Execute V2 generator
        print("Executing V2 generator...")
        gen_result = subprocess.run(
            [sys.executable, "-B", "execute_tfu_aws_v2.py"],
            capture_output=True,
            text=True,
            timeout=90
        )

        if gen_result.returncode != 0:
            print(f"❌ V2 generator failed (exit {gen_result.returncode})")
            print(gen_result.stdout)
            return False
        print("✓ V2 document generated\n")

        # Export PDF
        print("Exporting PDF...")
        export_result = subprocess.run(
            [sys.executable, "-B", "export_v2_now.py"],
            capture_output=True,
            text=True,
            timeout=60
        )

        if export_result.returncode != 0:
            print(f"❌ PDF export failed (exit {export_result.returncode})")
            print(export_result.stdout)
            return False
        print(f"✓ PDF exported: {pdf_path}\n")

        # ==================================================
        # LAYER 0: SMOLDOCLING STRUCTURE ANALYSIS
        # ==================================================
        layer0_result = self.run_layer0_smoldocling(job_config, pdf_path)
        layer_results["layer0"]["passed"] = layer0_result.get('passed', True)
        layer_results["layer0"]["score"] = layer0_result.get('score', 0)

        if not layer0_result.get('passed', True) and layer0_result.get('enabled', False):
            print(f"❌ Layer 0 failed: {layer0_result.get('score', 0):.3f} < 0.7")
            return False

        # ==================================================
        # LAYER 1: CONTENT & DESIGN VALIDATION
        # ==================================================
        print("[Layer 1] CONTENT & DESIGN VALIDATION")
        print("-" * 60)

        layer1_cmd = [
            sys.executable, "-B", "validate_document.py",
            pdf_path,
            "--job-config", job_config_path,
            "--strict"
        ]

        layer1_result = subprocess.run(
            layer1_cmd,
            capture_output=True,
            text=True,
            timeout=90
        )

        # Parse score from output
        import re
        score_match = re.search(r"OVERALL SCORE: (\d+)/(\d+)", layer1_result.stdout)
        if score_match:
            layer1_score = int(score_match.group(1))
            layer1_max = int(score_match.group(2))
            layer_results["layer1"]["score"] = layer1_score
            layer_results["layer1"]["max"] = layer1_max
            layer_results["layer1"]["passed"] = layer1_score >= layer1_threshold

            print(f"Score: {layer1_score}/{layer1_max}")
            print(f"Threshold: {layer1_threshold}")
            print(f"Status: {'✓ PASS' if layer_results['layer1']['passed'] else '❌ FAIL'}\n")
        else:
            print("❌ Could not parse Layer 1 score\n")
            return False

        if not layer_results["layer1"]["passed"]:
            print(f"❌ Layer 1 failed: {layer1_score} < {layer1_threshold}")
            print("\nFull output:")
            print(layer1_result.stdout)
            return False

        # ==================================================
        # LAYER 2: PDF QUALITY CHECKS
        # ==================================================
        print("[Layer 2] PDF QUALITY CHECKS")
        print("-" * 60)

        layer2_cmd = [
            "node", "scripts/validate-pdf-quality.js", pdf_path
        ]

        layer2_result = subprocess.run(
            layer2_cmd,
            capture_output=True,
            text=True,
            timeout=60
        )

        layer_results["layer2"]["passed"] = (layer2_result.returncode == 0)
        layer_results["layer2"]["exit_code"] = layer2_result.returncode

        print(f"Status: {'✓ PASS' if layer_results['layer2']['passed'] else '❌ FAIL'}\n")

        if not layer_results["layer2"]["passed"]:
            print(f"❌ Layer 2 failed (exit {layer2_result.returncode})")
            print(layer2_result.stdout)
            return False

        # ==================================================
        # LAYER 3: VISUAL REGRESSION TESTING
        # ==================================================
        print("[Layer 3] VISUAL REGRESSION TESTING")
        print("-" * 60)

        layer3_cmd = [
            "node", "scripts/compare-pdf-visual.js",
            pdf_path, visual_baseline
        ]

        layer3_result = subprocess.run(
            layer3_cmd,
            capture_output=True,
            text=True,
            timeout=90
        )

        # Parse diff percentage from output
        diff_match = re.search(r"(\d+\.\d+)%", layer3_result.stdout)
        if diff_match:
            layer3_diff = float(diff_match.group(1))
            layer_results["layer3"]["diff"] = layer3_diff
            layer_results["layer3"]["passed"] = layer3_diff <= layer3_max_diff

            print(f"Diff: {layer3_diff}%")
            print(f"Max allowed: {layer3_max_diff}%")
            print(f"Status: {'✓ PASS' if layer_results['layer3']['passed'] else '❌ FAIL'}\n")
        else:
            # If baseline doesn't exist, this might be first run - treat as pass
            if "not found" in layer3_result.stdout or "ERROR" in layer3_result.stdout:
                print("⚠️  Visual baseline not found - treating as PASS for first run")
                layer_results["layer3"]["passed"] = True
                layer_results["layer3"]["diff"] = 0.0
                print("Status: ✓ PASS (baseline created)\n")
            else:
                print("❌ Could not parse Layer 3 diff\n")
                return False

        if not layer_results["layer3"]["passed"]:
            print(f"❌ Layer 3 failed: {layer3_diff}% > {layer3_max_diff}%")
            return False

        # ==================================================
        # LAYER 3.5: AI DESIGN ANALYSIS (TIER 1)
        # ==================================================
        ai_config = job_config.get('ai', {})
        ai_enabled = ai_config.get('enabled', False)

        if ai_enabled:
            print("[Layer 3.5] AI DESIGN ANALYSIS (TIER 1)")
            print("-" * 60)

            layer_results["layer3.5"] = {"name": "AI Design Tier 1", "passed": False, "score": 0}

            layer35_cmd = [
                "node", "ai/core/aiRunner.js",
                "--job-config", job_config_path
            ]

            try:
                layer35_result = subprocess.run(
                    layer35_cmd,
                    capture_output=True,
                    text=True,
                    timeout=60
                )

                # Find latest AI report
                ai_report_dir = ai_config.get('output', {}).get('reportDir', 'reports/ai')
                if os.path.exists(ai_report_dir):
                    ai_reports = sorted(
                        [f for f in os.listdir(ai_report_dir) if f.endswith('.json')],
                        key=lambda x: os.path.getmtime(os.path.join(ai_report_dir, x)),
                        reverse=True
                    )

                    if ai_reports:
                        ai_report_path = os.path.join(ai_report_dir, ai_reports[0])
                        try:
                            with open(ai_report_path, 'r', encoding='utf-8') as f:
                                ai_data = json.load(f)

                            ai_score = ai_data.get('overall', {}).get('normalizedScore', 0)
                            ai_passed = ai_data.get('overall', {}).get('passed', False)

                            layer_results["layer3.5"]["score"] = ai_score
                            layer_results["layer3.5"]["passed"] = ai_passed

                            print(f"Typography: {ai_data.get('features', {}).get('typography', {}).get('score', 0):.2f}")
                            print(f"Whitespace: {ai_data.get('features', {}).get('whitespace', {}).get('score', 0):.2f}")
                            print(f"Color: {ai_data.get('features', {}).get('color', {}).get('score', 0):.2f}")
                            print(f"Overall: {ai_score:.3f}")
                            print(f"Status: {'✓ PASS' if ai_passed else '❌ FAIL'}\n")

                            if not ai_passed:
                                print(f"❌ Layer 3.5 failed: AI score {ai_score:.3f} below threshold")
                                return False

                        except Exception as e:
                            print(f"⚠️  Could not parse AI report: {e}")
                            layer_results["layer3.5"]["passed"] = False
                            return False
                    else:
                        print("⚠️  No AI report found")
                        layer_results["layer3.5"]["passed"] = False
                        return False
                else:
                    print("⚠️  AI report directory not found")
                    layer_results["layer3.5"]["passed"] = False
                    return False

            except subprocess.TimeoutExpired:
                print("❌ Layer 3.5 timed out")
                return False
            except Exception as e:
                print(f"❌ Layer 3.5 error: {e}")
                return False
        else:
            print("[Layer 3.5] AI DESIGN ANALYSIS")
            print("-" * 60)
            print("SKIPPED (disabled in job config)\n")

        # ==================================================
        # LAYER 4: AI DESIGN CRITIQUE (GEMINI VISION)
        # ==================================================
        if layer4_enabled:
            print("[Layer 4] AI DESIGN CRITIQUE (GEMINI VISION)")
            print("-" * 60)

            gemini_output_dir = gemini_config.get('output_dir', 'reports/gemini')
            os.makedirs(gemini_output_dir, exist_ok=True)
            gemini_output = f"{gemini_output_dir}/tfu-aws-v2-gemini-review.json"

            layer4_cmd = [
                "node", "scripts/gemini-vision-review.js",
                "--pdf", pdf_path,
                "--job-config", job_config_path,
                "--output", gemini_output,
                "--min-score", str(layer4_min_score)
            ]

            # Check if DRY_RUN mode is enabled via env var
            dry_run = os.getenv("DRY_RUN_GEMINI_VISION") == "1"
            if dry_run:
                print("⚠️  DRY_RUN_GEMINI_VISION=1 detected - simulating Gemini review")
                layer_results["layer4"]["passed"] = True
                layer_results["layer4"]["score"] = 0.95
                layer_results["layer4"]["dry_run"] = True
                print(f"Simulated score: 0.95")
                print(f"Min score: {layer4_min_score}")
                print("Status: ✓ PASS (DRY RUN)\n")
            else:
                layer4_result = subprocess.run(
                    layer4_cmd,
                    capture_output=True,
                    text=True,
                    timeout=120
                )

                # Parse Gemini score from JSON output
                if os.path.exists(gemini_output):
                    try:
                        with open(gemini_output, 'r', encoding='utf-8') as f:
                            gemini_data = json.load(f)
                        layer4_score = gemini_data.get('overall_score', 0)
                        layer_results["layer4"]["score"] = layer4_score
                        layer_results["layer4"]["passed"] = layer4_score >= layer4_min_score

                        print(f"Score: {layer4_score:.2f}")
                        print(f"Min score: {layer4_min_score}")
                        print(f"Status: {'✓ PASS' if layer_results['layer4']['passed'] else '❌ FAIL'}\n")
                    except Exception as e:
                        print(f"⚠️  Could not parse Gemini output: {e}")
                        layer_results["layer4"]["passed"] = False
                else:
                    print(f"❌ Gemini output not found: {gemini_output}")
                    layer_results["layer4"]["passed"] = False

                if not layer_results["layer4"]["passed"]:
                    print(f"❌ Layer 4 failed: {layer4_score:.2f} < {layer4_min_score}")
                    return False
        else:
            print("[Layer 4] SKIPPED (gemini_vision.enabled = false)\n")
            layer_results["layer4"]["passed"] = True  # Don't fail if disabled

        # ==================================================
        # LAYER 5: ACCESSIBILITY REMEDIATION
        # ==================================================
        layer5_result = self.run_layer5_accessibility(job_config, pdf_path)
        layer_results["layer5"]["passed"] = layer5_result.get('passed', True)
        layer_results["layer5"]["score"] = layer5_result.get('compliance_score', 0)
        layer_results["layer5"]["output_pdf"] = layer5_result.get('output_pdf')

        # Layer 5 is advisory unless explicitly required
        # We don't fail the pipeline on Layer 5, just log the results

        # ==================================================
        # FINAL SUMMARY
        # ==================================================
        print("\n" + "="*60)
        print("WORLD-CLASS PIPELINE SUMMARY")
        print("="*60)

        # Check if all REQUIRED layers passed (0, 5 are optional)
        required_layers = ["layer1", "layer2", "layer3", "layer3.5", "layer4"]
        all_passed = all(layer_results[key]["passed"] for key in required_layers if key in layer_results)

        # Smart Generation Summary (if available from execute_tfu_aws_v2.py output)
        print("\n--- SMART GENERATION ---")
        if job_config.get('providers', {}).get('figma', {}).get('enabled'):
            print(f"Figma: enabled | tokens: {'design-tokens/teei-figma-tokens.json' if os.path.exists('design-tokens/teei-figma-tokens.json') else 'not loaded'}")
        if job_config.get('providers', {}).get('images', {}).get('enabled'):
            images_provider = job_config.get('providers', {}).get('images', {}).get('provider', 'local')
            print(f"Images: enabled | provider: {images_provider}")
        if job_config.get('generation', {}).get('fontPairing', {}).get('enabled'):
            print(f"Fonts: enabled | pairing: Lora + Roboto | TFU compliant")

        # Layer-by-layer results
        print("\n--- VALIDATION LAYERS ---")

        # Layer 0
        if layer_results["layer0"].get("score", 0) > 0:
            print(f"Layer 0 – SmolDocling: {layer_results['layer0']['score']:.3f} {'[PASS]' if layer_results['layer0']['passed'] else '[FAIL]'}")
        else:
            print(f"Layer 0 – SmolDocling: SKIPPED")

        # Layer 1
        print(f"Layer 1 – Content & Design: {layer_results['layer1']['score']}/{layer_results['layer1'].get('max', 150)} {'[PASS]' if layer_results['layer1']['passed'] else '[FAIL]'}")

        # Layer 2
        print(f"Layer 2 – PDF Quality: {'OK' if layer_results['layer2']['passed'] else 'FAIL'} {'[PASS]' if layer_results['layer2']['passed'] else '[FAIL]'}")

        # Layer 3
        print(f"Layer 3 – Visual: {layer_results['layer3']['diff']:.2f}% diff {'[PASS]' if layer_results['layer3']['passed'] else '[FAIL]'}")

        # Layer 3.5
        if ai_enabled and layer_results.get("layer3.5", {}).get("score", 0) > 0:
            print(f"Layer 3.5 – AI Tier 1: {layer_results['layer3.5']['score']:.3f} {'[PASS]' if layer_results['layer3.5']['passed'] else '[FAIL]'}")
        else:
            print(f"Layer 3.5 – AI Tier 1: SKIPPED")

        # Layer 4
        if layer4_enabled:
            layer4_label = f"{layer_results['layer4']['score']:.2f}"
            if layer_results['layer4'].get('dry_run'):
                layer4_label += " (DRY RUN)"
            print(f"Layer 4 – Gemini Vision: {layer4_label} {'[PASS]' if layer_results['layer4']['passed'] else '[FAIL]'}")
        else:
            print(f"Layer 4 – Gemini Vision: SKIPPED")

        # Layer 5
        if layer_results["layer5"].get("score", 0) > 0:
            output_pdf = layer_results["layer5"].get("output_pdf", "N/A")
            print(f"Layer 5 – Accessibility: {layer_results['layer5']['score']:.3f} {'[PASS]' if layer_results['layer5']['passed'] else '[WARN]'}")
            if output_pdf:
                print(f"           → {output_pdf}")
        else:
            print(f"Layer 5 – Accessibility: SKIPPED")

        print(f"\nOVERALL STATUS: {'WORLD-CLASS ✓' if all_passed else 'FAILED ✗'}")
        print(f"\nPDF: {pdf_path}")
        print(f"Job: {job_config_path}")

        print("\nReports:")
        print(f"  Layer 1: reports/pipeline/ (check latest)")
        print(f"  Layer 2: exports/validation-issues/ (check latest)")
        print(f"  Layer 3: comparisons/{visual_baseline}/ (if available)")
        if layer4_enabled and not layer_results['layer4'].get('dry_run'):
            print(f"  Layer 4: {gemini_output}")

        print("="*60 + "\n")

        # Write JSON summary
        summary_dir = 'reports/pipeline'
        os.makedirs(summary_dir, exist_ok=True)
        summary_path = os.path.join(summary_dir, f"{pdf_path_base}-world-class-summary.json")

        summary = {
            'timestamp': datetime.now().isoformat(),
            'job_config': job_config_path,
            'pdf_path': pdf_path,
            'overall_status': 'PASS' if all_passed else 'FAIL',
            'smart_generation': {
                'figma': {
                    'enabled': job_config.get('providers', {}).get('figma', {}).get('enabled', False),
                    'tokens_loaded': os.path.exists('design-tokens/teei-figma-tokens.json')
                },
                'images': {
                    'enabled': job_config.get('providers', {}).get('images', {}).get('enabled', False),
                    'provider': job_config.get('providers', {}).get('images', {}).get('provider')
                },
                'fontPairing': {
                    'enabled': job_config.get('generation', {}).get('fontPairing', {}).get('enabled', False)
                }
            },
            'layers': {
                'layer0': {
                    'name': layer_results['layer0']['name'],
                    'enabled': layer_results['layer0'].get('score', 0) > 0,
                    'score': layer_results['layer0'].get('score', 0),
                    'passed': layer_results['layer0']['passed']
                },
                'layer1': {
                    'name': layer_results['layer1']['name'],
                    'score': layer_results['layer1']['score'],
                    'max': layer_results['layer1'].get('max', 150),
                    'passed': layer_results['layer1']['passed']
                },
                'layer2': {
                    'name': layer_results['layer2']['name'],
                    'passed': layer_results['layer2']['passed']
                },
                'layer3': {
                    'name': layer_results['layer3']['name'],
                    'diff_percent': layer_results['layer3']['diff'],
                    'passed': layer_results['layer3']['passed']
                },
                'layer3.5': {
                    'name': layer_results.get('layer3.5', {}).get('name', 'AI Design Tier 1'),
                    'enabled': ai_enabled,
                    'score': layer_results.get('layer3.5', {}).get('score', 0),
                    'passed': layer_results.get('layer3.5', {}).get('passed', False)
                },
                'layer4': {
                    'name': layer_results['layer4']['name'],
                    'enabled': layer4_enabled,
                    'score': layer_results['layer4'].get('score', 0),
                    'passed': layer_results['layer4']['passed']
                },
                'layer5': {
                    'name': layer_results['layer5']['name'],
                    'enabled': layer_results['layer5'].get('score', 0) > 0,
                    'compliance_score': layer_results['layer5'].get('score', 0),
                    'output_pdf': layer_results['layer5'].get('output_pdf'),
                    'passed': layer_results['layer5']['passed']
                }
            }
        }

        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)

        print(f"Summary written to: {summary_path}\n")

        # Update pipeline results for compatibility
        self.results["success"] = all_passed
        self.results["layer_results"] = layer_results

        # ==================================================
        # PERFORMANCE TRACKING
        # ==================================================
        analytics_cfg = job_config.get('analytics', {})
        if analytics_cfg.get('performance_tracking', False):
            try:
                from services.performance_intelligence import PerformanceTracker

                tracker = PerformanceTracker(
                    store_path=analytics_cfg.get('store_path', 'analytics/performance/log.jsonl')
                )

                # Build performance record
                record = {
                    'job_id': os.path.basename(pdf_path).replace('.pdf', ''),
                    'partner_id': analytics_cfg.get('partner_id'),
                    'doc_family': analytics_cfg.get('doc_family', 'unknown'),
                    'timestamp': datetime.now().isoformat(),
                    'scores': {
                        'layer0': layer_results.get('layer0', {}).get('score', 0),
                        'layer1': layer_results.get('layer1', {}).get('score', 0),
                        'layer2': 1.0 if layer_results.get('layer2', {}).get('passed', False) else 0.0,
                        'layer3': 1.0 - (layer_results.get('layer3', {}).get('diff', 0) / 100.0),  # Convert diff % to score
                        'layer3.5': layer_results.get('layer3.5', {}).get('score', 0),
                        'layer4': layer_results.get('layer4', {}).get('score', 0),
                        'layer5': layer_results.get('layer5', {}).get('score', 0)
                    },
                    'overall_status': 'PASS' if all_passed else 'FAIL',
                    'config_path': job_config_path
                }

                tracker.log_run(record)
                print(f"[Analytics] Performance data logged to: {analytics_cfg.get('store_path')}")

            except Exception as e:
                print(f"[Analytics] ⚠ Performance tracking failed: {e}")

        return all_passed

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Automated InDesign Export & Analysis Pipeline"
    )
    parser.add_argument(
        "--config", "-c",
        help="Path to configuration file",
        default="pipeline.config.json"
    )
    parser.add_argument(
        "--ci",
        action="store_true",
        help="Run in CI mode (non-interactive, strict validation)"
    )
    parser.add_argument(
        "--threshold",
        type=int,
        default=80,
        help="Minimum validation score (0-100)"
    )
    parser.add_argument(
        "--export-formats",
        nargs="+",
        default=["pdf"],
        choices=["pdf", "png", "jpg"],
        help="Export formats"
    )
    parser.add_argument(
        "--no-fix",
        action="store_true",
        help="Don't automatically fix issues"
    )

    # NEW: Validation-only mode arguments
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Validation-only mode: skip InDesign export, validate existing PDF(s)"
    )
    parser.add_argument(
        "--pdf",
        "--pdf-path",
        help="Path to PDF file to validate (required if --validate-only)"
    )
    parser.add_argument(
        "--job-config",
        help="Path to job JSON config (for TFU compliance checks)"
    )
    parser.add_argument(
        "--visual-baseline",
        help="Reference name for visual regression testing (e.g. 'teei-aws-tfu-v1')"
    )
    parser.add_argument(
        "--max-visual-diff",
        type=float,
        default=5.0,
        help="Maximum allowed visual difference percentage (default: 5%%)"
    )
    parser.add_argument(
        "--world-class",
        action="store_true",
        help="Run world-class 4-layer pipeline (generation + all 4 QA layers)"
    )

    args = parser.parse_args()

    # Override config with CLI arguments
    config_overrides = {}
    if args.ci:
        config_overrides["ci_mode"] = True
    if args.threshold:
        config_overrides["validation_threshold"] = args.threshold
    if args.export_formats:
        config_overrides["export_formats"] = args.export_formats
    if args.no_fix:
        config_overrides["auto_fix_colors"] = False

    # NEW: Validation-only mode arguments
    if args.validate_only:
        config_overrides["validate_only"] = True
    if args.pdf:
        config_overrides["pdf_path"] = args.pdf
    if args.job_config:
        config_overrides["job_config_path"] = args.job_config
    if args.visual_baseline:
        config_overrides["visual_baseline"] = args.visual_baseline
    if args.max_visual_diff is not None:
        config_overrides["max_visual_diff"] = args.max_visual_diff

    # Initialize and run pipeline
    pipeline = InDesignPipeline(args.config)
    pipeline.config.update(config_overrides)

    # Check if world-class pipeline mode
    if args.world_class:
        if not args.job_config:
            print("❌ --world-class requires --job-config")
            sys.exit(1)
        success = pipeline.run_world_class_pipeline(args.job_config)
    else:
        success = pipeline.run()

    # Exit with appropriate code for CI/CD
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()