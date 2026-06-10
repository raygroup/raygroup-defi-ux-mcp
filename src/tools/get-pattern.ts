import {
  patterns,
  getPattern,
  patternsByCategory,
  patternsByRubricArea,
  type Pattern,
} from "../data/patterns.js";

export const getPatternTool = {
  name: "get_pattern",
  description:
    "Returns one or more named DeFi UX patterns from the Ray Group library. Patterns are recurring solutions Ray Group has seen ship well in production (or seen fail when absent). Look up a single pattern by slug, or filter by category or by the rubric area the pattern relates to.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description:
          "Optional. The slug of a single pattern to fetch (e.g. 'pre-signing-calldata-translation').",
      },
      category: {
        type: "string",
        enum: [
          "onboarding",
          "transaction",
          "risk",
          "wallet",
          "trading",
          "error",
          "novice-expert",
        ],
        description:
          "Optional. Filter patterns by category. Ignored if `slug` is provided.",
      },
      rubricArea: {
        type: "string",
        description:
          "Optional. Filter patterns to those addressing a specific rubric area (e.g. 'transaction-confirmation'). Ignored if `slug` is provided.",
      },
    },
  },
};

export function handleGetPattern(args: {
  slug?: string;
  category?: Pattern["category"];
  rubricArea?: string;
}) {
  if (args.slug) {
    const pattern = getPattern(args.slug);
    if (!pattern) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No pattern found for slug "${args.slug}". Available slugs: ${patterns.map((p) => p.slug).join(", ")}.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(pattern, null, 2) },
      ],
    };
  }

  let result: Pattern[] = patterns;
  if (args.category) result = patternsByCategory(args.category);
  if (args.rubricArea)
    result = result.filter((p) => p.rubricAreas.includes(args.rubricArea!));

  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  };
}
