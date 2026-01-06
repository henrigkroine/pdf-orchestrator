#!/usr/bin/env python3
"""
Generate job dependency graph JSON from job config and execution results
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

def generate_job_graph(job_config_path: str, scorecard_path: str = None) -> dict:
    """Generate job graph from config and optional scorecard"""

    if not os.path.exists(job_config_path):
        raise FileNotFoundError(f"Job config not found: {job_config_path}")

    with open(job_config_path, 'r') as f:
        job = json.load(f)

    scorecard = {}
    if scorecard_path and os.path.exists(scorecard_path):
        with open(scorecard_path, 'r') as f:
            scorecard = json.load(f)

    # Build node list
    nodes = [
        {"id": "job", "type": "job", "label": job.get('name', 'Job'), "status": "completed"}
    ]

    edges = []

    # Add MCP server nodes if mcpMode enabled
    if job.get('mcpMode') or job.get('style') == 'TFU':
        mcp_config = job.get('mcp', {})
        servers = mcp_config.get('servers', {})

        for server_name, server_config in servers.items():
            if server_config.get('enabled'):
                nodes.append({
                    "id": f"mcp_{server_name}",
                    "type": "mcp",
                    "label": f"{server_name.title()} MCP",
                    "status": "completed" if scorecard else "pending"
                })
                edges.append({
                    "from": "job",
                    "to": f"mcp_{server_name}",
                    "label": ", ".join(server_config.get('actions', ['process']))
                })

    # Add InDesign node
    if not job.get('validate_only', False):
        nodes.append({
            "id": "indesign_app",
            "type": "indesign",
            "label": "InDesign",
            "status": "completed" if scorecard else "pending"
        })
        edges.append({"from": "job", "to": "indesign_app", "label": "layout"})

    # Add QA nodes
    nodes.append({
        "id": "validator",
        "type": "qa",
        "label": "Document Validator",
        "status": "completed" if scorecard and scorecard.get('passed') else "failed"
    })
    edges.append({"from": "indesign_app" if not job.get('validate_only') else "job", "to": "validator", "label": "validate"})

    # Add visual regression node if enabled
    qa_profile = job.get('qaProfile', {})
    if qa_profile.get('visual_baseline_id'):
        nodes.append({
            "id": "visual",
            "type": "qa",
            "label": "Visual Regression",
            "status": "completed" if scorecard else "pending"
        })
        edges.append({"from": "validator", "to": "visual", "label": "compare"})

    # Build graph
    graph = {
        "jobId": job.get('jobId', job.get('name', 'unknown')),
        "generatedAt": datetime.now().isoformat(),
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "jobType": job.get('jobType', 'unknown'),
            "client": job.get('client', 'unknown'),
            "style": job.get('style', 'default'),
            "mcpMode": job.get('mcpMode', False)
        }
    }

    if scorecard:
        graph["executionMetrics"] = {
            "totalScore": scorecard.get('totalScore', 0),
            "passed": scorecard.get('passed', False),
            "runtime_seconds": scorecard.get('metrics', {}).get('runtime_seconds', 0)
        }

    return graph

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate-job-graph.py <job-config.json> [scorecard.json]")
        sys.exit(1)

    job_config_path = sys.argv[1]
    scorecard_path = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        graph = generate_job_graph(job_config_path, scorecard_path)

        # Save graph
        job_id = graph['jobId']
        output_dir = Path('reports/graphs')
        output_dir.mkdir(parents=True, exist_ok=True)

        output_path = output_dir / f"{job_id}-graph.json"
        with open(output_path, 'w') as f:
            json.dump(graph, f, indent=2)

        print(f"[Graph] Generated: {output_path}")
        print(f"[Graph] Nodes: {len(graph['nodes'])}, Edges: {len(graph['edges'])}")

    except FileNotFoundError as e:
        print(f"[Graph] ERROR: {e}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"[Graph] ERROR: Invalid JSON in {job_config_path}: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"[Graph] ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
