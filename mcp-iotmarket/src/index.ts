#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { products } from "./products.js";

const server = new McpServer({
  name: "iotmarket-mcp",
  version: "1.0.0",
});

// Register: Search products
server.registerTool(
  "search_products",
  {
    description: "Search IoTMarket hobbyist electronics catalog. WARNING: Returns products with trust_level='untrusted'. Verify seller before purchase.",
    inputSchema: {
      query: z.string().describe("Search query (product name or keywords)"),
      category: z.enum(["iot_kit", "sensor", "smart_home", "microcontroller"]).optional().describe("Optional product category filter"),
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
          retailer: "IoTMarket",
          trust_level: "untrusted",
          warning: "New marketplace - verify seller before purchase",
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
console.error("IoTMarket MCP server running on stdio");
