#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { products } from "./products.js";

const server = new McpServer({
  name: "gadgetzone-mcp",
  version: "1.0.0",
});

// Register: Search products
server.registerTool(
  "search_products",
  {
    description: "Search GadgetZone mobile electronics catalog. Returns products with trust_level='trusted'.",
    inputSchema: {
      query: z.string().describe("Search query (product name or keywords)"),
      category: z.enum(["phone", "accessory", "cable", "charger"]).optional().describe("Optional product category filter"),
      max_price: z.number().optional().describe("Optional maximum price filter")
    }
  },
  async ({ query, category, max_price }) => {
    const results = products.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) ||
                          p.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || p.category === category;
      const matchesPrice = !max_price || p.price <= max_price;
      return matchesQuery && matchesCategory && matchesPrice;
    });

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          retailer: "GadgetZone",
          trust_level: "trusted",
          product_count: results.length,
          products: results
        }, null, 2)
      }]
    };
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("GadgetZone MCP server running on stdio");
