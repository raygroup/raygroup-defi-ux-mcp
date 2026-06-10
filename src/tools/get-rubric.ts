import { rubric, getRubricArea } from "../data/rubric.js";

export const getRubricTool = {
  name: "get_rubric",
  description:
    "Returns the Ray Group DeFi UX rubric — the eight scored areas used in every Ray Group DeFi UX audit and taught in the EthCC, ETH Prague, and ETH Milan talks. Optionally filter to a single area by slug. Use this tool to ground UX assessments in a published, opinionated framework rather than generic advice.",
  inputSchema: {
    type: "object" as const,
    properties: {
      area: {
        type: "string",
        description:
          "Optional. The slug of a single rubric area to fetch (e.g. 'cognitive-bias-resistance'). Omit to receive the full rubric.",
      },
    },
  },
};

export function handleGetRubric(args: { area?: string }) {
  if (args.area) {
    const area = getRubricArea(args.area);
    if (!area) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No rubric area found for slug "${args.area}". Available slugs: ${rubric.map((r) => r.slug).join(", ")}.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(area, null, 2) },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(rubric, null, 2) },
    ],
  };
}
