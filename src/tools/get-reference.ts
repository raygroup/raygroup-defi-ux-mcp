import type { LicenceStatus } from "../licence.js";
import { fetchProReferences, type VisualReference } from "../api-client.js";
import { upgradeResponse } from "./upgrade.js";

export const getReferenceTool = {
  name: "get_reference",
  description:
    "Pro tier. Visual / protocol reference boards for DeFi UX exploration (confirm, onboarding, leverage, approvals, errors, disclosure). Returns what to look for, good signals, anti-patterns, linked rubric areas and patterns, plus public URLs. Use while critiquing a screen or building exploration pages.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: { type: "string", description: "Optional reference slug." },
      surface: {
        type: "string",
        description:
          "Optional: confirm | onboarding | leverage | swap | disclosure | error | portfolio | approval",
      },
      protocol: {
        type: "string",
        description: "Optional protocol filter (e.g. uniswap, aave).",
      },
    },
  },
};

export async function handleGetReference(
  args: { slug?: string; surface?: string; protocol?: string },
  licence: LicenceStatus,
) {
  if (!licence.valid || !licence.apiKey) {
    return upgradeResponse(
      "get_reference",
      "Free tier: use get_pattern and get_case_study (Pro) once licensed. Exploration refs are Pro-only.",
    );
  }

  const refs = await fetchProReferences(licence.apiBase, licence.apiKey);
  if (refs.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: "No references returned. Licence is valid; retry or check https://raygroup.uk/products/defi-ux-mcp/pricing.",
        },
      ],
    };
  }

  if (args.slug) {
    const found = refs.find((r) => r.slug === args.slug);
    if (!found) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No reference "${args.slug}". Available: ${refs.map((r) => r.slug).join(", ")}.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(found, null, 2) }],
    };
  }

  let result: VisualReference[] = refs;
  if (args.surface) {
    const s = args.surface.toLowerCase();
    result = result.filter((r) => r.surface === s);
  }
  if (args.protocol) {
    const p = args.protocol.toLowerCase();
    result = result.filter(
      (r) =>
        r.protocol.toLowerCase().includes(p) || r.slug.toLowerCase().includes(p),
    );
  }

  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  };
}
