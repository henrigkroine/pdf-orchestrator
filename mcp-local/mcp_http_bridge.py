# mcp_http_bridge.py
# HTTP → WS bridge for MCP. Listens on 8012 and forwards commands to ws://localhost:8013/{application}
import asyncio, json, uuid
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import websockets
import httpx

PROXY_URL = "http://127.0.0.1:8013/health"  # proxy health
WS_BASE   = "ws://127.0.0.1:8013"           # proxy websocket base

app = FastAPI(title="MCP HTTP Bridge", version="0.1")

class Step(BaseModel):
    command: str
    params: Dict[str, Any] = Field(default_factory=dict)

class JobTicket(BaseModel):
    application: str = Field(default="indesign", pattern="^(indesign|illustrator)$")
    steps: List[Step]
    options: Dict[str, Any] = Field(default_factory=dict)
    timeoutSec: int = 300

@app.get("/health")
async def health():
    ok = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            r = await client.get(PROXY_URL)
            ok = r.status_code == 200 and "ok" in r.text.lower()
    except Exception:
        ok = False
    return {"status": "ok" if ok else "degraded", "proxy8013": ok}

async def _send_ws_command(ws, application: str, command: str, params: Dict[str, Any], timeout: int):
    msg_id = f"cmd-{uuid.uuid4()}"
    payload = {
        "id": msg_id,
        "type": "COMMAND",
        "application": application,
        "command": command,
        "params": params or {}
    }
    await ws.send(json.dumps(payload))

    # Wait for matching response
    while True:
        raw = await asyncio.wait_for(ws.recv(), timeout=timeout)
        data = json.loads(raw)
        if data.get("id") == msg_id and data.get("type") in ("RESPONSE", "ERROR"):
            return data

@app.post("/api/jobs")
async def run_job(ticket: JobTicket):
    # Serialize execution per request with a fresh connection
    url = f"{WS_BASE}/{ticket.application}"
    try:
        async with websockets.connect(url, max_size=16_000_000, ping_timeout=30) as ws:
            # Handshake
            init = {"type": "INIT", "application": ticket.application, "version": "2024"}
            await ws.send(json.dumps(init))
            results = []
            for s in ticket.steps:
                res = await _send_ws_command(ws, ticket.application, s.command, s.params, ticket.timeoutSec)
                if res.get("status") == "error":
                    raise HTTPException(status_code=502, detail={"step": s.command, "error": res})
                results.append(res)
            return {"status": "ok", "results": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
