# Installation Required

## New Dependency Added: async-mutex

The `async-mutex` package has been added to `package.json` to enable serialized execution of MCP worker jobs (prevents InDesign/Illustrator conflicts).

### To Install:

```powershell
cd "T:\Projects\pdf-orchestrator"
npm install async-mutex
```

Or install all dependencies:

```powershell
cd "T:\Projects\pdf-orchestrator"
npm install
```

### What This Enables:

- **Serialized MCP Execution**: Only one InDesign/Illustrator job runs at a time
- **Prevents Conflicts**: Avoids race conditions when multiple jobs target the same application
- **Mutex Protection**: `mcpMutex.runExclusive()` wraps all MCP worker calls

### Verification:

After installation, verify the package is installed:

```powershell
npm list async-mutex
```

Expected output:
```
pdf-orchestrator@1.0.0 T:\Projects\pdf-orchestrator
└── async-mutex@0.5.0
```
