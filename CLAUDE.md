# CLAUDE.md - WORLD-CLASS PDF PIPELINE

## ⛔ ABSOLUTE LAWS - BREAK THESE = YOU FAILED

### LAW 1: NO FUCKING WORKAROUNDS
- NEVER create "alternative" scripts when something fails
- NEVER bypass the pipeline with COM hacks or direct scripting
- If UXP fails, FIX UXP. Don't write run_via_com.py
- If MCP fails, FIX MCP. Don't route around it.
- WORKAROUND = FAILURE. PERIOD.

### LAW 2: NO FAKE COMPLETIONS
- "PDF was created" is NOT task completion
- REQUIRED for every PDF task:
  - [ ] QA score from world_class_cli.py
  - [ ] Validation report showing pass/fail
  - [ ] Score must be 95+ or task is FAILED
- No QA report = NOT DONE

### LAW 3: STOP AND ASK
- Hit a blocker? STOP IMMEDIATELY
- Do NOT spend time building workarounds
- Do NOT assume shortcuts are acceptable
- Send ONE message: "[X] failing because [Y]. What do you want me to do?"
- WAIT for answer before proceeding

### LAW 4: MANDATORY PIPELINE
```
EVERY PDF MUST GO THROUGH:
1. world_class_cli.py orchestrator
2. AI validation (Workers AI + Gemini)
3. QA scoring against template criteria
4. Brand compliance verification
5. Report generation

FORBIDDEN PATHS:
❌ Direct ExtendScript without orchestrator
❌ COM automation bypasses
❌ Skipping validation "because UXP is down"
❌ Any method that avoids QA scoring
```

### LAW 5: QUALITY GATES ARE WALLS
- 95+ score required. Not negotiable.
- All TEEI colors must validate
- Fonts must comply (Lora + Roboto)
- Gate fails = FIX AND RETRY
- Gate fails ≠ skip gate

## 📍 Project Structure

**Orchestrator:** `world_class_cli.py` - THIS IS THE ENTRY POINT
**MCP Worker:** `workers/mcp_worker/index.js`
**Templates:** `templates/template-registry.json`
**MCP Stack:** Proxy (8013), Bridge (8012)

## 🎨 TEEI Brand Colors (Authoritative)

| Name | Hex |
|------|-----|
| Nordshore | #00393F |
| Sky | #C9E4EC |
| Sand | #FFF1E2 |
| Beige | #EFE1DC |
| Moss | #65873B |
| Gold | #BA8F5A |
| Clay | #913B2F |

## 🚨 WHEN STUCK

1. Check MCP: `curl localhost:8012/health` + `curl localhost:8013/health`
2. Check UXP: InDesign open? Plugin connected?
3. Still failing? **ASK HENRIK. DO NOT IMPROVISE.**

## ❌ THINGS THAT WILL GET YOU FIRED

- Creating bypass scripts
- Marking tasks done without QA scores
- Spending 30+ mins on workarounds without asking
- Outputting PDFs that didn't go through the pipeline
- Saying "done" when validation didn't run
