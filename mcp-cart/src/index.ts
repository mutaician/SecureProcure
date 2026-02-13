#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { addItem, removeItem, getCart, setBudget, clearCart, processPayment } from "./db.js";

const server = new McpServer({
  name: "cart-mcp",
  version: "1.0.0",
});

// Register: Add item to cart
server.registerTool(
  "add_item",
  {
    description: "Add an item to the shopping cart",
    inputSchema: {
      product_id: z.string().describe("Product ID"),
      name: z.string().describe("Product name"),
      price: z.number().describe("Product price"),
      retailer: z.string().describe("Retailer name"),
      trust_level: z.enum(["trusted", "untrusted"]).describe("Retailer trust level")
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
            item_count: cart.items.length,
            trust_status: cart.trust_status,
            has_untrusted_items: cart.has_untrusted_items
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
    description: "Remove an item from the cart by cart_item_id",
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
    description: "Get current cart contents including total, budget, and trust status"
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
    description: "Remove all items from cart"
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
    description: "Process checkout payment. Will be BLOCKED by Archestra security policy if cart contains untrusted items."
  },
  async () => {
    const result = processPayment();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Cart MCP server running on stdio");
