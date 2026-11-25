# Ray Group DeFi UX MCP Server

An [MCP server](https://modelcontextprotocol.io) that gives AI agents direct access to the Ray Group DeFi UX rubric, named patterns, cognitive-bias glossary, critique personas, visual references, flow graphs, and (with Pro) structured screenshot / protocol audit worksheets — the same framework used in Ray Group's audits and taught at EthCC, ETH Prague, and ETH Milan.

Use it in Claude Desktop, Cursor, Codex, Claude Design, or any other MCP-compatible AI client to ground UX assessments in a published, opinionated framework rather than generic advice.

> **Status:** v0.3.
> **Free tier:** 8-area rubric, 10 named patterns, 5 glossary entries, 2 critique personas — installable today, MIT-licensed, runs locally over stdio, no account, no network.
> **Pro tier ($29/mo · $290/yr):** 50+ named patterns with protocol references, 30+ glossary entries, case studies, full persona pack, visual reference boards, flow graphs, `audit_screenshot`, `audit_protocol`. Unlock by setting `RAYGROUP_API_KEY` in your client config. Buy at [raygroup.uk/products/defi-ux-mcp/pricing](https://raygroup.uk/products/defi-ux-mcp/pricing/).


<img width="1536" height="1024" alt="agentic-development-header" src="https://github.com/user-attachments/assets/aee77f89-8724-4083-aef3-20a4da370ffb" />

---

## What's inside

| Tool                 | Free | Pro | What it does                                                                                                                 |
| -------------------- | :--: | :-: | ---------------------------------------------------------------------------------------------------------------------------- |
| `search_defi_ux`     |  ✓   |  ✓  | Free-text search across the bundled corpus.                                                                                  |
| `get_rubric`         |  ✓   |  ✓  | Returns the eight-area DeFi UX rubric. Optionally filter to a single area.                                                   |
| `get_pattern`        |  ✓   |  ✓  | Named DeFi UX patterns. Pro returns the extended set (50+) with named-protocol references.                                   |
| `get_glossary_entry` |  ✓   |  ✓  | Cognitive-bias / heuristic entries. Pro returns the extended set (30+).                                                      |
| `get_persona`        |  ✓   |  ✓  | Critique personas (2 free; full pack on Pro) for stress-testing UI before team review.                                       |
| `get_case_study`     |      |  ✓  | Named-protocol case studies.                                                                                                 |
| `get_reference`      |      |  ✓  | Visual / protocol reference boards (confirm, onboarding, leverage, approvals, errors, disclosure).                           |
| `get_flow`           |      |  ✓  | Happy / unhappy / edge flow graphs aligned with the UI kits.                                                                 |
| `audit_screenshot`   |      |  ✓  | Rubric-aligned audit worksheet for a screen you can see — criteria, anti-patterns, scoring table.                            |
| `audit_protocol`     |      |  ✓  | Multi-page audit plan for a protocol (by name, URL, and/or type).                                                            |
| `list_categories`    |  ✓   |  ✓  | Corpus map — first call to discover what's available.                                                                        |

---

## Install

### Option A — Run from local clone (today)

```bash
git clone https://github.com/raygroup/raygroup-defi-ux-mcp.git
cd raygroup-defi-ux-mcp
npm install
npm run build
```

The compiled entry point is at `dist/index.js`. Point your MCP client at it (instructions per client below).

### Option B — Run via npx (once published to npm)

```bash
npx -y @raygroup/defi-ux-mcp
```

---

## Configure in Claude Desktop / Claude Design

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "raygroup-defi-ux": {
      "command": "node",
      "args": ["/absolute/path/to/raygroup-defi-ux-mcp/dist/index.js"]
    }
  }
}
```

To unlock Pro, add the env block:

```json
{
  "mcpServers": {
    "raygroup-defi-ux": {
      "command": "node",
      "args": ["/absolute/path/to/raygroup-defi-ux-mcp/dist/index.js"],
      "env": {
        "RAYGROUP_API_KEY": "rg_live_xxxxxxxxxxxx"
      }
    }
  }
}
```

Restart the client. Tools appear under the MCP icon. The server prints `Free tier` or `Pro tier` to stderr on startup.

---

## Configure in Cursor

Settings → MCP → Add new MCP Server, or `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "raygroup-defi-ux": {
      "command": "node",
      "args": ["/absolute/path/to/raygroup-defi-ux-mcp/dist/index.js"],
      "env": {
        "RAYGROUP_API_KEY": "rg_live_xxxxxxxxxxxx"
      }
    }
  }
}
```

---

## Try it

- _"Score this DeFi protocol against the Ray Group DeFi UX rubric."_
- _"Call audit_screenshot for this confirm sheet: [describe or attach image]. Surface type confirm."_
- _"Call get_persona with slug novice-first-wallet and stress-test this onboarding copy."_
- _"Call get_reference with surface leverage and compare to this ticket."_
- _"Call audit_protocol for Uniswap as a dex, then walk the plan."_
- _"Call get_flow with slug spot-swap-confirm and list the unhappy paths."_

---

## Inspect

```bash
npm run inspect
```

---

## Licence

MIT. See [LICENSE](./LICENSE).

## Author

Built and maintained by [Ray Group](https://raygroup.uk) — Founder: [Madalina Raicu](https://www.linkedin.com/in/madalinaraicu).

Issues and PRs: [github.com/raygroup/raygroup-defi-ux-mcp](https://github.com/raygroup/raygroup-defi-ux-mcp).
