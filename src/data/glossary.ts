/**
 * Cognitive biases and heuristics applied to DeFi UX.
 *
 * v1 free tier: 5 entries spanning the most consequential biases for
 * financial product UX. Premium tier (paid) expands to 30+ entries with
 * named-protocol case studies.
 *
 * Format borrows from product-psychology glossaries like Built for Mars's
 * (https://builtformars.com/ux-glossary/) — short, named, with worked
 * examples specific to the niche.
 */

export type GlossaryEntry = {
  slug: string;
  name: string;
  category: "bias" | "heuristic" | "principle";
  oneLiner: string;
  longExplanation: string;
  defiManifestation: string;
  designLevers: string[];
  relatedRubricAreas: string[];
};

export const glossary: GlossaryEntry[] = [
  {
    slug: "anchoring",
    name: "Anchoring",
    category: "bias",
    oneLiner:
      "People estimate values by adjusting away from a reference point — and they don't adjust enough.",
    longExplanation:
      "Anchoring is the cognitive bias where the first number a person sees becomes the reference point for subsequent estimates, even when the anchor is arbitrary or irrelevant. It is one of the most consistently replicated findings in behavioural economics. In product UX, every default value, every example, and every preset is an anchor — whether the designer intended it to be or not.",
    defiManifestation:
      "Default slippage values anchor user expectations of acceptable price impact. Default leverage anchors expectations of normal position sizing. Suggested gas tier anchors what 'reasonable speed' costs. The numbers a protocol picks for these defaults shape user behaviour far more than any onboarding copy ever will.",
    designLevers: [
      "Pick defaults that protect the median user, not maximise short-term protocol revenue (e.g. lower default leverage, more conservative slippage tolerance).",
      "Make the source of every default visible (e.g. 'Default 0.5% — covers 95% of trades on this pair').",
      "Surface the alternatives at decision time, not behind a settings menu the user never opens.",
    ],
    relatedRubricAreas: [
      "cognitive-bias-resistance",
      "fee-slippage-transparency",
    ],
  },
  {
    slug: "loss-aversion",
    name: "Loss aversion",
    category: "bias",
    oneLiner:
      "Losses feel roughly twice as bad as equivalent gains feel good — so people fight harder to avoid losses than to capture gains.",
    longExplanation:
      "Loss aversion (Kahneman & Tversky's foundational result in prospect theory) describes the asymmetry in how humans weigh equivalent gains and losses. A £100 loss is felt roughly twice as intensely as a £100 gain. In financial products, this manifests in countless ways — most notably, users will hold losing positions far past the point of rational exit because realising a loss is psychologically more costly than continuing to hope.",
    defiManifestation:
      "Position management UIs that make 'close at a loss' more visually prominent, more friction-free, and more emotionally neutral than 'hold' tend to produce healthier user portfolios over time. The opposite — where 'close' is buried, where the position card foregrounds time-since-entry rather than current state, where there is no 'cut your losses' affordance — tends to keep users locked in losing trades, occasionally fatally.",
    designLevers: [
      "Render P&L symmetrically — a -5% loss should not be visually quieter than a +5% gain (nor vice versa).",
      "Provide explicit 'close at loss' affordances at peer parity with 'close at profit' affordances.",
      "Avoid framing time-in-position as a virtue; it is one of the most common patterns that exacerbates loss aversion.",
    ],
    relatedRubricAreas: ["cognitive-bias-resistance", "risk-disclosure"],
  },
  {
    slug: "action-bias",
    name: "Action bias",
    category: "bias",
    oneLiner:
      "When uncertain, humans prefer doing something to doing nothing — even when doing nothing is the better strategy.",
    longExplanation:
      "Action bias describes the human tendency, in conditions of uncertainty, to favour an active response over a passive one — even when the expected outcome is identical or worse. Goalkeepers dive even when statistically they'd save more penalties standing still. In financial products, action bias manifests as overtrading, premature position adjustments, and impulsive responses to short-term price movements.",
    defiManifestation:
      "Trading UIs that surface real-time price changes as the dominant visual signal, with trade buttons immediately adjacent, train the user's reflex to act on every move. A user who came to deposit and hold ends up day-trading because the interface keeps offering them the action. Similarly, leverage controls placed next to position sizing encourage users to use them simply because they're there.",
    designLevers: [
      "Default the most prominent action affordance to whatever the user came to do, not to the highest-revenue action for the protocol.",
      "Add proportionate friction to high-impact, frequently-misused actions (a confirmation step on closing a long-held position is justifiable; one on a small swap is not).",
      "Avoid notification surfaces that rely on price-movement-triggered nudges to drive engagement.",
    ],
    relatedRubricAreas: ["cognitive-bias-resistance", "novice-expert-split"],
  },
  {
    slug: "framing-effect",
    name: "Framing effect",
    category: "bias",
    oneLiner:
      "How a choice is described changes how it's chosen — even when the underlying numbers are identical.",
    longExplanation:
      "The framing effect describes how the presentation of equivalent information leads to different decisions. '90% survival rate' and '10% mortality rate' describe the same outcome and produce different choices. In financial UX, every metric is framed — and almost no protocol audits its framing choices for asymmetric effects.",
    defiManifestation:
      "Showing fees as a percentage of trade value vs. as an absolute amount shifts user perception massively at small trade sizes ('0.3% fee' sounds reasonable; '£0.45 on a £150 trade' less so for some users, more so for others). Showing returns as APY vs. as monthly figures changes apparent magnitude. Showing slippage as 'minimum received' vs. as 'maximum loss' produces different user reactions to identical numbers.",
    designLevers: [
      "Render financial values in both percentage and absolute formats by default, especially fees and slippage.",
      "Match framing to the user's likely mental model (a long-term holder cares about APY; a one-shot swapper cares about fees in £).",
      "Audit every numeric display in the product for whether the choice of framing benefits the user or the protocol — and prefer the user.",
    ],
    relatedRubricAreas: [
      "cognitive-bias-resistance",
      "fee-slippage-transparency",
    ],
  },
  {
    slug: "choice-overload",
    name: "Choice overload",
    category: "bias",
    oneLiner:
      "Too many options reduce action — even when each individual option is good.",
    longExplanation:
      "Choice overload (the 'jam study' result, replicated repeatedly) describes how presenting users with too many options reduces decision quality and frequency. Above a threshold of options, users become more likely to either pick poorly, defer the decision, or abandon entirely. Threshold varies by domain but in financial products it is low — sometimes as low as four or five options before paralysis sets in.",
    defiManifestation:
      "Token-selection UIs that present users with thousands of tokens as an unfiltered list. Yield-aggregator dashboards that surface dozens of opportunities ranked by APY without a recommended default. Bridge UIs that ask users to pick between five different routing providers before they've made the decision to bridge.",
    designLevers: [
      "Curate aggressively — present a default and let users opt into the long tail.",
      "Pre-rank options on a relevant dimension and surface the top three; collapse the rest behind a 'See all' affordance.",
      "Avoid presenting options the user is not yet equipped to choose between (a novice doesn't benefit from seeing five RPC endpoints).",
    ],
    relatedRubricAreas: ["novice-expert-split", "onboarding-first-tx"],
  },
];

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return glossary.find((g) => g.slug === slug);
}

export function listGlossarySlugs(): string[] {
  return glossary.map((g) => g.slug);
}
