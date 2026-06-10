import { rubric } from "../data/rubric.js";
import { patterns } from "../data/patterns.js";
import { glossary } from "../data/glossary.js";

export const searchDefiUxTool = {
  name: "search_defi_ux",
  description:
    "Free-text search across the entire Ray Group DeFi UX corpus — rubric areas, named patterns, and the cognitive-bias glossary. Returns the top matching entries by simple substring relevance. Use this when the agent has a specific question (e.g. 'slippage', 'wallet onboarding', 'loss aversion in trading') and wants the most relevant entries surfaced without knowing the exact slug.",
  inputSchema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description:
          "Natural-language query — words, a topic, or a partial phrase. Case-insensitive.",
      },
      limit: {
        type: "number",
        description: "Optional. Maximum number of results to return. Default 8.",
      },
    },
    required: ["query"],
  },
};

type SearchHit = {
  kind: "rubric" | "pattern" | "glossary";
  slug: string;
  title: string;
  snippet: string;
  score: number;
};

function scoreEntry(haystack: string, needle: string): number {
  const lowerHay = haystack.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  if (!lowerNeedle) return 0;

  const tokens = lowerNeedle.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const token of tokens) {
    if (lowerHay.includes(token)) {
      score += 1;
      if (lowerHay.startsWith(token)) score += 1;
    }
  }
  return score;
}

function snippetFor(text: string, query: string, max = 220): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase().split(/\s+/)[0] ?? "");
  if (idx < 0) return text.slice(0, max);
  const start = Math.max(0, idx - 60);
  return (start > 0 ? "…" : "") + text.slice(start, start + max).trim();
}

export function handleSearchDefiUx(args: { query: string; limit?: number }) {
  const limit = args.limit ?? 8;
  const query = args.query?.trim() ?? "";

  if (!query) {
    return {
      content: [
        { type: "text" as const, text: "Empty query. Provide a search term." },
      ],
      isError: true,
    };
  }

  const hits: SearchHit[] = [];

  for (const area of rubric) {
    const haystack = `${area.title} ${area.summary} ${area.criteria
      .map((c) => `${c.text} ${c.evidence}`)
      .join(" ")} ${area.commonAntiPatterns.join(" ")}`;
    const score = scoreEntry(haystack, query);
    if (score > 0) {
      hits.push({
        kind: "rubric",
        slug: area.slug,
        title: area.title,
        snippet: snippetFor(area.summary, query),
        score: score + 0.5,
      });
    }
  }

  for (const pattern of patterns) {
    const haystack = `${pattern.name} ${pattern.summary} ${pattern.whenToUse} ${pattern.howItWorks} ${pattern.antiPattern}`;
    const score = scoreEntry(haystack, query);
    if (score > 0) {
      hits.push({
        kind: "pattern",
        slug: pattern.slug,
        title: pattern.name,
        snippet: snippetFor(pattern.summary, query),
        score,
      });
    }
  }

  for (const entry of glossary) {
    const haystack = `${entry.name} ${entry.oneLiner} ${entry.longExplanation} ${entry.defiManifestation}`;
    const score = scoreEntry(haystack, query);
    if (score > 0) {
      hits.push({
        kind: "glossary",
        slug: entry.slug,
        title: entry.name,
        snippet: snippetFor(entry.oneLiner, query),
        score,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  const top = hits.slice(0, limit);

  if (top.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No results for "${query}". Try \`list_categories\` to see what's in the corpus.`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            query,
            count: top.length,
            results: top,
          },
          null,
          2,
        ),
      },
    ],
  };
}
