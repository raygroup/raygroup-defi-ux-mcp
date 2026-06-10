/**
 * Named DeFi UX patterns — the v1 free-tier corpus.
 *
 * Each pattern is a recurring solution Ray Group has seen ship well in
 * production (or seen fail when absent). Premium tier extends each entry with
 * named-protocol references, code snippets, and Figma examples.
 */

export type Pattern = {
  slug: string;
  name: string;
  category:
    | "onboarding"
    | "transaction"
    | "risk"
    | "wallet"
    | "trading"
    | "error"
    | "novice-expert";
  summary: string;
  whenToUse: string;
  howItWorks: string;
  antiPattern: string;
  rubricAreas: string[];
};

export const patterns: Pattern[] = [
  {
    slug: "pre-signing-calldata-translation",
    name: "Pre-signing calldata translation",
    category: "transaction",
    summary:
      "Before triggering the wallet's signing prompt, render a product-native summary of what the user is about to sign — function name in plain language, magnitudes in user terms, addresses verifiable.",
    whenToUse:
      "Any flow where the user signs a transaction whose calldata is not self-evidently meaningful (which, in DeFi, is almost all of them).",
    howItWorks:
      "Decode the calldata client-side using the protocol's ABI. Render a summary screen with: action verb in plain English, token/amount being moved, counterparty address (with explorer link), expected outcome, and any approvals being granted. The wallet prompt then becomes a confirmation of *that* summary, not the user's first encounter with the action.",
    antiPattern:
      "Sending the user straight to the wallet popup with raw hex calldata as their only source of truth about what the transaction does. The wallet then becomes the entire signing UI, which is wallet-vendor-specific and outside protocol control.",
    rubricAreas: ["transaction-confirmation", "cognitive-bias-resistance"],
  },
  {
    slug: "slippage-tier-with-output-range",
    name: "Slippage tier with explicit output range",
    category: "trading",
    summary:
      "Replace a single slippage percentage input with a tiered control (Low / Default / High / Custom) that, for each tier, displays the resulting expected and minimum-received output.",
    whenToUse:
      "Any swap, trade, or liquidity provision flow where slippage tolerance affects the final output amount.",
    howItWorks:
      "Render three tiers (e.g. 0.1%, 0.5%, 1%) plus a custom field. For each tier, compute and display the expected output and the minimum guaranteed output, both in token units and in fiat-equivalent. The user picks the tier visually, anchored by output amounts rather than abstract percentages.",
    antiPattern:
      "A bare input field labelled 'Slippage tolerance (%)' with no associated output range. The user has no way to evaluate whether 0.5% vs. 1% matters for their trade size.",
    rubricAreas: ["fee-slippage-transparency", "cognitive-bias-resistance"],
  },
  {
    slug: "wallet-connect-with-fund-fallback",
    name: "Wallet connect with fund-with-fiat fallback",
    category: "onboarding",
    summary:
      "When a user connects a wallet with zero balance, surface a fund-with-fiat option immediately rather than allowing them to attempt and fail an action.",
    whenToUse:
      "Any product that gates feature access behind on-chain balance — which is most of DeFi.",
    howItWorks:
      "On wallet connection, check balance. If zero (or below the gas threshold for the next likely action), show an inline 'You'll need to fund this wallet to continue' affordance with a clear on-ramp option, expected timing, and expected fee. The user is not allowed to dead-end into 'transaction failed: insufficient balance'.",
    antiPattern:
      "Letting the user click through the entire trade flow and only discovering the wallet is empty at the moment of signing, then showing a generic 'insufficient funds' error.",
    rubricAreas: ["onboarding-first-tx", "error-failure-states"],
  },
  {
    slug: "tx-replacement-tracking",
    name: "Transaction replacement tracking",
    category: "transaction",
    summary:
      "When a user speeds up, cancels, or otherwise replaces a transaction in their wallet, the UI follows the new transaction hash automatically rather than waiting on the original.",
    whenToUse:
      "Any product that displays pending-transaction state to the user.",
    howItWorks:
      "Subscribe to wallet events (or poll) for transaction replacement. When the user replaces a tx in MetaMask / Rainbow / Phantom, capture the new hash and update the pending UI to track the replacement. Show a small affordance ('You sped this up — now tracking 0x...') so the user knows the protocol noticed.",
    antiPattern:
      "App stuck spinning on the original hash forever after the user has clearly moved on. User reloads the page; the app re-shows the same stale state.",
    rubricAreas: ["error-failure-states", "transaction-confirmation"],
  },
  {
    slug: "risk-banner-severity-tiers",
    name: "Risk banner severity tiers",
    category: "risk",
    summary:
      "Establish a small, consistent set of visual severity tiers for warnings (e.g. info / caution / danger / blocking), and never use the same treatment for two semantically different severities.",
    whenToUse:
      "Any product surface with more than one type of warning — which, again, is most of DeFi.",
    howItWorks:
      "Define tiers in the design system: info (blue, low-emphasis), caution (amber, medium-emphasis), danger (red, high-emphasis with explicit acknowledgement), blocking (red, modal with copy-confirmation). Map every warning in the product to a tier explicitly. Audit periodically that no two tiers look interchangeable.",
    antiPattern:
      "Identical visual treatment for 'this token is unverified' and 'transaction is taking longer than usual'. The user cannot tell which warnings to act on.",
    rubricAreas: ["risk-disclosure", "cognitive-bias-resistance"],
  },
  {
    slug: "embedded-wallet-self-custody-disclosure",
    name: "Embedded wallet self-custody disclosure",
    category: "wallet",
    summary:
      "When using social-login-provisioned embedded wallets (Privy / Fun.xyz / Web3Auth-style), explicitly disclose at provisioning time whether the user is in self-custody, what recovery options exist, and what happens if they lose access to the social login.",
    whenToUse:
      "Any onboarding flow that creates a wallet on the user's behalf via social login or magic link.",
    howItWorks:
      "At the moment of wallet provisioning, render a brief disclosure: who custodies the keys (you, the embedded-wallet provider, or a multi-party setup), how recovery works, and what happens if the user loses access to the social account. Offer an export-keys path for users who want full self-custody.",
    antiPattern:
      "Provisioning a wallet silently behind a 'Continue with Google' button with no disclosure about custody, then surprising the user later when they discover they can't move funds elsewhere.",
    rubricAreas: ["onboarding-first-tx", "risk-disclosure"],
  },
  {
    slug: "scoped-token-approval",
    name: "Scoped token approval",
    category: "transaction",
    summary:
      "Default ERC-20 approvals to the exact amount needed for the next transaction, not to uint256.max — even though unlimited approvals reduce future signing friction.",
    whenToUse:
      "Any flow that requires the user to approve a token before a contract can spend it on their behalf.",
    howItWorks:
      "When triggering an approval, default the approved amount to the amount needed for the immediately following transaction. Optionally offer an explicit 'Approve unlimited' affordance for power users, with a brief disclosure of why this is convenient and what it costs in risk surface.",
    antiPattern:
      "Always requesting unlimited approvals to save the user a future signing step, without explaining the security trade-off.",
    rubricAreas: ["transaction-confirmation", "risk-disclosure"],
  },
  {
    slug: "first-tx-progress-indicator",
    name: "First-tx progress indicator",
    category: "onboarding",
    summary:
      "On a new user's first transaction, render an explicit step-by-step progress indicator showing connect → fund → approve → sign → confirm, so they know how far they are and what's next.",
    whenToUse:
      "First-tx flows for users who have never used the protocol (and may not have used DeFi before).",
    howItWorks:
      "Detect first-time users (no prior transactions from this address on this protocol) and render an inline progress indicator on the trade / mint / stake form. Each step lights up as completed; the user can see the road ahead. Hide the indicator on subsequent transactions for the same user.",
    antiPattern:
      "Treating every transaction the same way — sophisticated user and first-time user both get the same blank form, both have to figure out the steps, only one of them already knows.",
    rubricAreas: ["onboarding-first-tx", "novice-expert-split"],
  },
  {
    slug: "network-mismatch-recovery",
    name: "Network mismatch recovery",
    category: "error",
    summary:
      "When the user's wallet is on the wrong chain, render an inline switch-network affordance — never silently fail the transaction or send the user to find their wallet's network selector.",
    whenToUse:
      "Any product that operates on a specific chain (or chains) where the user's wallet may be on a different chain.",
    howItWorks:
      "On every transaction-initiating button, check the wallet's current chain against the required chain. If they differ, the button switches to a 'Switch to [chain]' state and triggers the wallet's network-switch flow on click. After the switch, the original action proceeds automatically without the user re-clicking.",
    antiPattern:
      "Letting the user click the trade button while on the wrong network, getting an opaque wallet error, and being left to figure out what 'wrong network' means and how to fix it.",
    rubricAreas: ["error-failure-states", "onboarding-first-tx"],
  },
  {
    slug: "expert-keyboard-shortcuts",
    name: "Expert keyboard shortcuts",
    category: "novice-expert",
    summary:
      "Provide first-class keyboard shortcuts for high-frequency power-user actions (place order, cancel order, switch market, set position size by percentage of balance) that don't require entering any 'Pro' mode to access.",
    whenToUse:
      "Trading and position-management UIs where the same actions are repeated dozens of times per session by power users.",
    howItWorks:
      "Bind a small set of unambiguous shortcuts: B/S for buy/sell, ESC to cancel a pending action, 1–9 to set position size as 10–90% of balance, arrow keys to step through markets. Document them inline (a small `?`-keyed shortcut sheet). Keep them invisible to novices, who never press the keys.",
    antiPattern:
      "Forcing power users to mouse-click everything, or hiding shortcuts behind a 'Pro mode' toggle that fragments the UI.",
    rubricAreas: ["novice-expert-split"],
  },
];

export function getPattern(slug: string): Pattern | undefined {
  return patterns.find((p) => p.slug === slug);
}

export function listPatternSlugs(): string[] {
  return patterns.map((p) => p.slug);
}

export function patternsByCategory(category: Pattern["category"]): Pattern[] {
  return patterns.filter((p) => p.category === category);
}

export function patternsByRubricArea(rubricSlug: string): Pattern[] {
  return patterns.filter((p) => p.rubricAreas.includes(rubricSlug));
}
