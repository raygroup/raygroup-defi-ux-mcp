# Giving AI Agents a Real Framework for DeFi UX

### Why I open-sourced the rubric, named patterns, and cognitive-bias glossary I use in Ray Group audits — as a Model Context Protocol server that plugs into Claude, Cursor, and Codex.

---

If you've ever asked an LLM to "review the UX of this DeFi protocol," you already know the failure mode.

It will tell you to add tooltips. It will recommend "clearer error messages." It will suggest a "better onboarding flow." It will, on a good day, mention contrast ratios. None of which is wrong, exactly. All of which is useless if your product is a perpetuals exchange where a mis-clicked leverage slider can liquidate someone's mortgage.

The problem isn't that the model is bad. The problem is that it's been trained on every UX article ever written, and 99.9% of those articles are about SaaS dashboards and e-commerce checkouts. So when you ask it about DeFi, it averages over its corpus and gives you the SaaS-checkout median answer. Tooltips. Clearer copy. Better onboarding.

DeFi UX isn't SaaS UX with crypto wallpaper. It's a different discipline, and it deserves to be treated as one — by humans, and now by the AI agents we increasingly let touch our products.

So I built an MCP server.

---

## What I shipped

[`@raygroup/defi-ux-mcp`](https://github.com/raygroup/raygroup-defi-ux-mcp) is a small, focused Model Context Protocol server that exposes — over stdio, in any MCP-compatible AI client — the framework Ray Group actually uses when we run a DeFi UX audit.

That framework is three things:

1. **An 8-area scoring rubric** with weighted areas, criteria, evidence prompts, and common anti-patterns.
2. **A library of named DeFi UX patterns** — recurring solutions we've seen ship well in production (or fail loudly when absent).
3. **A cognitive-bias glossary** that connects each bias to its DeFi-specific manifestation and to design levers that counter it.

It's the spine of the talks I've given at EthCC, ETH Prague, and ETH Milan. It's what we hand junior auditors at Ray Group on day one. And it's now five MCP tools that any agent can call:

| Tool                 | Purpose                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| `search_defi_ux`     | Free-text search across the entire corpus. The natural entry point.             |
| `get_rubric`         | Returns the eight-area rubric, optionally filtered to one area.                 |
| `get_pattern`        | Returns named patterns by slug, by category, or by rubric area.                 |
| `get_glossary_entry` | Returns a cognitive-bias entry with its DeFi manifestation.                     |
| `list_categories`    | Returns the structure of the corpus — the right first call for a curious agent. |

Five tools, one stdio transport, zero dependencies beyond the MCP SDK. You install it once and Claude, Cursor, or Codex stop guessing.

---

## Why DeFi UX is its own discipline

Before I show you what's in the corpus, here's why a generic UX framework can't carry the weight.

**The cost of a single mistake is unbounded.** A misclick in Spotify costs you thirty seconds of the wrong song. A misclick in a DEX swap with 50% slippage costs you half your trade. A misclick on a cross-chain bridge with a malicious approval costs you everything in the wallet, retroactively. UX heuristics built for low-consequence environments — "reduce friction," "remove confirmation dialogs," "one-click everything" — actively harm users in this one.

**Recovery is rare.** Most product UX has an undo. Most DeFi UX doesn't. This single fact reorients the entire design problem around what happens _before_ the signing prompt, not what happens after the click.

**The same screen serves a 22-year-old who's never used a wallet and a quant who's running 400 trades a day.** A consumer product can pick a persona. A DeFi product almost never can.

**Risk is everywhere, and the legal language is useless.** "Past performance does not guarantee future results" is a risk disclosure that survives a court case and dies in the user's brain. It is technically present and cognitively absent.

**The user's wallet is part of the UI, and you don't control it.** The pre-signing summary is the last surface where the protocol can speak; after that, MetaMask / Rainbow / Phantom takes over and renders raw calldata according to its own rules. Most protocols simply abandon the user at this boundary.

A generic UX framework can't reason about any of this. It doesn't have hooks for it. The Ray Group rubric is shaped specifically around it.

---

## What's in the corpus

### The rubric — eight weighted areas

```
cognitive-bias-resistance      (weight 1.5)
risk-disclosure                (weight 1.4)
onboarding-first-tx            (weight 1.4)
transaction-confirmation       (weight 1.3)
fee-slippage-transparency      (weight 1.2)
error-failure-states           (weight 1.2)
mobile-ux                      (weight 1.1)
novice-expert-split            (weight 1.0)
```

The weights are deliberate. **Cognitive bias resistance is rated highest** because it's the area with the largest leverage and the smallest amount of useful generic literature. Default values, framing choices, and asymmetric visual treatments shape user behaviour more than any onboarding tooltip ever will, and almost no protocol audits its product for them. Risk disclosure and onboarding follow closely because failures in either area amputate the funnel.

Each area ships with criteria phrased as falsifiable claims, and each criterion has an _evidence prompt_ — an instruction for what to actually do to verify it. So instead of:

> "Make sure error messages are helpful."

The rubric says:

> **`error-attribution`**: Errors are attributed correctly (was this the wallet, the network, the protocol, the user's balance?) with appropriate next-action affordance.
>
> **Evidence**: Force three different failure modes (wrong network, insufficient gas, denied signature) and read each error message. Does it tell the user what went wrong and what to do next?

That's the pattern across all 8 areas. Falsifiable claim + a way to test it.

### The named patterns

Naming things matters. A team that has a name for _"transaction replacement tracking"_ can argue about whether it's implemented well. A team that doesn't has the same conversation in three meetings without realising they're talking about the same thing.

The v1 corpus ships with 10 patterns:

- **Pre-signing calldata translation** — render product-native intent before the wallet popup, not after.
- **Slippage tier with explicit output range** — replace a bare `0.5%` field with tiers showing minimum-received in tokens and fiat.
- **Wallet connect with fund-with-fiat fallback** — never let a zero-balance wallet dead-end into a generic "insufficient funds" error.
- **Transaction replacement tracking** — when the user speeds up a tx in their wallet, follow the new hash, don't spin on the original.
- **Risk banner severity tiers** — info / caution / danger / blocking, mapped consistently across the entire product.
- **Embedded wallet self-custody disclosure** — say what you mean about who holds the keys, at provisioning time, not later.
- **Scoped token approval** — approve the amount you need, not `uint256.max`, by default.
- **First-tx progress indicator** — connect → fund → approve → sign → confirm, lit up step-by-step for first-time users only.
- **Network mismatch recovery** — inline "Switch to [chain]" affordance, not a wallet error.
- **Expert keyboard shortcuts** — first-class, no Pro mode required.

Each pattern is more than a name. The MCP returns _when to use it_, _how it works_, the _anti-pattern it replaces_, and the _rubric areas it scores against_ — so an agent can both recommend it in context and explain why.

### The cognitive-bias glossary

This is the section I think most about.

Most DeFi UX failures, in my experience, are not engineering failures or visual-design failures. They're cognitive-bias failures the team didn't realise they were shipping. So the glossary connects each bias to its DeFi manifestation and to specific design levers.

For example, **anchoring**:

> _People estimate values by adjusting away from a reference point — and they don't adjust enough._
>
> **DeFi manifestation**: Default slippage values anchor user expectations of acceptable price impact. Default leverage anchors expectations of normal position sizing. Suggested gas tier anchors what 'reasonable speed' costs. The numbers a protocol picks for these defaults shape user behaviour far more than any onboarding copy ever will.
>
> **Design levers**:
>
> - Pick defaults that protect the median user, not maximise short-term protocol revenue.
> - Make the source of every default visible (e.g. "Default 0.5% — covers 95% of trades on this pair").
> - Surface the alternatives at decision time, not behind a settings menu the user never opens.

The free tier ships with five entries — anchoring, loss aversion, action bias, framing effect, and choice overload — chosen because each one has the highest base-rate impact on financial-product decisions. The premium tier expands this to 30+ with named-protocol case studies.

---

## Why MCP is the right surface

I considered three other shapes before MCP.

**A static document.** Already exists. It's the rubric I hand clients. Problem: an LLM that has read it once still defaults to the SaaS-checkout median answer, because the rubric isn't in its working context unless you keep pasting it.

**A REST API.** Works, but it puts a network hop and an auth flow between the agent and the framework. If the LLM doesn't know to call it, it won't.

**A custom plugin per tool (Claude plugin, Cursor extension, etc.).** Maintenance nightmare. Each new client = new shim.

MCP solves all three. The agent discovers the tools at session start. It calls them by name when relevant. The corpus lives in process; calls are zero-latency. And it works in any client that speaks MCP, which by 2026 is "all of the serious ones." One repo, one server, every client.

The implementation is intentionally boring. ~130 lines of stdio-transport plumbing, five handler files, three data files. Anyone who's looked at an MCP server before will recognise every line:

```ts
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      searchDefiUxTool,
      getRubricTool,
      getPatternTool,
      getGlossaryEntryTool,
      listCategoriesTool,
    ],
  };
});
```

The interesting work isn't the protocol code. It's the corpus.

---

## How to use it

Once you've configured it in your MCP client (Claude Desktop, Cursor, or Codex CLI — all three are supported, instructions in the [README](https://github.com/raygroup/raygroup-defi-ux-mcp)), the agent picks up five tools automatically and you talk to it in English. Some prompts I find genuinely useful:

> _"Score this protocol's swap flow against the Ray Group rubric. For each of the eight areas, cite the criterion and tell me what evidence you have."_

> _"What named pattern does Ray Group recommend for the situation where a user's wallet is on the wrong chain? Walk me through the implementation."_

> _"My team is arguing about whether to default to unlimited token approvals to reduce signing friction. Look up the relevant Ray Group entries — both the pattern and the glossary — and lay out the trade-off."_

> _"Pull up the Ray Group glossary entry for anchoring. Apply it specifically to the slippage settings on this screen and tell me which design levers I'm pulling and which I'm leaving on the floor."_

The agent calls into the MCP, retrieves the relevant entries, and grounds its analysis in a published, opinionated framework instead of the SaaS-checkout median. Same model, dramatically different output.

I've found it most useful in two situations: **PR review** (paste a Figma frame or a code diff, ask the agent to score it against `transaction-confirmation`) and **early-stage design critique** (paste a wireframe, ask "which named patterns does this need").

---

## What's next

The free tier above stays free, forever. The corpus on GitHub is MIT-licensed. PRs and content suggestions are welcome.

The premium tier (in beta — waitlist at [raygroup.uk/products/defi-ux-mcp](https://raygroup.uk/products/defi-ux-mcp/)) extends the corpus and adds two new tools:

- **`audit_screenshot`** — submit a screenshot, receive a structured rubric-aligned audit.
- **`audit_protocol`** — submit a protocol URL, receive a multi-page audit with named-protocol comparisons.
- **Extended corpus** — 50+ named patterns and 30+ glossary entries, each with named-protocol references and case studies anonymised from Ray Group audits.
- **Hosted transport + API-key auth** — for agents that aren't running on your laptop.

If you ship a DeFi product, build agentic tooling that touches DeFi UX, or run a design team that wants the same framework in everyone's hands, the premium tier is for you. If you're a solo dev tinkering with an MCP-enabled IDE on a side project — the free tier is plenty, and I'd rather you used it.

---

## Why I'm doing this

Two reasons.

The first is selfish: the median DeFi protocol I audit could be 30% better in a week if its design team had a shared vocabulary for the patterns they ship. Naming things is the cheapest, highest-leverage tool we have. Putting the framework into every agent that touches the codebase means the conversation happens at PR time, not at audit time.

The second is structural: AI agents are going to shape an increasing share of the design decisions that ship into financial products. They are going to do it whether or not we give them grounded, opinionated, falsifiable frameworks to reason against. I would rather they reasoned against a published, contestable rubric than against the unweighted average of every UX article on the internet.

If you ship a Web3 product, install it. If you disagree with the rubric, open an issue — half the value of naming a pattern is having something concrete to argue with. If you're at the next ETH conference, come find me; I'll probably be on stage talking about whichever entry you opened the issue against.

The repo is at [github.com/raygroup/raygroup-defi-ux-mcp](https://github.com/raygroup/raygroup-defi-ux-mcp). The product page is at [raygroup.uk/products/defi-ux-mcp](https://raygroup.uk/products/defi-ux-mcp/). The framework is the spine of every Ray Group audit and now of any AI agent you choose to point at it.

Tooltips are not the answer.

---

_Madalina Raicu is the founder of [Ray Group](https://raygroup.uk) — an independent UK-based product practice grounded in human-computer interaction. Senior UX Engineer specialised in HCI; international speaker on UX in Web3 and DeFi (EthCC, ETH Prague, ETH Milan)._
