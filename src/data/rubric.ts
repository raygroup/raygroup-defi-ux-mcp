/**
 * The Ray Group DeFi UX Rubric.
 *
 * Eight scored areas, each with criteria and evidence prompts. The rubric is
 * the spine of every Ray Group DeFi UX audit and the framework taught in the
 * EthCC, ETH Prague, and ETH Milan talks.
 *
 * v1 — free tier. Premium tier (paid) extends each area with deeper criteria,
 * more anti-patterns, and named-protocol references.
 */

export type RubricCriterion = {
  id: string;
  text: string;
  evidence: string;
};

export type RubricArea = {
  slug: string;
  title: string;
  weight: number;
  summary: string;
  criteria: RubricCriterion[];
  commonAntiPatterns: string[];
};

export const rubric: RubricArea[] = [
  {
    slug: "cognitive-bias-resistance",
    title: "Cognitive bias resistance",
    weight: 1.5,
    summary:
      "How well the interface anticipates and counteracts the cognitive shortcuts users bring to financial products — anchoring, loss aversion, action bias, recency bias, framing effects, and the rest. The single highest-leverage area in DeFi UX, because the cost of a single mis-clicked transaction is unbounded.",
    criteria: [
      {
        id: "framing-symmetry",
        text: "Gains and losses are framed with consistent magnitudes and signs (no asymmetric green/red scaling, no hidden percentage vs. absolute switches).",
        evidence:
          "Compare how a +5% move and a -5% move are rendered side-by-side. Look for visual weight, colour intensity, decimal-place differences, and whether absolute vs. percentage framing is consistent.",
      },
      {
        id: "anchor-explicitness",
        text: "Default values and reference prices are visibly anchored (the user knows what they're being primed with) and adjustable.",
        evidence:
          "Identify every default value in the interface (slippage, position size, leverage, etc.). For each, check whether the source of the default is shown and whether changing it is one click away.",
      },
      {
        id: "action-bias-friction",
        text: "Irreversible or high-impact actions have non-trivial confirmation friction proportional to consequence severity.",
        evidence:
          "Map every irreversible action in the product. Check that confirmation difficulty (clicks, copy-confirm, time delay) scales with downside risk, not just transaction value.",
      },
      {
        id: "recency-disclosure",
        text: "Time-windowed metrics (24h volume, 7d returns, etc.) explicitly state their windows and refresh cadence rather than implying current truth.",
        evidence:
          "List every percentage / number on every screen and check whether its time-window is labelled clearly. Bonus: whether the user can change the window.",
      },
    ],
    commonAntiPatterns: [
      "Bigger / brighter colour for gains than for equivalent losses (or vice versa, depending on which the protocol benefits from).",
      "Default slippage values shown without explaining what slippage is or what the default means in context.",
      "One-click swap on irreversible cross-chain actions with the same friction as a token approval.",
      "Headline 'returns' figures that quietly use cherry-picked time windows.",
    ],
  },
  {
    slug: "risk-disclosure",
    title: "Risk disclosure clarity",
    weight: 1.4,
    summary:
      "Whether risks are disclosed in language users actually parse — not buried in T&Cs, not euphemised into invisibility, not legally watertight but cognitively useless. Disclosure that lives in the interaction, not in a footer.",
    criteria: [
      {
        id: "plain-language",
        text: "Risk warnings are rendered in plain English (or plain user-language) with the legal text optionally available below, not above.",
        evidence:
          "Read every risk warning out loud as a sceptical user. Could a 25-year-old non-finance user explain what the risk is in their own words after seeing it once?",
      },
      {
        id: "in-flow-not-once",
        text: "Risk disclosures appear adjacent to the relevant action (signing, sizing, leveraging) rather than only at first onboarding.",
        evidence:
          "Map risk disclosures against the funnel. Do they appear at the moment of decision, or only at sign-up where users have no context?",
      },
      {
        id: "severity-tiers",
        text: "Visual severity tiers are consistent (a high-severity warning never looks like an info tooltip, and vice versa).",
        evidence:
          "Catalogue every banner, tooltip, modal, and warning in the product. Group them by visual treatment. Check that visual treatment maps consistently to risk severity.",
      },
    ],
    commonAntiPatterns: [
      "All risks shown once at onboarding behind a 'I understand' checkbox, never surfaced again.",
      "Visually identical treatment for 'this token contract is unverified' and 'this transaction is taking longer than usual'.",
      "Warnings that say 'past performance does not guarantee future results' without explaining what the actual mechanism of risk is.",
    ],
  },
  {
    slug: "transaction-confirmation",
    title: "Transaction confirmation UX",
    weight: 1.3,
    summary:
      "The pre-signing screen — where users decide whether to commit. The single most consequential surface in DeFi, because once signed, recovery is rarely possible.",
    criteria: [
      {
        id: "calldata-translation",
        text: "Raw calldata is translated into human-readable summaries (function name, parameters in user terms) at signing time.",
        evidence:
          "Initiate three different transactions and look at what the wallet popup actually shows. Is the user being asked to verify hex, or to verify intent?",
      },
      {
        id: "pre-signing-summary",
        text: "Before the wallet prompt, a pre-signing summary screen restates the action in product-native language with magnitudes, addresses, and approvals visible.",
        evidence:
          "Compare what the protocol shows the user immediately before triggering the wallet prompt. Does it match what the wallet then shows? Are token addresses verifiable?",
      },
      {
        id: "approval-scope",
        text: "Token approvals are scoped to the minimum necessary amount (or clearly distinguish unlimited approvals with explicit consent).",
        evidence:
          "Trigger any flow that requires an ERC-20 approval. Check the approval amount in the wallet prompt — is it bounded, or unlimited (uint256.max)?",
      },
    ],
    commonAntiPatterns: [
      "Sending the user straight to a wallet popup with raw calldata and no in-product summary.",
      "Always requesting unlimited approvals when bounded approvals would work.",
      "Using protocol-native jargon ('execute_lp_position') in the pre-signing summary instead of user-native terms.",
    ],
  },
  {
    slug: "fee-slippage-transparency",
    title: "Fee and slippage transparency",
    weight: 1.2,
    summary:
      "How clearly the user understands what they're paying — gas, protocol fees, slippage tolerance, MEV exposure. Each of these is a place where opacity converts directly into user-against-protocol asymmetry.",
    criteria: [
      {
        id: "fee-itemisation",
        text: "Fees are itemised by source (network gas vs. protocol vs. integrator) rather than shown as a single opaque number.",
        evidence:
          "Trigger a swap or trade. Examine the fee breakdown — can you tell which portion is gas, which is protocol, which is router/aggregator?",
      },
      {
        id: "slippage-context",
        text: "Slippage is presented with a visible expected vs. minimum-received amount, not just a percentage figure.",
        evidence:
          "Set a 1% slippage tolerance on a trade and check whether the UI shows expected output, minimum guaranteed output, and the consequence of choosing 1% vs. 0.1%.",
      },
      {
        id: "mev-disclosure",
        text: "MEV exposure is acknowledged or mitigated; the user can tell whether the order will go through a public mempool.",
        evidence:
          "On a trade: is there any indication of whether the order is exposed to public mempool MEV? Does the protocol offer private mempool / RPC options?",
      },
    ],
    commonAntiPatterns: [
      "Single 'fees' line item that bundles network + protocol + integrator fees opaquely.",
      "Slippage shown only as a percentage, with no resulting absolute output range.",
      "No mention of MEV at all on a high-value trade UI.",
    ],
  },
  {
    slug: "error-failure-states",
    title: "Error and failure states",
    weight: 1.2,
    summary:
      "How the product handles the dozen ways a Web3 transaction can fail — wrong network, insufficient balance, denied signature, replaced transaction, RPC timeout, frontrun, slippage exceeded. Most DeFi UX dies in error states.",
    criteria: [
      {
        id: "error-attribution",
        text: "Errors are attributed correctly (was this the wallet, the network, the protocol, the user's balance?) with appropriate next-action affordance.",
        evidence:
          "Force three different failure modes (wrong network, insufficient gas, denied signature) and read each error message. Does it tell the user what went wrong and what to do next?",
      },
      {
        id: "recoverability",
        text: "Failed actions can be retried with state preserved, not requiring the user to re-enter all parameters.",
        evidence:
          "Trigger a failure mid-flow. After the error, is the user dropped back to a populated retry state, or do they have to re-enter inputs from scratch?",
      },
      {
        id: "tx-replacement-feedback",
        text: "When a transaction is sped up, cancelled, or replaced, the UI reflects the new transaction's state — not the original's.",
        evidence:
          "Submit a transaction, then in the wallet 'speed up'. Does the protocol UI follow the replacement, or get stuck waiting on the original hash?",
      },
    ],
    commonAntiPatterns: [
      "'Transaction failed. Please try again.' as the totality of error UI.",
      "Modal dismisses on error and returns the user to an empty form.",
      "App stuck spinning on the original hash after the user replaces the transaction in their wallet.",
    ],
  },
  {
    slug: "onboarding-first-tx",
    title: "Onboarding and first-tx conversion",
    weight: 1.4,
    summary:
      "From landing page to first signed transaction — the journey where most Web3 products lose 80%+ of interested users. Drops in this funnel are mostly UX problems, not product problems.",
    criteria: [
      {
        id: "first-tx-time",
        text: "A new user can complete their first signed transaction within five minutes of landing.",
        evidence:
          "Time it. From landing page, with a fresh wallet (or social login), how long until first signed transaction? Note every step.",
      },
      {
        id: "wallet-choice-clarity",
        text: "Wallet choice is presented with sensible defaults; users without a wallet are not dead-ended.",
        evidence:
          "Land on the connect screen with no wallet installed. Does the product offer a path forward (social login, embedded wallet, install-and-return) or stop?",
      },
      {
        id: "fund-with-fiat-fallback",
        text: "Users without crypto are surfaced a clear fund-with-fiat path, including expected timing and cost.",
        evidence:
          "Connect with a fresh wallet at zero balance. Is the user told they need to fund the wallet, given a way to do so, and shown realistic timing?",
      },
    ],
    commonAntiPatterns: [
      "Connect-wallet wall with no path forward for users who don't already have one.",
      "Forcing wallet install before showing what the product even does.",
      "On-ramp surfaced only after a transaction fails for insufficient balance.",
    ],
  },
  {
    slug: "novice-expert-split",
    title: "Novice vs. expert pathway split",
    weight: 1.0,
    summary:
      "DeFi products almost always have to serve both first-time users and power users on the same surface. Most fail one of the two. The split is rarely about hiding features — it's about surfacing the right complexity at the right moment.",
    criteria: [
      {
        id: "default-novice-friendly",
        text: "Default presentation is novice-comprehensible (no decoded jargon, sensible defaults, optional advanced fields collapsed).",
        evidence:
          "Show the default trade / mint / stake screen to a non-DeFi user. Can they describe what would happen if they pressed the button?",
      },
      {
        id: "expert-shortcut-presence",
        text: "Power users have first-class shortcuts (keyboard, advanced fields, batch flows) without leaving the main interface.",
        evidence:
          "Identify three high-frequency power-user actions. Time how long they take. Are there shortcuts, or is the power user paying novice-tax on every action?",
      },
    ],
    commonAntiPatterns: [
      "All advanced fields hidden behind 'Advanced' tabs that contain settings the novice should still see (like slippage on a trade).",
      "Novice mode that strips out so much information the user can't make an informed choice.",
      "Separate 'Pro' product altogether, fragmenting the user base and the engineering effort.",
    ],
  },
  {
    slug: "mobile-ux",
    title: "Mobile UX",
    weight: 1.1,
    summary:
      "How well the product holds up on small viewports — where an increasing share of Web3 traffic actually comes from. Mobile DeFi UX is often the desktop UX rendered through a viewport, which is a category of bug, not a feature.",
    criteria: [
      {
        id: "responsive-layouts",
        text: "Critical flows (connect, sign, trade, deposit, withdraw) are usable on a 360px-wide viewport without horizontal scrolling.",
        evidence:
          "Open the product at 360px width and execute the critical flows. Note any flow that requires horizontal scroll or breaks layout.",
      },
      {
        id: "wallet-deeplinks",
        text: "Mobile wallet connections use deep-links / WalletConnect properly; the user is not asked to manually copy/paste between apps.",
        evidence:
          "On a mobile browser with MetaMask Mobile / Rainbow installed, attempt to connect. Does the deeplink fire and return cleanly, or is the user stranded between apps?",
      },
    ],
    commonAntiPatterns: [
      "Trading interface that requires a 1024px+ viewport with no mobile alternative.",
      "Critical buttons that fall below the fold on iPhone SE-class devices and require scroll inside a modal.",
      "WalletConnect QR shown as the *only* connect option on mobile (where the user is already on a phone).",
    ],
  },
];

export function getRubricArea(slug: string): RubricArea | undefined {
  return rubric.find((r) => r.slug === slug);
}

export function listRubricSlugs(): string[] {
  return rubric.map((r) => r.slug);
}
