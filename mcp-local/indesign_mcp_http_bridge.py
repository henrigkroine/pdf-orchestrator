# indesign_mcp_http_bridge.py
import json, asyncio, uuid, os, subprocess
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import socketio
import uvicorn

PROXY_URL = "http://localhost:8013"  # Socket.IO proxy
# Use relative paths from this script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
EXPORT_DIR = os.path.join(PROJECT_ROOT, "exports")
VALIDATOR = os.path.join(PROJECT_ROOT, "validate_document.py")

app = FastAPI()
sio = socketio.AsyncClient()

class Job(BaseModel):
    jobId: str
    jobType: str
    humanSession: bool = True
    worldClass: bool = True
    templateId: str
    output: Dict[str, Any]
    export: Dict[str, Any]
    qa: Dict[str, Any]
    data: Dict[str, Any]

async def _send_command(command: Dict[str, Any]) -> Dict[str, Any]:
    """Send command via Socket.IO and wait for response"""
    response_event = asyncio.Event()
    response_data = {}

    @sio.on("packet_response")
    async def on_packet_response(data):
        nonlocal response_data
        # Check if this response is for our command
        if data.get("command", {}).get("id") == command.get("id"):
            response_data = data
            response_event.set()

    # Connect to proxy if not already connected
    if not sio.connected:
        print("[Bridge] Connecting to Socket.IO proxy...")
        await sio.connect(PROXY_URL)
        await sio.emit("register", {"application": "indesign"})
        await asyncio.sleep(0.5)  # Wait for registration

    # Send command
    await sio.emit("command_packet", {
        "application": "indesign",
        "command": command
    })

    # Wait for response (timeout after 30 seconds)
    await asyncio.wait_for(response_event.wait(), timeout=30.0)
    return response_data  # Return full response, not just command

async def _indesign_sequence(job: Job) -> Dict[str, Any]:
    # Build commands for UXP plugin side (see proxy message format in docs)
    # 1) open template OR create new document (for smoke tests)
    if job.templateId == "minimal-test":
        # Create new document for smoke testing
        open_cmd = {
            "id": f"create-{uuid.uuid4()}",
            "type": "COMMAND",
            "application": "indesign",
            "command": "createDocument",
            "params": {
                "width": job.data.get("width", 612),
                "height": job.data.get("height", 792),
                "pages": job.data.get("pages", 1)
            }
        }
    else:
        # Production: open template
        open_cmd = {
            "id": f"open-{uuid.uuid4()}",
            "type": "COMMAND",
            "application": "indesign",
            "command": "openTemplate",
            "params": { "templateId": job.templateId }
        }
    # 2) inject data
    data_cmd = {
        "id": f"data-{uuid.uuid4()}",
        "type": "COMMAND",
        "application": "indesign",
        "command": "bindData",
        "params": job.data
    }
    # 3) export
    export_name = f"{job.jobId}.pdf"
    export_path = os.path.join(EXPORT_DIR, export_name)
    export_cmd = {
        "id": f"export-{uuid.uuid4()}",
        "type": "COMMAND",
        "application": "indesign",
        "command": "exportDocument",
        "params": {
            "format": "PDF",
            "preset": job.export.get("pdfPreset", "High Quality Print"),
            "filename": export_path
        }
    }

    # Send commands via Socket.IO
    print(f"[Bridge] Sending create/open command...")
    r1 = await _send_command(open_cmd)
    if r1.get("status", "").upper() != "SUCCESS":
        raise RuntimeError(f"create/open failed: {r1}")

    print(f"[Bridge] Sending data bind command...")
    r2 = await _send_command(data_cmd)
    if r2.get("status", "").upper() != "SUCCESS":
        raise RuntimeError(f"bindData failed: {r2}")

    print(f"[Bridge] Sending export command...")
    r3 = await _send_command(export_cmd)
    if r3.get("status", "").upper() != "SUCCESS":
        raise RuntimeError(f"exportDocument failed: {r3}")

    return {"exportPath": export_path}

def _run_validation(pdf_path: str, threshold: int) -> Dict[str, Any]:
    cmd = ["python", VALIDATOR, "--file", pdf_path, "--threshold", str(threshold)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"validator error: {r.stderr.strip()}")
    # validator prints JSON on stdout (per docs)
    return json.loads(r.stdout)

@app.get("/health")
def health():
    return {"status": "ok", "bridge": 8012, "proxy": 8013}

@app.post("/api/jobs")
async def submit_job(job: Job):
    import traceback
    try:
        print(f"[Bridge] Received job: {job.jobId}")
        res = await _indesign_sequence(job)
        print(f"[Bridge] Sequence complete, export: {res['exportPath']}")

        # Skip QA validation if disabled (for smoke tests)
        if not job.qa.get("enabled", True):
            print(f"[Bridge] QA disabled, returning success")
            return {"ok": True, "exportPath": res["exportPath"], "qa": {"skipped": True}}

        # Run QA validation
        threshold = max(95 if job.worldClass else 90, job.qa.get("threshold", 90))
        report = _run_validation(res["exportPath"], threshold)
        if not report.get("passing", False):
            raise HTTPException(status_code=422, detail={"qa_failed": report})
        return {"ok": True, "exportPath": res["exportPath"], "qa": report}
    except Exception as e:
        print(f"[Bridge] Error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8012)
