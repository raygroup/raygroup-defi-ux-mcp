# Ray Group DeFi UX MCP Server

An [MCP server](https://modelcontextprotocol.io) that gives AI agents direct access to the Ray Group DeFi UX rubric, named patterns, and cognitive-bias glossary — the same framework used in Ray Group's audits and taught at EthCC, ETH Prague, and ETH Milan.

Use it in Claude Desktop, Cursor, Codex, or any other MCP-compatible AI client to ground UX assessments in a published, opinionated framework rather than generic advice.

> **Status:** v0.1, free tier. Premium tier (extended corpus, screenshot-based audit feedback, named-protocol case studies) on the roadmap. Join the waitlist at [raygroup.uk/products/defi-ux-mcp](https://raygroup.uk/products/defi-ux-mcp/).

---

## What's inside

Five tools, exposed over stdio:

| Tool | What it does |
| --- | --- |
| `search_defi_ux` | Free-text search across the entire corpus (rubric, patterns, glossary). Use as the entry point when you don't know the slug. |
| `get_rubric` | Returns the eight-area DeFi UX rubric. Optionally filter to a single area. |
| `get_pattern` | Returns named DeFi UX patterns. Filter by slug, category, or rubric area. |
| `get_glossary_entry` | Returns a cognitive-bias / heuristic entry with its DeFi-specific manifestation. |
| `list_categories` | Returns the structure of the entire corpus — useful as a first call to discover what's available. |

The free-tier corpus ships with:

- The full **8-area DeFi UX rubric** (`cognitive-bias-resistance`, `risk-disclosure`, `transaction-confirmation`, `fee-slippage-transparency`, `error-failure-states`, `onboarding-first-tx`, `novice-expert-split`, `mobile-ux`)
- **10 named patterns** spanning onboarding, transactions, risk, wallets, trading, errors, and novice/expert splits
- **5 cognitive-bias glossary entries** (anchoring, loss aversion, action bias, framing effect, choice overload) with DeFi-specific manifestations and design levers

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

You can also configure your MCP client to do this automatically (see below).

---

## Configure in Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

After publishing to npm, this becomes:

```json
{
  "mcpServers": {
    "raygroup-defi-ux": {
      "command": "npx",
      "args": ["-y", "@raygroup/defi-ux-mcp"]
    }
  }
}
```

Restart Claude Desktop. The five tools appear under the MCP icon.

---

## Configure in Cursor

In Cursor, go to **Settings → MCP → Add new MCP Server** and use:

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

Or, in `~/.cursor/mcp.json` for global access across projects.

---

## Configure in Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.raygroup-defi-ux]
command = "node"
args = ["/absolute/path/to/raygroup-defi-ux-mcp/dist/index.js"]
```

---

## Try it

Once configured, ask your AI client things like:

- *"Score this DeFi protocol against the Ray Group DeFi UX rubric."*
- *"What named patterns does Ray Group recommend for transaction confirmation UX?"*
- *"Look up the Ray Group glossary entry for anchoring and apply it to this slippage settings screen."*
- *"Search the Ray Group DeFi UX corpus for everything related to wallet onboarding."*

The agent will call into the MCP server, retrieve the relevant entries, and ground its analysis in the Ray Group framework.

---

## Inspect the server interactively

The MCP team ships an inspector that's great for debugging:

```bash
npm run inspect
```

This launches the MCP Inspector against this server, lets you call every tool by hand, and shows the raw JSON-RPC traffic.

---

## What's coming in the premium tier

- **Extended corpus** — 50+ named patterns with named-protocol references; 30+ glossary entries
- **`audit_screenshot`** — submit a screenshot, receive a structured rubric-aligned audit
- **`audit_protocol`** — submit a protocol URL, receive a multi-page audit
- **Case studies** — anonymised Ray Group audit findings, indexed by protocol type
- **API-key auth + hosted transport** — so you can use it from cloud-hosted agents, not just locally

Premium tier ships with a paid MCP API key and an account on [raygroup.uk/products/defi-ux-mcp](https://raygroup.uk/products/defi-ux-mcp/). The free tier above stays free, forever.

---

## License

MIT. See [LICENSE](./LICENSE).

## Author

Built and maintained by [Ray Group](https://raygroup.uk) — an independent UK-based product practice grounded in human-computer interaction. Founder: [Madalina Raicu](https://www.linkedin.com/in/madalinaraicu) — Senior UX Engineer specialised in HCI; international speaker on UX in Web3 and DeFi.

Issues, PRs, and content suggestions welcome at [github.com/raygroup/raygroup-defi-ux-mcp](https://github.com/raygroup/raygroup-defi-ux-mcp).
