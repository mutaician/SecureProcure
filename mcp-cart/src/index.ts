#!/usr/bin/env node
/**
 * Cart MCP Server - Shopping cart with trust-level tracking
 * Supports both stdio (for local testing) and Streamable HTTP (for Docker/Archestra)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { z } from "zod";
import { addItem, removeItem, getCart, setBudget, clearCart, processPayment } from "./db.js";
import { randomUUID } from "crypto";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3004;
const TRANSPORT_MODE = process.env.TRANSPORT_MODE || "http";

// Helper function to create and configure a new MCP server instance
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "cart-mcp",
    version: "1.0.0",
  });

  // Register: Add item to cart
  server.registerTool(
    "add_item",
    {
      description: "Add a product to the shopping cart.",
      inputSchema: {
        product_id: z.string().describe("Product ID"),
        name: z.string().describe("Product name"),
        price: z.number().describe("Product price"),
        retailer: z.string().describe("Retailer name"),
        trust_level: z.enum(["trusted", "untrusted"]).describe("Retailer classification")
      }
    },
    async ({ product_id, name, price, retailer, trust_level }) => {
      const item = addItem(product_id, name, price, retailer, trust_level);
      const cart = getCart();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: `Added ${name} to cart`,
            item,
            cart_summary: {
              total: cart.total,
              item_count: cart.items.length
            }
          }, null, 2)
        }]
      };
    }
  );

  // Register: Remove item from cart
  server.registerTool(
    "remove_item",
    {
      description: "Remove an item from the cart by its cart item ID.",
      inputSchema: {
        cart_item_id: z.number().describe("Cart item ID to remove")
      }
    },
    async ({ cart_item_id }) => {
      const removed = removeItem(cart_item_id);
      const cart = getCart();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: removed,
            message: removed ? "Item removed" : "Item not found",
            cart
          }, null, 2)
        }]
      };
    }
  );

  // Register: Get cart contents
  server.registerTool(
    "get_cart",
    {
      description: "Get current cart contents."
    },
    async () => {
      const cart = getCart();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            cart,
            security_note: cart.has_untrusted_items 
              ? "⚠️ Cart contains items from untrusted retailers. Checkout will be blocked." 
              : "✅ Cart is secure for checkout."
          }, null, 2)
        }]
      };
    }
  );

  // Register: Set budget
  server.registerTool(
    "set_budget",
    {
      description: "Set the shopping budget limit",
      inputSchema: {
        amount: z.number().describe("Budget amount")
      }
    },
    async ({ amount }) => {
      setBudget(amount);
      const cart = getCart();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: `Budget set to $${amount}`,
            budget: amount,
            current_total: cart.total,
            remaining: amount - cart.total
          }, null, 2)
        }]
      };
    }
  );

  // Register: Clear cart
  server.registerTool(
    "clear_cart",
    {
      description: "Remove all items from the cart."
    },
    async () => {
      clearCart();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Cart cleared"
          }, null, 2)
        }]
      };
    }
  );

  // Register: Process payment
  server.registerTool(
    "process_payment",
    {
      description: "Process checkout payment. If cart contains items from unverified retailers, will return requires_confirmation=true and the user must confirm before retrying.",
      inputSchema: {
        user_confirmed: z.boolean().optional().describe("Set to true if user has confirmed they want to proceed with purchase from unverified retailers")
      }
    },
    async ({ user_confirmed }) => {
      const result = processPayment(user_confirmed === true);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
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
    console.error("Cart MCP server running on stdio");
  } else {
    const app = express();
    const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: McpServer }>();

    app.get("/health", (req: Request, res: Response) => {
      res.json({ 
        status: "ok", 
        server: "cart-mcp", 
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
          server: "cart-mcp",
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
      console.error(`Cart MCP server running on http://0.0.0.0:${PORT}`);
      console.error(`MCP endpoint: http://localhost:${PORT}/sse`);
      console.error(`Health check: http://localhost:${PORT}/health`);
    });
  }
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
