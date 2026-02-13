// Simple in-memory database for hackathon (no native bindings needed)
import { Cart, CartItem } from "./types.js";
import { randomUUID } from "crypto";

// In-memory storage
const cartItems: Map<number, CartItem> = new Map();
let nextId = 1;
let budget = 1000;

// Helper to determine trust level from product_id or retailer
function determineTrustLevel(product_id: string, retailer: string): "trusted" | "untrusted" {
  // Product ID prefixes: th-=TechHub, gz-=GadgetZone, iot-=IoTMarket
  if (product_id.startsWith("iot-")) return "untrusted";
  if (product_id.startsWith("th-")) return "trusted";
  if (product_id.startsWith("gz-")) return "trusted";
  
  // Fallback to retailer name
  if (retailer.toLowerCase() === "iotmarket") return "untrusted";
  return "trusted";
}

export function addItem(
  product_id: string,
  name: string,
  price: number,
  retailer: string,
  trust_level?: string
): CartItem {
  const id = nextId++;
  // ALWAYS auto-determine trust_level from product_id - ignore passed value
  // This prevents agents from overriding security classification
  const determinedTrust = determineTrustLevel(product_id, retailer);
    
  const item: CartItem = {
    cart_item_id: id,
    id: product_id,
    name,
    price,
    retailer,
    trust_level: determinedTrust,
    category: "",
    rating: 0,
    in_stock: true,
    added_at: new Date().toISOString()
  };
  cartItems.set(id, item);
  return item;  
}

export function removeItem(cart_item_id: number): boolean {
  return cartItems.delete(cart_item_id);
}

export function getCart(): Cart {
  const items = Array.from(cartItems.values()).sort((a, b) => 
    new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
  );
  
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const has_untrusted_items = items.some(item => item.trust_level === "untrusted");
  
  return {
    items,
    total,
    budget,
    has_untrusted_items,
    trust_status: items.length === 0 ? "empty" : has_untrusted_items ? "has_untrusted" : "all_trusted"
  };
}

export function setBudget(amount: number): void {
  budget = amount;
}

export function clearCart(): void {
  cartItems.clear();
}

export function processPayment(userConfirmed: boolean = false): { 
  success: boolean; 
  requires_confirmation?: boolean;
  receipt_id: string; 
  message: string;
  untrusted_retailers?: string[];
} {
  const cart = getCart();
  
  if (cart.items.length === 0) {
    return { success: false, receipt_id: "", message: "Cart is empty" };
  }
  
  if (cart.total > cart.budget) {
    return { 
      success: false, 
      receipt_id: "", 
      message: `Budget exceeded: $${cart.total} > $${cart.budget}` 
    };
  }
  
  // Check for untrusted items - require user confirmation
  if (cart.has_untrusted_items && !userConfirmed) {
    const untrustedRetailers = [...new Set(
      cart.items
        .filter(item => item.trust_level === "untrusted")
        .map(item => item.retailer)
    )];
    
    return { 
      success: false, 
      requires_confirmation: true,
      receipt_id: "", 
      message: `Payment requires confirmation: Cart contains items from ${untrustedRetailers.join(", ")}. These retailers are not verified. Please confirm if you want to proceed with the purchase.`,
      untrusted_retailers: untrustedRetailers
    };
  }
  
  // Success - generate receipt and clear cart
  const receipt_id = `RCP-${randomUUID().slice(0, 8).toUpperCase()}`;
  clearCart();
  
  return { 
    success: true, 
    receipt_id, 
    message: `Payment processed successfully. Receipt: ${receipt_id}` 
  };
}
