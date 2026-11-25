import type { LicenceStatus } from "../licence.js";
import { rubric } from "../data/rubric.js";
import { patterns } from "../data/patterns.js";
import { glossary } from "../data/glossary.js";
import { personas } from "../data/personas-free.js";

export const listCategoriesTool = {
  name: "list_categories",
  description:
    "Returns the top-level structure of the Ray Group DeFi UX MCP corpus — rubric areas, pattern slugs, glossary entries, personas, and (when Pro) pointers to references, flows, and audit tools. Use as a discovery tool before more specific queries.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export function handleListCategories(licence?: LicenceStatus) {
  const pro = Boolean(licence?.valid);
  const summary = {
    version: "0.3.0",
    tier: pro ? "pro" : "free",
    tools: {
      free: [
        "search_defi_ux",
        "get_rubric",
        "get_pattern",
        "get_glossary_entry",
        "get_persona",
        "list_categories",
      ],
      pro: [
        "get_case_study",
        "get_reference",
        "get_flow",
        "audit_screenshot",
        "audit_protocol",
      ],
    },
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
      note: pro
        ? "Bundled free set shown; call get_pattern with Pro key for 50+ named-protocol patterns."
        : "Free set (10). Pro extends to 50+ with protocol references.",
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
    personas: {
      count: personas.length,
      note: pro
        ? "Call get_persona for the full Pro pack."
        : "Free teaser (2). Pro adds compliance, expert, mobile, holder.",
      personas: personas.map((p) => ({
        slug: p.slug,
        name: p.name,
        archetype: p.archetype,
      })),
    },
    premium: pro
      ? {
          unlocked: [
            "get_case_study",
            "get_reference",
            "get_flow",
            "audit_screenshot",
            "audit_protocol",
            "extended patterns + glossary",
          ],
        }
      : {
          note: "Pro ($29/mo) adds case studies, visual references, flow graphs, audit_screenshot, audit_protocol, and the extended pattern/glossary corpus.",
          pricing: "https://raygroup.uk/products/defi-ux-mcp/pricing",
        },
  };

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(summary, null, 2) },
    ],
  };
}
