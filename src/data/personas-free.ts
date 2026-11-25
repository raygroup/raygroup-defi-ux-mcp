/**
 * Free-tier persona teaser — two archetypes. Pro unlocks the full pack
 * via the hosted corpus.
 */

export type Persona = {
  slug: string;
  name: string;
  archetype: string;
  summary: string;
  goals: string[];
  fears: string[];
  skills: string[];
  failureModes: string[];
  stressQuestions: string[];
  rubricAreas: string[];
  patternSlugs: string[];
};

export const personas: Persona[] = [
  {
    slug: "novice-first-wallet",
    name: "First-wallet novice",
    archetype: "novice",
    summary:
      "Bought crypto on an exchange last week. Installing a self-custody wallet for the first time. Reads every word; freezes on jargon.",
    goals: [
      "Get a wallet set up without losing funds",
      "Complete one successful swap to prove it works",
      "Understand what 'approve' means before signing",
    ],
    fears: [
      "Sending funds to the wrong address",
      "Approving unlimited token spend by accident",
      "Being phished by a lookalike site",
    ],
    skills: ["Web forms", "Exchange buy/sell"],
    failureModes: [
      "Abandons flow at network-switch prompt",
      "Signs an unlimited approval because the button is primary",
      "Misreads slippage as a fee",
    ],
    stressQuestions: [
      "Can they reach first successful tx without leaving the product?",
      "Is every irreversible action explained in plain language before the wallet prompt?",
      "Does the UI distinguish 'this site' from 'your wallet' clearly?",
    ],
    rubricAreas: ["onboarding-first-tx", "novice-expert-split", "risk-disclosure"],
    patternSlugs: [
      "first-tx-progress-indicator",
      "wallet-connect-with-fund-fallback",
      "scoped-token-approval",
    ],
  },
  {
    slug: "active-retail-trader",
    name: "Active retail trader",
    archetype: "retail-trader",
    summary:
      "Day-trades perps and spot across two or three venues. Optimises for speed once they trust a surface; hostile to friction that feels theatrical.",
    goals: [
      "Enter and exit positions in under three taps",
      "See liquidation distance and funding at a glance",
      "Recover from failed txs without restarting the order",
    ],
    fears: [
      "Hidden slippage eating the edge",
      "Liquidation without timely warning",
      "Stale mark price during volatility",
    ],
    skills: ["Order types", "Leverage", "Reading order books"],
    failureModes: [
      "Misses a severity change when risk colours are reused inconsistently",
      "Confirms a fat-finger size because output range is buried",
      "Retries a stuck tx and doubles the position",
    ],
    stressQuestions: [
      "Is leverage risk visible before the confirm CTA, not after?",
      "Are price impact and slippage split and labelled?",
      "Can they replace or cancel an in-flight tx without leaving the ticket?",
    ],
    rubricAreas: [
      "fee-slippage-transparency",
      "transaction-confirmation",
      "risk-disclosure",
      "error-failure-states",
    ],
    patternSlugs: [
      "explicit-output-range-with-fiat-anchor",
      "price-impact-vs-slippage-split",
      "perpetuals-leverage-friction",
    ],
  },
];
