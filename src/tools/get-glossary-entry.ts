import {
  glossary as bundledGlossary,
  getGlossaryEntry,
  type GlossaryEntry,
} from "../data/glossary.js";
import type { LicenceStatus } from "../licence.js";
import { fetchProGlossary } from "../api-client.js";

export const getGlossaryEntryTool = {
  name: "get_glossary_entry",
  description:
    "Returns a cognitive-bias / heuristic / principle entry from the Ray Group DeFi UX glossary, with the bias's general definition and its specific manifestation in DeFi product UX. Use when reasoning about a UX decision and you want a named, well-defined cognitive concept to anchor the analysis. With a Pro licence, the response includes the extended glossary (30+ entries).",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description:
          "The slug of the glossary entry to fetch (e.g. 'anchoring', 'loss-aversion'). Omit to receive the full glossary.",
      },
    },
  },
};

async function getCorpus(licence: LicenceStatus): Promise<GlossaryEntry[]> {
  if (!licence.valid || !licence.apiKey) return bundledGlossary;
  const pro = await fetchProGlossary(licence.apiBase, licence.apiKey);
  if (pro.length === 0) return bundledGlossary;

  const merged = new Map<string, GlossaryEntry>();
  for (const g of bundledGlossary) merged.set(g.slug, g);
  for (const g of pro) merged.set(g.slug, g);
  return Array.from(merged.values());
}

export async function handleGetGlossaryEntry(
  args: { slug?: string },
  licence: LicenceStatus,
) {
  const corpus = await getCorpus(licence);
  const upgradeHint =
    licence.plan === "free"
      ? "\n\n— Free tier (5 entries). Pro unlocks 30+ glossary entries plus named-protocol case studies: https://raygroup.uk/products/defi-ux-mcp/pricing"
      : "";

  if (args.slug) {
    const entry =
      corpus.find((g) => g.slug === args.slug) ?? getGlossaryEntry(args.slug);
    if (!entry) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No glossary entry found for slug "${args.slug}". Available slugs: ${corpus.map((g) => g.slug).join(", ")}.${upgradeHint}`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(entry, null, 2) + upgradeHint,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(corpus, null, 2) + upgradeHint,
      },
    ],
  };
}
