/**
 * Pro: multi-page audit plan for a named protocol / URL.
 */

import type { LicenceStatus } from "../licence.js";
import { fetchProCaseStudies, fetchProReferences, fetchProFlows } from "../api-client.js";
import { rubric } from "../data/rubric.js";
import { upgradeResponse } from "./upgrade.js";

const TYPE_PAGES: Record<
  string,
  { page: string; surfaceType: string; areas: string[] }[]
> = {
  dex: [
    { page: "Connect / landing", surfaceType: "onboarding", areas: ["onboarding-first-tx"] },
    { page: "Swap ticket", surfaceType: "swap", areas: ["fee-slippage-transparency"] },
    { page: "Confirm sheet", surfaceType: "confirm", areas: ["transaction-confirmation"] },
    { page: "Approval prompt path", surfaceType: "approval", areas: ["cognitive-bias-resistance"] },
    { page: "Failed / pending tx", surfaceType: "error", areas: ["error-failure-states"] },
  ],
  lending: [
    { page: "Supply / withdraw", surfaceType: "confirm", areas: ["transaction-confirmation"] },
    { page: "Borrow / repay", surfaceType: "leverage", areas: ["risk-disclosure"] },
    { page: "Health factor / liquidation", surfaceType: "leverage", areas: ["risk-disclosure", "cognitive-bias-resistance"] },
    { page: "Onboarding / first supply", surfaceType: "onboarding", areas: ["onboarding-first-tx"] },
  ],
  perp: [
    { page: "Onboarding / deposit", surfaceType: "onboarding", areas: ["onboarding-first-tx"] },
    { page: "Ticket + leverage", surfaceType: "leverage", areas: ["risk-disclosure", "fee-slippage-transparency"] },
    { page: "Confirm open/close", surfaceType: "confirm", areas: ["transaction-confirmation"] },
    { page: "Positions / liq warnings", surfaceType: "portfolio", areas: ["risk-disclosure", "error-failure-states"] },
  ],
  bridge: [
    { page: "Route select", surfaceType: "swap", areas: ["fee-slippage-transparency", "cognitive-bias-resistance"] },
    { page: "Confirm bridge", surfaceType: "confirm", areas: ["transaction-confirmation"] },
    { page: "In-flight / failure", surfaceType: "error", areas: ["error-failure-states"] },
  ],
  wallet: [
    { page: "Create / import", surfaceType: "onboarding", areas: ["onboarding-first-tx", "novice-expert-split"] },
    { page: "Send / approve", surfaceType: "approval", areas: ["transaction-confirmation"] },
    { page: "Activity / errors", surfaceType: "error", areas: ["error-failure-states"] },
  ],
  other: [
    { page: "Primary happy path", surfaceType: "other", areas: rubric.map((r) => r.slug) },
  ],
};

export const auditProtocolTool = {
  name: "audit_protocol",
  description:
    "Pro tier. Return a multi-page Ray Group audit plan for a protocol (by name, URL, and/or type: dex | lending | perp | bridge | wallet | other). Includes pages to visit, rubric areas per page, related case studies and visual references from the Pro corpus, and suggested flow slugs. Use before a full product audit or capstone.",
  inputSchema: {
    type: "object" as const,
    properties: {
      protocolName: {
        type: "string",
        description: "Protocol or product name (e.g. 'Uniswap', 'Aave').",
      },
      protocolUrl: {
        type: "string",
        description: "Optional app or docs URL to cite in the plan.",
      },
      protocolType: {
        type: "string",
        description: "dex | lending | perp | bridge | wallet | other",
      },
    },
  },
};

export async function handleAuditProtocol(
  args: {
    protocolName?: string;
    protocolUrl?: string;
    protocolType?: string;
  },
  licence: LicenceStatus,
) {
  if (!licence.valid || !licence.apiKey) {
    return upgradeResponse(
      "audit_protocol",
      "On the free tier: call get_rubric and list_categories, then walk pages manually.",
    );
  }

  const type = (args.protocolType ?? "other").toLowerCase();
  const pages = TYPE_PAGES[type] ?? TYPE_PAGES.other;
  const name = args.protocolName ?? "target protocol";

  const [studies, references, flows] = await Promise.all([
    fetchProCaseStudies(licence.apiBase, licence.apiKey),
    fetchProReferences(licence.apiBase, licence.apiKey),
    fetchProFlows(licence.apiBase, licence.apiKey),
  ]);

  const needle = name.toLowerCase();
  const relatedStudies = studies.filter(
    (c) =>
      c.protocol.toLowerCase().includes(needle) ||
      c.slug.toLowerCase().includes(needle) ||
      (!args.protocolName && c.category.toLowerCase().includes(type)),
  );
  const relatedRefs = references.filter(
    (r) =>
      r.protocol.toLowerCase().includes(needle) ||
      (!args.protocolName &&
        (type === "other" ||
          r.surface === "swap" ||
          r.surface === "confirm" ||
          r.surface === "leverage" ||
          r.surface === "onboarding")),
  );
  const relatedFlows = flows.filter((f) => {
    if (type === "perp") return f.slug.includes("perps") || f.slug.includes("leverage");
    if (type === "dex") return f.slug.includes("swap");
    if (type === "lending") return f.slug.includes("leverage") || f.kit === "risk-disclosure-components";
    return true;
  });

  const plan = {
    tool: "audit_protocol",
    tier: "pro",
    protocolName: name,
    protocolUrl: args.protocolUrl ?? null,
    protocolType: type,
    method: [
      "Walk each page at desktop and once at ~360px width.",
      "For each page, call audit_screenshot with surfaceType + observedElements.",
      "Stress-test at least two personas via get_persona (novice + one other).",
      "Compare against get_reference boards listed below before final scores.",
      "Write the report with evidence rows that cite screenshot observations.",
    ],
    pages: pages.map((p) => ({
      ...p,
      areaDetails: rubric
        .filter((r) => p.areas.includes(r.slug))
        .map((r) => ({ slug: r.slug, title: r.title, weight: r.weight })),
    })),
    relatedCaseStudies: relatedStudies.slice(0, 5).map((c) => ({
      slug: c.slug,
      protocol: c.protocol,
      summary: c.summary,
    })),
    relatedReferences: relatedRefs.slice(0, 6).map((r) => ({
      slug: r.slug,
      title: r.title,
      surface: r.surface,
    })),
    suggestedFlows: relatedFlows.slice(0, 4).map((f) => ({
      slug: f.slug,
      title: f.title,
    })),
    nextTools: ["audit_screenshot", "get_persona", "get_reference", "get_flow", "get_case_study"],
  };

  return {
    content: [{ type: "text" as const, text: JSON.stringify(plan, null, 2) }],
  };
}
