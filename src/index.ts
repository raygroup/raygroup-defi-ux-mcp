#!/usr/bin/env node
/**
 * Ray Group DeFi UX MCP Server.
 *
 * Exposes the Ray Group DeFi UX rubric, named patterns, and cognitive-bias
 * glossary to AI agents via the Model Context Protocol over stdio.
 *
 * v0.1 — free tier, 5 tools, local stdio. Premium tier (paid, hosted, with
 * screenshot-based audit + extended corpus) is on the roadmap.
 *
 * Marketing page: https://raygroup.uk/products/defi-ux-mcp/
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

const SERVER_NAME = "raygroup-defi-ux";
const SERVER_VERSION = "0.1.0";

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      searchDefiUxTool,
      getRubricTool,
      getPatternTool,
      getGlossaryEntryTool,
      listCategoriesTool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;

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
      return handleGetPattern({
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
      });

    case "get_glossary_entry":
      return handleGetGlossaryEntry({
        slug: typeof a.slug === "string" ? a.slug : undefined,
      });

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
  // Note: stderr is the appropriate channel for diagnostic output in stdio MCP
  // servers; stdout is reserved for the MCP protocol itself.
  console.error(
    `[${SERVER_NAME} v${SERVER_VERSION}] Ready on stdio. https://raygroup.uk/products/defi-ux-mcp/`,
  );
}

main().catch((err) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, err);
  process.exit(1);
});
