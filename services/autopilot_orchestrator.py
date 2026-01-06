#!/usr/bin/env python3
"""
Autopilot Orchestrator - Single-Entry AI-Powered Document Generation

Transforms high-level job specs into complete partnership documents by:
1. Planning content using RAG + partner profiles
2. Generating narrative with LLM
3. Running full world-class pipeline
4. Creating AI-generated executive reports

Usage:
    from services.autopilot_orchestrator import AutopilotOrchestrator

    orchestrator = AutopilotOrchestrator(repo_root=".", llm_client=llm_client)
    result = orchestrator.run("jobs/aws-tfu-2025.yaml")
"""

import os
import sys
import json
import yaml
import logging
import glob
import subprocess
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path

# Import existing services
from services.llm_client import LLMClient, create_llm_client_from_config
from services.rag_content_engine import RAGContentEngine
from services.partner_profiles import PartnerProfileRegistry
from services.content_personalizer import ContentPersonalizer
from services.multilingual_generator import MultilingualGenerator
from services.performance_intelligence import PerformanceTracker

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


class AutopilotOrchestrator:
    """
    Main orchestrator for autopilot mode.

    Handles the full workflow from job spec → PDFs + executive report.
    """

    def __init__(self, repo_root: str = ".", llm_client: Optional[LLMClient] = None, verbose: bool = True):
        """
        Initialize autopilot orchestrator.

        Args:
            repo_root: Repository root directory
            llm_client: Optional LLMClient (will create default if None)
            verbose: Print progress messages
        """
        self.repo_root = Path(repo_root)
        self.llm_client = llm_client
        self.verbose = verbose

        # Initialize services
        self.profile_registry = PartnerProfileRegistry()
        self.rag_engine = None  # Initialized on demand
        self.performance_tracker = PerformanceTracker()

    def run(self, job_spec_path: str) -> Dict[str, Any]:
        """
        Main autopilot workflow.

        Args:
            job_spec_path: Path to YAML/JSON job spec

        Returns:
            Result dict with paths and summaries
        """
        self._log_header("AUTOPILOT RUN START")

        # 1. Parse job spec
        job_spec = self._parse_job_spec(job_spec_path)
        self._log(f"Job ID: {job_spec['job_id']}")
        self._log(f"Partner: {job_spec['partner_profile_id']}")

        # 2. Build internal plan
        plan = self._build_plan(job_spec)

        # 3. Generate pipeline job config
        job_config_path = self._generate_job_config(job_spec, plan)
        self._log(f"✓ Generated job config: {job_config_path}")

        # 4. Generate content JSON
        content_path = self._generate_content(job_spec, plan, job_config_path)
        self._log(f"✓ Generated content: {content_path}")

        # 5. Run world-class pipeline
        pipeline_result = self._run_pipeline(job_config_path)
        self._log(f"✓ Pipeline complete: {pipeline_result['status']}")

        # 6. Collect outputs
        outputs = self._collect_outputs(job_spec, pipeline_result)

        # 7. Generate executive report
        exec_report_path = self._generate_executive_report(job_spec, plan, outputs)
        self._log(f"✓ Executive report: {exec_report_path}")

        # Final result
        result = {
            'job_id': job_spec['job_id'],
            'job_config_path': job_config_path,
            'content_path': content_path,
            'pdf_paths': outputs.get('pdfs', []),
            'qa_summary_path': outputs.get('qa_summary'),
            'executive_report_path': exec_report_path,
            'world_class_summary': pipeline_result,
            'timestamp': datetime.now().isoformat()
        }

        self._log_header("AUTOPILOT RUN COMPLETE")
        self._print_summary(result)

        return result

    def _parse_job_spec(self, path: str) -> Dict[str, Any]:
        """Parse and validate job spec YAML/JSON."""
        self._log(f"\n[1/7] Parsing job spec: {path}")

        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Job spec not found: {path}")

        # Load YAML/JSON
        with open(path, 'r', encoding='utf-8') as f:
            if path.suffix in ['.yaml', '.yml']:
                spec = yaml.safe_load(f)
            else:
                spec = json.load(f)

        # Validate required fields
        required = ['job_id', 'partner_profile_id', 'title', 'objectives', 'audience']
        for field in required:
            if field not in spec:
                raise ValueError(f"Missing required field: {field}")

        # Apply defaults
        spec.setdefault('tone', 'strategic_b2b')
        spec.setdefault('primary_language', 'en')
        spec.setdefault('secondary_languages', [])
        spec.setdefault('layout_prefs', {})
        spec['layout_prefs'].setdefault('pages', 4)
        spec['layout_prefs'].setdefault('variant_mode', 'auto')
        spec.setdefault('content_inputs', {})
        spec.setdefault('qa_prefs', {})
        spec['qa_prefs'].setdefault('min_score_layer1', 145)
        spec['qa_prefs'].setdefault('min_ai_tier1', 0.90)
        spec['qa_prefs'].setdefault('min_gemini', 0.92)
        spec['qa_prefs'].setdefault('accessibility_required', False)

        return spec

    def _build_plan(self, job_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Build internal plan using RAG + partner profiles + performance intelligence."""
        self._log(f"\n[2/7] Building document plan...")

        # Get partner profile
        profile = self.profile_registry.get_profile(job_spec['partner_profile_id'])
        if not profile:
            raise ValueError(f"Partner profile not found: {job_spec['partner_profile_id']}")

        # Initialize RAG if needed
        if not self.rag_engine:
            self.rag_engine = RAGContentEngine(llm_client=self.llm_client)

        # Build RAG index from content inputs
        deliverables = job_spec['content_inputs'].get('deliverables', [])
        if deliverables:
            sources = []
            for pattern in deliverables:
                sources.extend(glob.glob(pattern))
            if sources:
                self.rag_engine.build_or_update_index(sources)
                self._log(f"  ✓ Indexed {len(sources)} source documents")

        # Use LLM to create document outline
        outline = self._generate_outline(job_spec, profile)

        # Get performance recommendations
        perf_recommendations = self._get_performance_recommendations(job_spec, profile)

        plan = {
            'partner_profile': profile,
            'outline': outline,
            'performance_recommendations': perf_recommendations,
            'timestamp': datetime.now().isoformat()
        }

        self._log(f"  ✓ Plan complete: {len(outline.get('sections', []))} sections")

        return plan

    def _generate_outline(self, job_spec: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
        """Use LLM to generate document outline from objectives and RAG context."""
        if not self.llm_client or not self.llm_client.is_available():
            # Fallback: deterministic outline
            return {
                'sections': [
                    {'name': 'Cover', 'type': 'cover'},
                    {'name': 'Partnership Overview', 'type': 'intro'},
                    {'name': 'Programs & Impact', 'type': 'programs'},
                    {'name': 'Call to Action', 'type': 'cta'}
                ],
                'method': 'deterministic'
            }

        # Get RAG context
        rag_context = ""
        if self.rag_engine:
            try:
                answer = self.rag_engine.answer(
                    question=f"What are the key elements of a successful {profile['industry']} partnership document?",
                    top_k=3
                )
                rag_context = answer.get('answer', '')
            except:
                pass

        # Build LLM prompt
        objectives_str = "\n".join(f"- {obj}" for obj in job_spec['objectives'])
        audience_str = ", ".join(job_spec['audience'])
        notes_str = "\n".join(f"- {note}" for note in job_spec['content_inputs'].get('notes', []))

        system_prompt = (
            "You are a strategic document planner for TEEI partnerships. "
            "Create concise, structured outlines for partnership documents that highlight impact and value."
        )

        user_prompt = (
            f"Create a document outline for a TEEI partnership with {profile['name']}.\n\n"
            f"Objectives:\n{objectives_str}\n\n"
            f"Audience: {audience_str}\n\n"
            f"Content notes:\n{notes_str}\n\n"
            f"Relevant context from past partnerships:\n{rag_context[:500]}\n\n"
            f"Provide a JSON structure with sections array. Each section should have 'name' and 'type' fields."
        )

        try:
            response = self.llm_client.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.3
            )

            # Try to parse JSON from response
            # LLM might return markdown code block, so extract JSON
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                outline = json.loads(json_match.group())
                outline['method'] = 'llm_generated'
                return outline
        except Exception as e:
            logger.warning(f"LLM outline generation failed: {e}")

        # Fallback
        return {
            'sections': [
                {'name': 'Cover', 'type': 'cover'},
                {'name': 'Partnership Overview', 'type': 'intro'},
                {'name': 'Programs & Impact', 'type': 'programs'},
                {'name': 'Call to Action', 'type': 'cta'}
            ],
            'method': 'fallback'
        }

    def _get_performance_recommendations(self, job_spec: Dict[str, Any], profile: Dict[str, Any]) -> List[str]:
        """Get performance-based recommendations."""
        try:
            recommendations = self.performance_tracker.get_recommendations(
                partner_id=job_spec['partner_profile_id'],
                doc_family='partnership'
            )
            return recommendations.get('recommendations', [])
        except:
            return []

    def _generate_job_config(self, job_spec: Dict[str, Any], plan: Dict[str, Any]) -> str:
        """Generate full pipeline job config from spec and plan."""
        self._log(f"\n[3/7] Generating pipeline job config...")

        profile = plan['partner_profile']

        # Build complete job config
        job_config = {
            "name": f"{job_spec['job_id']} - Autopilot Generated",
            "description": f"Auto-generated from {job_spec['job_id']} job spec",
            "template": "partnership",
            "design_system": "tfu",
            "validate_tfu": True,

            "generator": {
                "type": "tfu_aws_v2",
                "jsx_script": "scripts/generate_tfu_aws_v2.jsx"
            },

            "data": {
                "title": job_spec['title'],
                "subtitle": f"Together for Ukraine · {profile['name']} Strategic Partnership",
                "organization": "The Educational Equality Institute",
                "partner": profile['name']
            },

            "typography_sidecar": f"exports/{job_spec['job_id']}-typography.json",

            "output": {
                "formats": ["indd", "pdf_digital"],
                "intent": "print",
                "filename_base": f"TEEI-{job_spec['job_id'].upper()}",
                "export_path": "./exports"
            },

            "quality": {
                "validation_threshold": job_spec['qa_prefs']['min_score_layer1'],
                "auto_fix": False,
                "strict_mode": True
            },

            "llm": {
                "provider": "anthropic" if (self.llm_client and self.llm_client.is_available()) else "none",
                "model": "claude-3-opus-20240229",
                "max_tokens": 1024,
                "temperature": 0.3,
                "fail_on_llm_error": False
            },

            "planning": {
                "rag": {
                    "enabled": True,
                    "store_dir": "rag_store",
                    "sources": job_spec['content_inputs'].get('deliverables', []),
                    "retrievalCount": 5,
                    "embeddingProvider": "local"
                },
                "personalization_enabled": True,
                "partner_profile_id": job_spec['partner_profile_id'],
                "partner_profiles_dir": "config/partner-profiles",
                "performance_recommendations": True
            },

            "generation": {
                "layoutIteration": {
                    "enabled": job_spec['layout_prefs']['variant_mode'] == 'auto',
                    "num_variations": 5 if job_spec['layout_prefs']['variant_mode'] == 'auto' else 1,
                    "variation_strategies": ["spacing", "emphasis", "color_balance"]
                }
            },

            "validation": {
                "smoldocling": {"enabled": False},
                "accessibility": {
                    "enabled": job_spec['qa_prefs']['accessibility_required'],
                    "standards": {
                        "wcag22AA": {"enabled": True, "failOnViolation": True}
                    }
                }
            },

            "gemini_vision": {
                "enabled": True,
                "min_score": job_spec['qa_prefs']['min_gemini']
            },

            "ai": {
                "enabled": True,
                "thresholds": {
                    "minNormalizedScore": job_spec['qa_prefs']['min_ai_tier1']
                }
            },

            "i18n": {
                "enabled": job_spec['primary_language'] != 'en',
                "target_language": job_spec['primary_language'],
                "fallback": "en",
                "provider": "llm" if (self.llm_client and self.llm_client.is_available()) else "local"
            },

            "mode": "world_class",
            "tfu_requirements": {
                "page_count": job_spec['layout_prefs']['pages'],
                "primary_color": "#00393F",
                "forbidden_colors": ["#BA8F5A"],
                "required_fonts": ["Lora", "Roboto"]
            }
        }

        # Write to file
        output_path = self.repo_root / "example-jobs" / f"autopilot-{job_spec['job_id']}.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(job_config, f, indent=2)

        return str(output_path)

    def _generate_content(self, job_spec: Dict[str, Any], plan: Dict[str, Any], job_config_path: str) -> str:
        """Generate content JSON using LLM-powered personalization."""
        self._log(f"\n[4/7] Generating document content...")

        # Load job config
        with open(job_config_path, 'r') as f:
            job_config = json.load(f)

        # Load metrics if provided
        metrics = {}
        metrics_file = job_spec['content_inputs'].get('metrics_file')
        if metrics_file and os.path.exists(metrics_file):
            with open(metrics_file, 'r') as f:
                metrics = json.load(f)

        # Base content structure
        base_content = {
            'cover_title': job_spec['title'],
            'cover_subtitle': job_config['data']['subtitle'],
            'intro_text': f"TEEI provides technical training programs to Ukrainian refugees across Europe, partnering with {plan['partner_profile']['name']} to create pathways to employment.",
            'programs': [
                {
                    'name': 'Cloud Fundamentals',
                    'description': 'Introduction to cloud computing with focus on employment outcomes.'
                },
                {
                    'name': 'Advanced Skills Development',
                    'description': 'Specialized technical training for career advancement.'
                }
            ],
            'cta_text': 'Ready to transform education through technology and create lasting impact?',
            'metrics': metrics
        }

        # Personalize content
        personalizer = ContentPersonalizer(
            rag_engine=self.rag_engine,
            llm_client=self.llm_client
        )

        final_content = personalizer.personalize(base_content, job_config)

        # Add job spec notes to content
        final_content['_autopilot_notes'] = job_spec['content_inputs'].get('notes', [])
        final_content['_autopilot_objectives'] = job_spec['objectives']

        # Write content JSON
        output_path = self.repo_root / "exports" / f"{job_spec['job_id']}-content.json"
        os.makedirs(output_path.parent, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(final_content, f, indent=2, ensure_ascii=False)

        return str(output_path)

    def _run_pipeline(self, job_config_path: str) -> Dict[str, Any]:
        """Run the REAL world-class pipeline."""
        self._log(f"\n[5/7] Running world-class pipeline...")

        # Generate unique run ID for this pipeline execution
        run_id = f"autopilot-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"

        # Set environment variable so pipeline can use it for report naming
        env = os.environ.copy()
        env['AUTOPILOT_RUN_ID'] = run_id

        # Call the REAL pipeline
        exit_code, output = self._run_world_class_pipeline(job_config_path, env)

        if exit_code != 0:
            self._log(f"  ⚠ Pipeline exited with code {exit_code}")
            # Don't fail immediately - collect what we can
        else:
            self._log(f"  ✓ Pipeline completed successfully")

        # Collect real reports and outputs
        reports = self._collect_pipeline_reports(run_id, job_config_path)

        return {
            'status': 'PASS' if exit_code == 0 else 'PARTIAL',
            'exit_code': exit_code,
            'run_id': run_id,
            'layer1_score': reports.get('layer1_score'),
            'ai_tier1_score': reports.get('ai_tier1_score'),
            'gemini_score': reports.get('gemini_score'),
            'layer5_score': reports.get('layer5_score'),
            'pdf_paths': reports.get('pdf_paths', []),
            'report_paths': reports.get('report_paths', {}),
            'output': output
        }

    def _run_world_class_pipeline(self, job_config_path: str, env: Dict[str, str]) -> Tuple[int, str]:
        """
        Execute the REAL world-class pipeline via subprocess.

        Args:
            job_config_path: Path to job config JSON
            env: Environment variables to pass to subprocess

        Returns:
            (exit_code, output_text)
        """
        self._log(f"  → Invoking: python pipeline.py --world-class --job-config {job_config_path}")

        try:
            result = subprocess.run(
                [
                    sys.executable,  # Use same Python interpreter
                    "-B",  # Don't write .pyc files
                    str(self.repo_root / "pipeline.py"),
                    "--world-class",
                    "--job-config",
                    job_config_path
                ],
                cwd=str(self.repo_root),
                env=env,
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace',  # Replace invalid Unicode chars instead of failing
                timeout=600  # 10 minute timeout
            )

            # Log output if verbose
            if self.verbose and result.stdout:
                for line in result.stdout.split('\n')[:20]:  # First 20 lines
                    if line.strip():
                        self._log(f"    {line}")
                if len(result.stdout.split('\n')) > 20:
                    self._log(f"    ... (output truncated)")

            return result.returncode, result.stdout + result.stderr

        except subprocess.TimeoutExpired:
            self._log(f"  ✗ Pipeline timed out after 10 minutes")
            return 1, "Pipeline execution timed out"
        except Exception as e:
            self._log(f"  ✗ Pipeline execution failed: {e}")
            return 1, str(e)

    def _collect_pipeline_reports(self, run_id: str, job_config_path: str) -> Dict[str, Any]:
        """
        Collect real pipeline reports and outputs.

        Args:
            run_id: Run ID from pipeline execution
            job_config_path: Path to job config (to extract job_id)

        Returns:
            Dictionary with scores, PDF paths, and report paths
        """
        self._log(f"  → Collecting pipeline outputs...")

        # Load job config to get job_id and output paths
        try:
            with open(job_config_path, 'r') as f:
                job_config = json.load(f)
        except:
            job_config = {}

        job_id = job_config.get('name', 'unknown').lower().replace(' ', '-')
        filename_base = job_config.get('output', {}).get('filename_base', 'TEEI-DOCUMENT')

        reports_dir = self.repo_root / "reports"
        exports_dir = self.repo_root / "exports"

        collected = {
            'pdf_paths': [],
            'report_paths': {},
            'layer1_score': None,
            'ai_tier1_score': None,
            'gemini_score': None,
            'layer5_score': None
        }

        # Find PDFs (look for most recent matching filename_base)
        pdf_patterns = [
            f"{filename_base}-DIGITAL.pdf",
            f"{filename_base}-PRINT.pdf",
            f"{filename_base}.pdf"
        ]

        for pattern in pdf_patterns:
            pdf_candidates = list(exports_dir.glob(f"**/{pattern}"))
            if pdf_candidates:
                # Get most recent
                latest_pdf = max(pdf_candidates, key=lambda p: p.stat().st_mtime)
                if latest_pdf.exists():
                    collected['pdf_paths'].append(str(latest_pdf))
                    self._log(f"    ✓ Found PDF: {latest_pdf.name}")

        # Find accessible PDF if it exists
        accessible_dir = exports_dir / "accessibility"
        if accessible_dir.exists():
            accessible_pdfs = list(accessible_dir.glob(f"{filename_base}*.pdf"))
            if accessible_pdfs:
                latest = max(accessible_pdfs, key=lambda p: p.stat().st_mtime)
                collected['pdf_paths'].append(str(latest))
                self._log(f"    ✓ Found accessible PDF: {latest.name}")

        # Find validation reports (look for most recent)
        # Use relative patterns for glob (absolute paths don't work on Windows)
        report_searches = {
            'pipeline_summary': f"reports/pipeline/*{job_id}*scorecard.json",
            'layer1_tfu': "reports/validation/tfu-compliance-*.json",
            'ai_tier1': "reports/ai-validation/*design-validation*.json",
            'gemini': "reports/gemini/*analysis*.json",
            'accessibility': "reports/accessibility/*report*.json"
        }

        for report_type, pattern in report_searches.items():
            matches = list(self.repo_root.glob(pattern))
            if matches:
                # Get most recent
                latest = max(matches, key=lambda p: p.stat().st_mtime)
                collected['report_paths'][report_type] = str(latest)
                self._log(f"    ✓ Found {report_type}: {latest.name}")

                # Try to extract scores from reports
                try:
                    with open(latest, 'r') as f:
                        report_data = json.load(f)

                    # Extract scores based on report type
                    if report_type == 'pipeline_summary':
                        if 'layers' in report_data:
                            layers = report_data['layers']
                            if 'layer1' in layers:
                                collected['layer1_score'] = layers['layer1'].get('score')
                            if 'layer4_ai' in layers:
                                collected['ai_tier1_score'] = layers['layer4_ai'].get('normalizedScore')
                            if 'layer3_5_gemini' in layers:
                                collected['gemini_score'] = layers['layer3_5_gemini'].get('score')
                            if 'layer5' in layers:
                                collected['layer5_score'] = layers['layer5'].get('score')

                    elif report_type == 'layer1_tfu' and 'score' in report_data:
                        collected['layer1_score'] = report_data['score']

                    elif report_type == 'ai_tier1' and 'normalizedScore' in report_data:
                        collected['ai_tier1_score'] = report_data['normalizedScore']

                    elif report_type == 'gemini' and 'overall_score' in report_data:
                        collected['gemini_score'] = report_data['overall_score']

                except Exception as e:
                    self._log(f"    ⚠ Could not parse {report_type}: {e}")

        # Log summary
        scores_found = sum(1 for v in [collected['layer1_score'], collected['ai_tier1_score'],
                                        collected['gemini_score'], collected['layer5_score']] if v is not None)
        self._log(f"  → Collected: {len(collected['pdf_paths'])} PDFs, {len(collected['report_paths'])} reports, {scores_found}/4 scores")

        return collected

    def _collect_outputs(self, job_spec: Dict[str, Any], pipeline_result: Dict[str, Any]) -> Dict[str, Any]:
        """Collect all output artifacts from REAL pipeline execution."""
        self._log(f"\n[6/7] Collecting outputs...")

        # Use real pipeline data
        report_paths = pipeline_result.get('report_paths', {})
        qa_summary_path = report_paths.get('pipeline_summary')

        return {
            'pdfs': pipeline_result.get('pdf_paths', []),
            'qa_summary': qa_summary_path,
            'report_paths': report_paths,
            'scores': {
                'layer1': pipeline_result.get('layer1_score'),
                'ai_tier1': pipeline_result.get('ai_tier1_score'),
                'gemini': pipeline_result.get('gemini_score'),
                'layer5': pipeline_result.get('layer5_score')
            },
            'exit_code': pipeline_result.get('exit_code', 0),
            'run_id': pipeline_result.get('run_id')
        }

    def _generate_executive_report(self, job_spec: Dict[str, Any], plan: Dict[str, Any], outputs: Dict[str, Any]) -> str:
        """Use LLM to generate human-friendly executive report."""
        self._log(f"\n[7/7] Generating executive report...")

        if not self.llm_client or not self.llm_client.is_available():
            # Fallback: deterministic summary
            report = self._generate_fallback_report(job_spec, outputs)
        else:
            report = self._generate_llm_report(job_spec, plan, outputs)

        # Write report
        output_dir = self.repo_root / "reports" / "autopilot"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{job_spec['job_id']}-EXECUTIVE-REPORT.md"

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)

        return str(output_path)

    def _generate_llm_report(self, job_spec: Dict[str, Any], plan: Dict[str, Any], outputs: Dict[str, Any]) -> str:
        """Generate executive report using LLM."""
        objectives_str = "\n".join(f"- {obj}" for obj in job_spec['objectives'])
        audience_str = ", ".join(job_spec['audience'])
        scores = outputs.get('scores', {})

        system_prompt = (
            "You are an expert document reviewer for TEEI partnership materials. "
            "Write clear, actionable executive summaries that help stakeholders understand "
            "document quality, strengths, and areas for improvement."
        )

        user_prompt = (
            f"Create an executive summary for this partnership document:\n\n"
            f"**Document**: {job_spec['title']}\n"
            f"**Partner**: {plan['partner_profile']['name']}\n\n"
            f"**Objectives**:\n{objectives_str}\n\n"
            f"**Target Audience**: {audience_str}\n\n"
            f"**Quality Scores**:\n"
            f"- TFU Compliance (Layer 1): {scores.get('layer1', 'N/A')}/150\n"
            f"- AI Design Validation: {scores.get('ai_tier1', 'N/A')}\n"
            f"- Visual Quality (Gemini): {scores.get('gemini', 'N/A')}\n"
            f"- Overall World-Class: {scores.get('layer5', 'N/A')}\n\n"
            f"Write a 2-page executive report covering:\n"
            f"1. Executive Summary (2-3 paragraphs)\n"
            f"2. Strengths (3-4 bullet points)\n"
            f"3. Quality Assessment (by layer)\n"
            f"4. Recommendations (if any improvements needed)\n"
            f"5. Next Steps\n\n"
            f"Use markdown formatting. Be specific and actionable."
        )

        try:
            report = self.llm_client.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.3
            )

            # Add header
            header = (
                f"# Executive Report: {job_spec['title']}\n\n"
                f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                f"**Job ID**: {job_spec['job_id']}\n"
                f"**Partner**: {plan['partner_profile']['name']}\n"
                f"**Generated by**: Autopilot (LLM-powered)\n\n"
                f"---\n\n"
            )

            return header + report

        except Exception as e:
            logger.warning(f"LLM report generation failed: {e}")
            return self._generate_fallback_report(job_spec, outputs)

    def _generate_fallback_report(self, job_spec: Dict[str, Any], outputs: Dict[str, Any]) -> str:
        """Generate deterministic fallback report."""
        scores = outputs.get('scores', {})

        return f"""# Executive Report: {job_spec['title']}

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Job ID**: {job_spec['job_id']}
**Generated by**: Autopilot (Offline Mode)

---

## Executive Summary

Document generated successfully using autopilot mode.

## Quality Scores

- **TFU Compliance (Layer 1)**: {scores.get('layer1', 'N/A')}/150
- **AI Design Validation**: {scores.get('ai_tier1', 'N/A')}
- **Visual Quality (Gemini)**: {scores.get('gemini', 'N/A')}
- **Overall World-Class**: {scores.get('layer5', 'N/A')}

## Status

Document generation complete. Review outputs in exports/ directory.

## Next Steps

1. Review PDF outputs
2. Validate content accuracy
3. Share with stakeholders

---

*Note: This is a deterministic report. Enable LLM mode for AI-generated analysis.*
"""

    def _log(self, message: str):
        """Log message if verbose mode enabled."""
        if self.verbose:
            logger.info(message)

    def _log_header(self, message: str):
        """Log section header."""
        if self.verbose:
            logger.info("\n" + "=" * 60)
            logger.info(message)
            logger.info("=" * 60)

    def _print_summary(self, result: Dict[str, Any]):
        """Print final summary."""
        if not self.verbose:
            return

        summary = result.get('world_class_summary', {})

        print("\n" + "=" * 60)
        print("AUTOPILOT RUN SUMMARY")
        print("=" * 60)
        print(f"Job ID         : {result['job_id']}")
        print(f"Job Config     : {result['job_config_path']}")
        print(f"Content        : {result['content_path']}")
        print(f"\nPDFs Generated :")
        for pdf in result.get('pdf_paths', []):
            print(f"  - {pdf}")
        print(f"\nWorld-Class    : {summary.get('status', 'UNKNOWN')}")
        print(f"  Layer 1      : {summary.get('layer1_score', 'N/A')}/150")
        print(f"  AI Tier 1    : {summary.get('ai_tier1_score', 'N/A')}")
        print(f"  Gemini       : {summary.get('gemini_score', 'N/A')}")
        print(f"  Layer 5      : {summary.get('layer5_score', 'N/A')}")
        print(f"\nExecutive Report:")
        print(f"  {result['executive_report_path']}")
        print("=" * 60)


# CLI test mode
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test autopilot orchestrator")
    parser.add_argument("job_spec", help="Path to job spec YAML/JSON")
    parser.add_argument("--llm", choices=["anthropic", "none"], default="none", help="LLM provider")

    args = parser.parse_args()

    # Create LLM client
    if args.llm == "anthropic":
        llm_client = LLMClient(provider="anthropic")
    else:
        llm_client = LLMClient(provider="none")

    # Run autopilot
    orchestrator = AutopilotOrchestrator(llm_client=llm_client, verbose=True)
    result = orchestrator.run(args.job_spec)

    print(f"\n✓ Autopilot complete: {result['job_id']}")
    sys.exit(0)
