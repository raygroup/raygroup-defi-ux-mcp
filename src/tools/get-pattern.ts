import {
  patterns as bundledPatterns,
  getPattern,
  patternsByCategory,
  patternsByRubricArea,
  type Pattern,
} from "../data/patterns.js";
import type { LicenceStatus } from "../licence.js";
import { fetchProPatterns } from "../api-client.js";

export const getPatternTool = {
  name: "get_pattern",
  description:
    "Returns one or more named DeFi UX patterns from the Ray Group library. Patterns are recurring solutions Ray Group has seen ship well in production (or seen fail when absent). Look up a single pattern by slug, or filter by category or by the rubric area the pattern relates to. With a Pro licence, the response includes the extended pattern set with named-protocol references.",
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

async function getCorpus(licence: LicenceStatus): Promise<Pattern[]> {
  if (!licence.valid || !licence.apiKey) return bundledPatterns;
  const pro = await fetchProPatterns(licence.apiBase, licence.apiKey);
  if (pro.length === 0) return bundledPatterns;

  const merged = new Map<string, Pattern>();
  for (const p of bundledPatterns) merged.set(p.slug, p);
  for (const p of pro) merged.set(p.slug, p);
  return Array.from(merged.values());
}

export async function handleGetPattern(
  args: {
    slug?: string;
    category?: Pattern["category"];
    rubricArea?: string;
  },
  licence: LicenceStatus,
) {
  const corpus = await getCorpus(licence);
  const upgradeHint =
    licence.plan === "free"
      ? "\n\n— Free tier (10 patterns). Pro unlocks 50+ patterns with named-protocol references: https://raygroup.uk/products/defi-ux-mcp/pricing"
      : "";

  if (args.slug) {
    const pattern =
      corpus.find((p) => p.slug === args.slug) ?? getPattern(args.slug);
    if (!pattern) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No pattern found for slug "${args.slug}". Available slugs: ${corpus.map((p) => p.slug).join(", ")}.${upgradeHint}`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(pattern, null, 2) + upgradeHint,
        },
      ],
    };
  }

  let result: Pattern[] = corpus;
  if (args.category) {
    result =
      licence.valid && corpus !== bundledPatterns
        ? corpus.filter((p) => p.category === args.category)
        : patternsByCategory(args.category);
  }
  if (args.rubricArea) {
    result = result.filter((p) => p.rubricAreas.includes(args.rubricArea!));
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2) + upgradeHint,
      },
    ],
  };
}
