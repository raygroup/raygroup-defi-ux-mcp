/**
 * Pro: structured rubric audit worksheet for a screen the agent (or user)
 * is looking at. Multimodal clients already have the image in context —
 * this tool returns the scoring instrument, not a vision model call.
 */

import type { LicenceStatus } from "../licence.js";
import { rubric } from "../data/rubric.js";
import { upgradeResponse } from "./upgrade.js";

const SURFACE_TO_AREAS: Record<string, string[]> = {
  confirm: ["transaction-confirmation", "fee-slippage-transparency", "cognitive-bias-resistance"],
  onboarding: ["onboarding-first-tx", "novice-expert-split", "mobile-ux"],
  leverage: ["risk-disclosure", "cognitive-bias-resistance", "fee-slippage-transparency"],
  swap: ["transaction-confirmation", "fee-slippage-transparency", "error-failure-states"],
  disclosure: ["risk-disclosure", "cognitive-bias-resistance"],
  error: ["error-failure-states", "transaction-confirmation"],
  approval: ["transaction-confirmation", "cognitive-bias-resistance", "risk-disclosure"],
  portfolio: ["risk-disclosure", "mobile-ux", "novice-expert-split"],
  other: rubric.map((r) => r.slug),
};

export const auditScreenshotTool = {
  name: "audit_screenshot",
  description:
    "Pro tier. Build a Ray Group rubric-aligned audit worksheet for a screen you can see (paste/attach the screenshot in chat, then call this tool with what you observe). Returns applicable rubric criteria with evidence prompts, anti-patterns to hunt, pattern slugs to verify via get_pattern, optional persona stress questions, and a scoring table template. The model fills scores from the image — this tool supplies the instrument so audits stay consistent across runs.",
  inputSchema: {
    type: "object" as const,
    properties: {
      surfaceType: {
        type: "string",
        description:
          "Primary surface: confirm | onboarding | leverage | swap | disclosure | error | approval | portfolio | other",
      },
      observedElements: {
        type: "string",
        description:
          "What is visible on the screen: key labels, numbers, CTAs, warnings, missing elements. Be concrete.",
      },
      imageUrl: {
        type: "string",
        description: "Optional URL of the screenshot for citation in the written audit.",
      },
      persona: {
        type: "string",
        description:
          "Optional persona slug (e.g. novice-first-wallet). Adds stress questions; call get_persona for the full pack.",
      },
      protocolHint: {
        type: "string",
        description: "Optional protocol or product name for the report header.",
      },
    },
    required: ["surfaceType", "observedElements"],
  },
};

export async function handleAuditScreenshot(
  args: {
    surfaceType?: string;
    observedElements?: string;
    imageUrl?: string;
    persona?: string;
    protocolHint?: string;
  },
  licence: LicenceStatus,
) {
  if (!licence.valid || !licence.apiKey) {
    return upgradeResponse(
      "audit_screenshot",
      "On the free tier: call get_rubric and score manually, or use get_persona (2 free archetypes) to stress-test copy.",
    );
  }

  const surface = (args.surfaceType ?? "other").toLowerCase();
  const areaSlugs = SURFACE_TO_AREAS[surface] ?? SURFACE_TO_AREAS.other;
  const areas = rubric.filter((r) => areaSlugs.includes(r.slug));

  const worksheet = {
    tool: "audit_screenshot",
    tier: "pro",
    protocolHint: args.protocolHint ?? null,
    imageUrl: args.imageUrl ?? null,
    surfaceType: surface,
    observedElements: args.observedElements ?? "",
    persona: args.persona ?? null,
    instructions: [
      "1. For each criterion below, score pass | partial | fail with evidence quoted from observedElements (or the image).",
      "2. Call get_pattern for any patternSlug you claim is missing or violated.",
      "3. If persona is set, answer every stressQuestion before finalising scores.",
      "4. Output: summary table, top 3 remediations by user harm, one engineer-ready UI change.",
      "5. Flag anything not visible (mobile, error, empty states) as 'not assessable' — do not invent.",
    ],
    applicableAreas: areas.map((a) => ({
      slug: a.slug,
      title: a.title,
      weight: a.weight,
      criteria: a.criteria,
      commonAntiPatterns: a.commonAntiPatterns,
    })),
    scoringTableTemplate: areas.map((a) => ({
      area: a.slug,
      weight: a.weight,
      scoreOutOf10: null,
      status: "pass|partial|fail",
      evidence: "",
    })),
    followUpTools: [
      "get_pattern",
      "get_glossary_entry",
      "get_persona",
      "get_reference",
      "get_case_study",
    ],
  };

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(worksheet, null, 2) },
    ],
  };
}
