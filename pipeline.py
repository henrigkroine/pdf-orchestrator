#!/usr/bin/env python3
"""
Automated Export and Analysis Pipeline for InDesign Documents
Orchestrates the complete workflow from InDesign to validated PDF
"""

import os
import sys
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
            status_icon = "✅" if step['success'] else "❌"
            report_lines.append(f"{i}. {status_icon} {step['name']}")
            if step.get('details'):
                report_lines.append(f"   Details: {step['details']}")
            if not step['success'] and step.get('error'):
                report_lines.append(f"   Error: {step['error']}")

        report_lines.extend([
            "",
            "=" * 60,
            f"FINAL SCORE: {self.results.get('score', 0)}/100",
            f"STATUS: {'✅ PASSED' if self.results['success'] else '❌ FAILED'}",
            "=" * 60
        ])

        return "\n".join(report_lines)

    def save_report(self, report: str, path: str = None) -> str:
        """Save report to file"""
        if not path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            path = f"pipeline_report_{timestamp}.txt"

        with open(path, 'w') as f:
            f.write(report)

        # Also save JSON version
        json_path = path.replace('.txt', '.json')
        with open(json_path, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)

        return path

    def log_step(self, name: str, success: bool, details: str = None):
        """Log pipeline step"""
        step = {
            "name": name,
            "success": success,
            "timestamp": datetime.now().isoformat()
        }

        if details:
            if success:
                step["details"] = details
            else:
                step["error"] = details

        self.results["steps"].append(step)

        # Console output
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}")
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
        print("\n🚀 Starting InDesign Export & Analysis Pipeline")
        print("=" * 60)

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

        # Step 5: Validate exported PDF
        pdf_files = [f for f in exported_files if f.endswith('.pdf')]
        if pdf_files:
            validation_report = self.validate_pdf(pdf_files[0])
            score = validation_report.get("score", 0)
            threshold = self.config["validation_threshold"]

            if score >= threshold:
                print(f"✅ Validation PASSED (Score: {score}/{validation_report.get('max_score', 100)})")
                self.results["success"] = True
            else:
                print(f"❌ Validation FAILED (Score: {score}/{validation_report.get('max_score', 100)})")
                print(f"   Minimum required: {threshold}")
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

    # Initialize and run pipeline
    pipeline = InDesignPipeline(args.config)
    pipeline.config.update(config_overrides)

    success = pipeline.run()

    # Exit with appropriate code for CI/CD
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()