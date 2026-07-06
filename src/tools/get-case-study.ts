import type { LicenceStatus } from "../licence.js";
import { fetchProCaseStudies, type CaseStudy } from "../api-client.js";

export const getCaseStudyTool = {
  name: "get_case_study",
  description:
    "Pro tier. Returns anonymised or named-protocol DeFi UX case studies from the Ray Group corpus — what happened, the rubric areas it stresses, the named patterns and biases at play, and the design remediation that fixed it. Filter by slug or by protocol name; omit both arguments to receive the full case-study index. Without a Pro key, returns an upgrade prompt with the pricing URL — the model can then ask the user whether to proceed.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description:
          "Optional. The slug of a specific case study (e.g. 'uniswap-slippage-default-2024').",
      },
      protocol: {
        type: "string",
        description:
          "Optional. Filter to case studies that involve a specific protocol (e.g. 'uniswap', 'aave', 'dydx', 'gmx', 'hyperliquid').",
      },
    },
  },
};

function upgradeResponse() {
  return {
    content: [
      {
        type: "text" as const,
        text:
          "Pro feature. `get_case_study` requires a Ray Group DeFi UX MCP Pro licence — set RAYGROUP_API_KEY in your MCP client config.\n\n" +
          "Pricing: https://raygroup.uk/products/defi-ux-mcp/pricing ($29/mo or $290/yr)\n\n" +
          "While on the free tier you can still call `get_pattern` and `get_glossary_entry`, which return the 10-pattern / 5-entry free corpus and reference (but do not include) the protocol-specific case studies.",
      },
    ],
    isError: false,
  };
}

export async function handleGetCaseStudy(
  args: { slug?: string; protocol?: string },
  licence: LicenceStatus,
) {
  if (!licence.valid || !licence.apiKey) {
    return upgradeResponse();
  }

  const studies = await fetchProCaseStudies(licence.apiBase, licence.apiKey);
  if (studies.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text:
            "No case studies returned from the Pro corpus right now. " +
            "Your licence is valid; the backend may be momentarily unreachable — try again, or check status at https://raygroup.uk/products/defi-ux-mcp/pricing.",
        },
      ],
    };
  }

  if (args.slug) {
    const found = studies.find((c) => c.slug === args.slug);
    if (!found) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No case study found for slug "${args.slug}". Available slugs: ${studies.map((c) => c.slug).join(", ")}.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(found, null, 2) },
      ],
    };
  }

  let result: CaseStudy[] = studies;
  if (args.protocol) {
    const needle = args.protocol.toLowerCase();
    result = studies.filter(
      (c) =>
        c.protocol.toLowerCase().includes(needle) ||
        c.slug.toLowerCase().includes(needle),
    );
  }

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(result, null, 2) },
    ],
  };
}
