/** Shared Pro upgrade response helper. */

export function upgradeResponse(toolName: string, freeHint: string) {
  return {
    content: [
      {
        type: "text" as const,
        text:
          `Pro feature. \`${toolName}\` requires a Ray Group DeFi UX MCP Pro licence — set RAYGROUP_API_KEY in your MCP client config.\n\n` +
          "Pricing: https://raygroup.uk/products/defi-ux-mcp/pricing ($29/mo or $290/yr)\n\n" +
          freeHint,
      },
    ],
    isError: false,
  };
}
