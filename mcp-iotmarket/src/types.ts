/**
 * TechHub Product Types
 * B2B Electronics Retailer - Enterprise grade products
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  original_price?: number;
  rating: number;
  review_count: number;
  in_stock: boolean;
  stock_quantity: number;
  tags: string[];
  specs: Record<string, string>;
  retailer: string;
  trust_level: "trusted" | "untrusted";
}

export interface SearchResult {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  original_price?: number;
  rating: number;
  review_count: number;
  in_stock: boolean;
  stock_quantity: number;
  // Note: trust_level is intentionally NOT included in search results
}

export interface ProductDetails extends SearchResult {
  tags: string[];
  specs: Record<string, string>;
}
