# Ray Group DeFi UX MCP Server

An [MCP server](https://modelcontextprotocol.io) that gives AI agents direct access to the Ray Group DeFi UX rubric, named patterns, cognitive-bias glossary, and (with Pro) named-protocol case studies — the same framework used in Ray Group's audits and taught at EthCC, ETH Prague, and ETH Milan.

Use it in Claude Desktop, Cursor, Codex, or any other MCP-compatible AI client to ground UX assessments in a published, opinionated framework rather than generic advice.

> **Status:** v0.2.
> **Free tier:** 8-area rubric, 10 named patterns, 5 glossary entries — installable today, MIT-licensed, runs locally over stdio, no account, no network.
> **Pro tier ($29/mo · $290/yr):** 50+ named patterns with protocol references (Uniswap, Aave, dYdX, GMX, Hyperliquid), 30+ glossary entries, named-protocol case studies via `get_case_study`. Unlock by setting `RAYGROUP_API_KEY` in your client config. Buy at [raygroup.uk/products/defi-ux-mcp/pricing](https://raygroup.uk/products/defi-ux-mcp/pricing/).


<img width="1536" height="1024" alt="agentic-development-header" src="https://github.com/user-attachments/assets/aee77f89-8724-4083-aef3-20a4da370ffb" />

---

## What's inside

Six tools, exposed over stdio:

| Tool                 | Free | Pro | What it does                                                                                                                 |
| -------------------- | :--: | :-: | ---------------------------------------------------------------------------------------------------------------------------- |
| `search_defi_ux`     |  ✓   |  ✓  | Free-text search across the entire corpus (rubric, patterns, glossary).                                                      |
| `get_rubric`         |  ✓   |  ✓  | Returns the eight-area DeFi UX rubric. Optionally filter to a single area.                                                   |
| `get_pattern`        |  ✓   |  ✓  | Returns named DeFi UX patterns. Pro returns the extended set (50+) with named-protocol references.                           |
| `get_glossary_entry` |  ✓   |  ✓  | Returns a cognitive-bias / heuristic entry. Pro returns the extended set (30+).                                              |
| `get_case_study`     |      |  ✓  | Pro only. Returns anonymised or named-protocol DeFi UX case studies. Without a Pro key it returns an upgrade prompt.         |
| `list_categories`    |  ✓   |  ✓  | Returns the structure of the entire corpus — useful as a first call to discover what's available.                            |

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

To unlock Pro, add the env block with your key (you'll receive it by email after purchase at [raygroup.uk/products/defi-ux-mcp/pricing](https://raygroup.uk/products/defi-ux-mcp/pricing/)):

```json
{
  "mcpServers": {
    "raygroup-defi-ux": {
      "command": "npx",
      "args": ["-y", "@raygroup/defi-ux-mcp"],
      "env": {
        "RAYGROUP_API_KEY": "rg_live_xxxxxxxxxxxx"
      }
    }
  }
}
```

Restart Claude Desktop. The six tools appear under the MCP icon. The server prints `Free tier` or `Pro tier` to stderr on startup so you can verify activation.

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

- _"Score this DeFi protocol against the Ray Group DeFi UX rubric."_
- _"What named patterns does Ray Group recommend for transaction confirmation UX?"_
- _"Look up the Ray Group glossary entry for anchoring and apply it to this slippage settings screen."_
- _"Search the Ray Group DeFi UX corpus for everything related to wallet onboarding."_

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
