import type { LicenceStatus } from "../licence.js";
import { fetchProFlows, type FlowGraph } from "../api-client.js";
import { upgradeResponse } from "./upgrade.js";

export const getFlowTool = {
  name: "get_flow",
  description:
    "Pro tier. Return agent-readable flow graphs (happy / unhappy / edge paths) for DeFi UX kits and audits — steps, edges, persona slugs, edge-case notes. Filter by slug or kit (trading-ui-kit | web3-onboarding-kit | risk-disclosure-components | generic).",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: { type: "string", description: "Optional flow slug." },
      kit: {
        type: "string",
        description:
          "Optional kit: trading-ui-kit | web3-onboarding-kit | risk-disclosure-components | generic",
      },
    },
  },
};

export async function handleGetFlow(
  args: { slug?: string; kit?: string },
  licence: LicenceStatus,
) {
  if (!licence.valid || !licence.apiKey) {
    return upgradeResponse(
      "get_flow",
      "Kit purchasers also get markdown flow boards under flows/ in the library. MCP get_flow is Pro.",
    );
  }

  const flows = await fetchProFlows(licence.apiBase, licence.apiKey);
  if (flows.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: "No flows returned. Licence is valid; retry shortly.",
        },
      ],
    };
  }

  if (args.slug) {
    const found = flows.find((f) => f.slug === args.slug);
    if (!found) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No flow "${args.slug}". Available: ${flows.map((f) => f.slug).join(", ")}.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(found, null, 2) }],
    };
  }

  let result: FlowGraph[] = flows;
  if (args.kit) {
    result = flows.filter((f) => f.kit === args.kit);
  }

  const index = result.map((f) => ({
    slug: f.slug,
    title: f.title,
    kit: f.kit,
    summary: f.summary,
    personas: f.personas,
    stepCount: f.steps.length,
    edgeCount: f.edges.length,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          args.kit ? result : { count: index.length, flows: index },
          null,
          2,
        ),
      },
    ],
  };
}
