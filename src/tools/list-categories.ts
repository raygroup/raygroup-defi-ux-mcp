import { rubric } from "../data/rubric.js";
import { patterns } from "../data/patterns.js";
import { glossary } from "../data/glossary.js";

export const listCategoriesTool = {
  name: "list_categories",
  description:
    "Returns the top-level structure of the Ray Group DeFi UX MCP corpus — every rubric area, every pattern slug, every glossary entry slug. Use this as a discovery tool before more specific queries: it lets the agent see what's available without exhaustive crawling.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export function handleListCategories() {
  const summary = {
    version: "0.1.0",
    tier: "free",
    rubric: {
      count: rubric.length,
      areas: rubric.map((r) => ({
        slug: r.slug,
        title: r.title,
        weight: r.weight,
      })),
    },
    patterns: {
      count: patterns.length,
      patterns: patterns.map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
      })),
    },
    glossary: {
      count: glossary.length,
      entries: glossary.map((g) => ({
        slug: g.slug,
        name: g.name,
        category: g.category,
      })),
    },
    premium: {
      note: "This MCP server ships the free tier of the Ray Group DeFi UX corpus. The premium tier adds 30+ named-protocol patterns, screenshot-based audit feedback, and the full 30-entry glossary. Join the waitlist at https://raygroup.uk/products/defi-ux-mcp/.",
    },
  };

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(summary, null, 2) },
    ],
  };
}
