#!/usr/bin/env node
/**
 * GadgetZone MCP Server - Mobile electronics catalog
 * Supports both stdio (for local testing) and Streamable HTTP (for Docker/Archestra)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { z } from "zod";
import { products } from "./products.js";
import { randomUUID } from "crypto";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
const TRANSPORT_MODE = process.env.TRANSPORT_MODE || "http";

// Helper function to create and configure a new MCP server instance
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "gadgetzone-mcp",
    version: "1.0.0",
  });

  // Register: Search products tool
  server.registerTool(
    "search_products",
    {
      description: "Search GadgetZone consumer electronics catalog by product name, brand, category, or keywords. Specializes in smartphones, tablets, audio gear, and mobile accessories.",
      inputSchema: {
        query: z.string().describe("Search query (product name or keywords)"),
        category: z.enum(["phone", "accessory", "cable", "charger"]).optional().describe("Optional product category filter"),
        max_price: z.number().optional().describe("Optional maximum price filter")
      }
    },
    async ({ query, category, max_price }) => {
      // Smart search: multi-word matching with tags
      const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);
      
      const scoredResults = products
        .map(p => {
          const searchText = [
            p.name,
            p.brand,
            p.category,
            p.subcategory,
            ...p.tags
          ].join(" ").toLowerCase();
          
          let score = 0;
          for (const word of queryWords) {
            if (p.name.toLowerCase().includes(word)) score += 3;
            else if (p.brand.toLowerCase().includes(word)) score += 2;
            else if (p.tags.some(t => t.toLowerCase().includes(word))) score += 2;
            else if (p.category.toLowerCase().includes(word)) score += 1;
            else if (p.subcategory.toLowerCase().includes(word)) score += 1;
            else if (searchText.includes(word)) score += 0.5;
          }
          
          // Boost if all words match
          const allWordsMatch = queryWords.every(word => searchText.includes(word));
          if (allWordsMatch) score *= 1.5;
          
          return { product: p, score };
        })
        .filter(({ score, product }) => {
          if (score === 0) return false;
          if (category && product.category !== category) return false;
          if (max_price && product.price > max_price) return false;
          return true;
        })
        .sort((a, b) => b.score - a.score);

      const results = scoredResults.map(({ product }) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory,
        price: product.price,
        original_price: product.original_price,
        rating: product.rating,
        review_count: product.review_count,
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity,
      }));

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            retailer: "GadgetZone",
            query,
            total_results: scoredResults.length,
            products: results
          }, null, 2)
        }]
      };
    }
  );

  return server;
}

// Start server based on transport mode
async function main() {
  console.error(`Transport mode: ${TRANSPORT_MODE}`);
  
  if (TRANSPORT_MODE === "stdio") {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GadgetZone MCP server running on stdio");
  } else {
    const app = express();
    const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: McpServer }>();

    app.get("/health", (req: Request, res: Response) => {
      res.json({ 
        status: "ok", 
        server: "gadgetzone-mcp", 
        port: PORT, 
        transport: "streamable-http",
        activeSessions: sessions.size
      });
    });

    app.all("/sse", async (req: Request, res: Response) => {
      console.error(`MCP request: ${req.method} /sse`);
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      console.error(`Session ID from header: ${sessionId}`);

      if (sessionId && sessions.has(sessionId)) {
        const session = sessions.get(sessionId)!;
        console.error(`Reusing existing transport for session: ${sessionId}`);
        try {
          await session.transport.handleRequest(req, res);
        } catch (error) {
          console.error("Error handling request:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
          }
        }
        return;
      }

      if (req.method === "POST") {
        console.error("Creating new session with new server instance");
        try {
          const server = createMcpServer();
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId) => {
              console.error(`Session initialized: ${newSessionId}`);
              sessions.set(newSessionId, { transport, server });
            }
          });

          transport.onclose = () => {
            const sid = (transport as any).sessionId;
            if (sid) {
              console.error(`Transport closed for session: ${sid}`);
              sessions.delete(sid);
            }
          };

          await server.connect(transport);
          console.error("Server connected to transport");
          await transport.handleRequest(req, res);
          console.error("Request handled");
        } catch (error) {
          console.error("Error in POST handler:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: String(error) });
          }
        }
      } else if (req.method === "GET") {
        res.json({
          server: "gadgetzone-mcp",
          version: "1.0.0",
          transport: "streamable-http",
          message: "Use POST to initialize MCP session"
        });
      } else {
        res.status(405).json({ error: "Method not allowed" });
      }
    });

    app.all("/", async (req: Request, res: Response) => {
      req.url = "/sse";
      app._router.handle(req, res, () => {
        res.status(404).json({ error: "Not found" });
      });
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.error(`GadgetZone MCP server running on http://0.0.0.0:${PORT}`);
      console.error(`MCP endpoint: http://localhost:${PORT}/sse`);
      console.error(`Health check: http://localhost:${PORT}/health`);
    });
  }
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
