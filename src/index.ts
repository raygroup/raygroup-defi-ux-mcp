#!/usr/bin/env node
/**
 * Ray Group DeFi UX MCP Server.
 *
 * Exposes the Ray Group DeFi UX rubric, named patterns, cognitive-bias
 * glossary, and (Pro tier) protocol-specific case studies to AI agents via
 * the Model Context Protocol over stdio.
 *
 * v0.2 — 6 tools. Free tier always works offline. Pro tier ($29/mo)
 * unlocked by setting RAYGROUP_API_KEY in the MCP client config.
 *
 * Marketing page:  https://raygroup.uk/products/defi-ux-mcp/
 * Pricing:         https://raygroup.uk/products/defi-ux-mcp/pricing/
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  getRubricTool,
  handleGetRubric,
} from "./tools/get-rubric.js";
import {
  getPatternTool,
  handleGetPattern,
} from "./tools/get-pattern.js";
import {
  getGlossaryEntryTool,
  handleGetGlossaryEntry,
} from "./tools/get-glossary-entry.js";
import {
  listCategoriesTool,
  handleListCategories,
} from "./tools/list-categories.js";
import {
  searchDefiUxTool,
  handleSearchDefiUx,
} from "./tools/search-defi-ux.js";
import {
  getCaseStudyTool,
  handleGetCaseStudy,
} from "./tools/get-case-study.js";
import { resolveLicence } from "./licence.js";

const SERVER_NAME = "raygroup-defi-ux";
const SERVER_VERSION = "0.2.0";

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } },
);

const licencePromise = resolveLicence();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      searchDefiUxTool,
      getRubricTool,
      getPatternTool,
      getGlossaryEntryTool,
      getCaseStudyTool,
      listCategoriesTool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;
  const licence = await licencePromise;

  switch (name) {
    case "search_defi_ux":
      return handleSearchDefiUx({
        query: typeof a.query === "string" ? a.query : "",
        limit: typeof a.limit === "number" ? a.limit : undefined,
      });

    case "get_rubric":
      return handleGetRubric({
        area: typeof a.area === "string" ? a.area : undefined,
      });

    case "get_pattern":
      return handleGetPattern(
        {
          slug: typeof a.slug === "string" ? a.slug : undefined,
          category:
            typeof a.category === "string"
              ? (a.category as
                  | "onboarding"
                  | "transaction"
                  | "risk"
                  | "wallet"
                  | "trading"
                  | "error"
                  | "novice-expert")
              : undefined,
          rubricArea:
            typeof a.rubricArea === "string" ? a.rubricArea : undefined,
        },
        licence,
      );

    case "get_glossary_entry":
      return handleGetGlossaryEntry(
        { slug: typeof a.slug === "string" ? a.slug : undefined },
        licence,
      );

    case "get_case_study":
      return handleGetCaseStudy(
        {
          slug: typeof a.slug === "string" ? a.slug : undefined,
          protocol: typeof a.protocol === "string" ? a.protocol : undefined,
        },
        licence,
      );

    case "list_categories":
      return handleListCategories();

    default:
      return {
        content: [
          {
            type: "text" as const,
            text: `Unknown tool: ${name}. Call \`list_categories\` to see what's available.`,
          },
        ],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const licence = await licencePromise;
  const tierBadge = licence.valid ? "Pro" : "Free";
  // Note: stderr is the appropriate channel for diagnostic output in stdio MCP
  // servers; stdout is reserved for the MCP protocol itself.
  console.error(
    `[${SERVER_NAME} v${SERVER_VERSION}] Ready on stdio (${tierBadge} tier). https://raygroup.uk/products/defi-ux-mcp/`,
  );
}

main().catch((err) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, err);
  process.exit(1);
});
