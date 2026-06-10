import { glossary, getGlossaryEntry } from "../data/glossary.js";

export const getGlossaryEntryTool = {
  name: "get_glossary_entry",
  description:
    "Returns a cognitive-bias / heuristic / principle entry from the Ray Group DeFi UX glossary, with the bias's general definition and its specific manifestation in DeFi product UX. Use when reasoning about a UX decision and you want a named, well-defined cognitive concept to anchor the analysis.",
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

export function handleGetGlossaryEntry(args: { slug?: string }) {
  if (args.slug) {
    const entry = getGlossaryEntry(args.slug);
    if (!entry) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No glossary entry found for slug "${args.slug}". Available slugs: ${glossary.map((g) => g.slug).join(", ")}.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(entry, null, 2) },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(glossary, null, 2) },
    ],
  };
}
