import type { LicenceStatus } from "../licence.js";
import { fetchProPersonas } from "../api-client.js";
import { personas as freePersonas, type Persona } from "../data/personas-free.js";

export const getPersonaTool = {
  name: "get_persona",
  description:
    "Return Ray Group critique personas for stress-testing UI before team review. Free tier: 2 archetypes (novice-first-wallet, active-retail-trader). Pro: full pack including power user, compliance officer, mobile-only, loss-averse holder. Filter by slug or archetype; omit both for the index.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description: "Optional persona slug.",
      },
      archetype: {
        type: "string",
        description:
          "Optional: novice | retail-trader | expert | compliance | mobile | holder",
      },
    },
  },
};

async function resolvePersonas(licence: LicenceStatus): Promise<Persona[]> {
  if (licence.valid && licence.apiKey) {
    const pro = await fetchProPersonas(licence.apiBase, licence.apiKey);
    if (pro.length > 0) {
      const bySlug = new Map<string, Persona>();
      for (const p of freePersonas) bySlug.set(p.slug, p);
      for (const p of pro) bySlug.set(p.slug, p);
      return [...bySlug.values()];
    }
  }
  return freePersonas;
}

export async function handleGetPersona(
  args: { slug?: string; archetype?: string },
  licence: LicenceStatus,
) {
  const all = await resolvePersonas(licence);

  if (args.slug) {
    const found = all.find((p) => p.slug === args.slug);
    if (!found) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No persona "${args.slug}". Available: ${all.map((p) => p.slug).join(", ")}.${
              !licence.valid
                ? " Pro unlocks more personas — https://raygroup.uk/products/defi-ux-mcp/pricing"
                : ""
            }`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(found, null, 2) }],
    };
  }

  let result = all;
  if (args.archetype) {
    const needle = args.archetype.toLowerCase();
    result = all.filter(
      (p) =>
        p.archetype.toLowerCase() === needle ||
        p.archetype.toLowerCase().includes(needle),
    );
  }

  const payload = {
    tier: licence.valid ? "pro" : "free",
    count: result.length,
    personas: result,
    note: licence.valid
      ? undefined
      : "Free tier shows 2 personas. Pro adds compliance, expert, mobile, holder, and more stressQuestions.",
  };

  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
  };
}
