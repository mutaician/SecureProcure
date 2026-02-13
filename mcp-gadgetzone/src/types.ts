export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  in_stock: boolean;
  retailer: string;
  trust_level: "trusted" | "untrusted";
}

export interface CartItem extends Product {
  cart_item_id: number;
  added_at: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  budget: number;
  has_untrusted_items: boolean;
  trust_status: "all_trusted" | "has_untrusted" | "empty";
}

export interface SearchProductsArgs {
  query: string;
  category?: string;
  max_price?: number;
}

export interface AddItemArgs {
  product_id: string;
  name: string;
  price: number;
  retailer: string;
  trust_level: "trusted" | "untrusted";
}

export interface RemoveItemArgs {
  cart_item_id: number;
}

export interface SetBudgetArgs {
  amount: number;
}
