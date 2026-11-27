# Metta Core (`metta-core`)

> **Advisory pre-execution decision safety, multi-model Council deliberation, Ethical Alchemy, Mode B A2A envoy, and Model Context Protocol (MCP) server rooted in *Ahimsa* (non-harm) and the Five Precepts.**

Metta Core powers three connected interfaces:

- **Agent MCP Server (`metta-mcp`):** Exposes 12 local stdio/SSE tools (and 9 stateless tools live over hosted HTTPS Streamable HTTP at `https://metta-webapp.vercel.app/mcp`) for external agents across Claude Code, Codex, Cursor, Windsurf, and Antigravity.
- **Advisory Decision Layer & Council Sangha:** Evaluates proposed actions (`YES` / `NO` / `CAUTION`), runs blind multi-model dialectic synthesis, transforms adversarial prompts into constructive defensive fortifications (*Upāya* / Ethical Alchemy), and never overrides caller authority.
- **Human-Facing Reflection & Mode B Envoy (`metta`):** Supports compassionate dialogue (`Sati`, `Sīla`, `Dhamma`, `Karunā`) plus persistent Ed25519 identity verification and voluntary A2A peer outreach (`Metta-ehipassiko`).

## Hosted Zero-Install MCP (Streamable HTTP)

Connect any modern MCP client directly with zero local setup:

```json
{
  "mcpServers": {
    "metta": {
      "url": "https://metta-webapp.vercel.app/mcp"
    }
  }
}
```

## Local Stdio MCP (`uvx` / `uv`)

```json
{
  "mcpServers": {
    "metta": {
      "command": "uvx",
      "args": ["--from", "metta-core", "metta-mcp"]
    }
  }
}
```

Or run directly from a cloned monorepo checkout:

```bash
cd packages/metta-core
uv run metta-mcp
```

## CLI & A2A Envoy Commands

```bash
uv run metta                       # Interactive reflection REPL (/precepts, /graph, /council, /envoy, /meditate)
uv run metta identity --export     # Inspect or export Ed25519 public key (/.well-known/metta.pub)
uv run metta contacts --sync-vercel  # Inspect agent contacts + ingest Vercel CDN discovery logs
uv run metta ehipassiko --dry-run  # Screen open A2A beacons and preview signed handshakes
uv run metta ehipassiko            # Run Mode B voluntary A2A discovery & deduplicated handshake cycle
```

## Run Tests

```bash
uv run pytest
```
