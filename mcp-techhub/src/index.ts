#!/usr/bin/env node
/**
 * TechHub MCP Server - Proper MCP SDK implementation
 * Supports both stdio (for local testing) and Streamable HTTP (for Docker/Archestra)
 * 
 * Transport mode detection:
 * - Uses stdio if TRANSPORT_MODE=stdio explicitly set
 * - Uses Streamable HTTP if TRANSPORT_MODE=http OR if running in Docker (no explicit setting)
 * 
 * Note: For local testing via MCP SDK's StdioClientTransport, set TRANSPORT_MODE=stdio
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { z } from "zod";
import { products } from "./products.js";
import { randomUUID } from "crypto";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Transport mode: explicit env var takes precedence
// Default to HTTP for server deployment (Docker, etc.)
// Use TRANSPORT_MODE=stdio explicitly for local testing with MCP clients
const TRANSPORT_MODE = process.env.TRANSPORT_MODE || "http";

// Helper function to create and configure a new MCP server instance
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "techhub-mcp",
    version: "1.0.0",
  });

  // Register: Search products tool
  server.registerTool(
    "search_products",
    {
      description: "Search TechHub electronics catalog. Returns products with trust_level='trusted'.",
      inputSchema: {
        query: z.string().describe("Search query (product name or keywords)"),
        category: z.enum(["laptop", "tablet", "monitor", "accessory"]).optional().describe("Optional product category filter"),
        max_price: z.number().optional().describe("Optional maximum price filter"),
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
            retailer: "TechHub",
            trust_level: "trusted",
            product_count: results.length,
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
    // Stdio transport for local testing - single server instance
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("TechHub MCP server running on stdio");
  } else {
    // Streamable HTTP transport for Docker/Archestra deployment
    const app = express();
    
    // Store active transports and servers by session ID
    const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: McpServer }>();

    // Health check endpoint (needs JSON)
    app.get("/health", (req: Request, res: Response) => {
      res.json({ 
        status: "ok", 
        server: "techhub-mcp", 
        port: PORT, 
        transport: "streamable-http",
        activeSessions: sessions.size
      });
    });

    // MCP endpoint - handles both GET (SSE) and POST (messages)
    // NO body parsing - let StreamableHTTPServerTransport read raw stream
    app.all("/sse", async (req: Request, res: Response) => {
      console.error(`MCP request: ${req.method} /sse`);
      
      // Get session ID from header
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      console.error(`Session ID from header: ${sessionId}`);

      // Reuse existing transport if session exists
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

      // Create new transport and server for new session (initialize request)
      if (req.method === "POST") {
        console.error("Creating new session with new server instance");
        
        try {
          // Create a new server instance for this session
          const server = createMcpServer();
          
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId) => {
              console.error(`Session initialized: ${newSessionId}`);
              sessions.set(newSessionId, { transport, server });
            }
          });

          // Clean up on transport close
          transport.onclose = () => {
            const sid = (transport as any).sessionId;
            if (sid) {
              console.error(`Transport closed for session: ${sid}`);
              sessions.delete(sid);
            }
          };

          // Connect server to transport
          await server.connect(transport);
          console.error("Server connected to transport");
          
          // Handle the current request
          await transport.handleRequest(req, res);
          console.error("Request handled");
        } catch (error) {
          console.error("Error in POST handler:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: String(error) });
          }
        }
      } else if (req.method === "GET") {
        // GET without session - return info
        console.error("GET request without session - returning server info");
        res.json({
          server: "techhub-mcp",
          version: "1.0.0",
          transport: "streamable-http",
          message: "Use POST to initialize MCP session"
        });
      } else {
        res.status(405).json({ error: "Method not allowed" });
      }
    });

    // Also handle root endpoint for compatibility
    app.all("/", async (req: Request, res: Response) => {
      console.error(`Root request: ${req.method} /`);
      // Forward to /sse endpoint
      req.url = "/sse";
      app._router.handle(req, res, () => {
        res.status(404).json({ error: "Not found" });
      });
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.error(`TechHub MCP server running on http://0.0.0.0:${PORT}`);
      console.error(`MCP endpoint: http://localhost:${PORT}/sse`);
      console.error(`Health check: http://localhost:${PORT}/health`);
    });
  }
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
