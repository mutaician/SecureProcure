/**
 * Smart Search Algorithm for Products
 * Multi-word matching with relevance scoring
 */

import { Product, SearchResult, ProductDetails } from "./types.js";

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  in_stock?: boolean;
}

export interface SearchOptions {
  limit?: number;
  sort_by?: "relevance" | "price_asc" | "price_desc" | "rating" | "name";
}

/**
 * Search products using multi-word relevance scoring
 * 
 * Algorithm:
 * 1. Split query into individual words
 * 2. For each product, count how many query words match
 * 3. Weight matches: name (3x), brand (2x), tags (2x), category (1x), subcategory (1x)
 * 4. Sort by relevance score (descending)
 * 
 * Example: "samsung phone" will match:
 * - "Samsung Galaxy S24" (brand + name match = high score)
 * - "Samsung Galaxy Tab" (brand + partial name = medium score)
 * - "iPhone 15" (name contains "phone" = low score)
 */
export function searchProducts(
  products: Product[],
  query: string,
  filters?: SearchFilters,
  options?: SearchOptions
): { results: SearchResult[]; total: number } {
  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);
  
  if (queryWords.length === 0) {
    return { results: [], total: 0 };
  }

  // Score and filter products
  const scoredProducts = products
    .map(product => {
      const searchText = {
        name: product.name.toLowerCase(),
        brand: product.brand.toLowerCase(),
        category: product.category.toLowerCase(),
        subcategory: product.subcategory.toLowerCase(),
        tags: product.tags.map(t => t.toLowerCase()).join(" "),
      };

      let score = 0;
      let matchedWords = 0;

      for (const word of queryWords) {
        let wordScore = 0;
        
        // Exact matches get higher scores
        if (searchText.name.includes(word)) wordScore += 3;
        if (searchText.brand.includes(word)) wordScore += 2;
        if (searchText.tags.includes(word)) wordScore += 2;
        if (searchText.category.includes(word)) wordScore += 1;
        if (searchText.subcategory.includes(word)) wordScore += 1;
        
        // Partial matches (e.g., "phone" matches "iphone", "samsung phone")
        if (wordScore === 0) {
          if (searchText.name.split(/\s+/).some(part => part.includes(word))) wordScore += 1.5;
          if (searchText.tags.split(/\s+/).some(part => part.includes(word))) wordScore += 1;
        }

        if (wordScore > 0) {
          score += wordScore;
          matchedWords++;
        }
      }

      // Boost score for matching all query words
      if (matchedWords === queryWords.length) {
        score *= 1.5;
      }

      return { product, score, matchedWords };
    })
    .filter(({ score, product }) => {
      // Must match at least one word
      if (score === 0) return false;

      // Apply filters
      if (filters?.category && product.category !== filters.category) return false;
      if (filters?.subcategory && product.subcategory !== filters.subcategory) return false;
      if (filters?.brand && product.brand !== filters.brand) return false;
      if (filters?.min_price !== undefined && product.price < filters.min_price) return false;
      if (filters?.max_price !== undefined && product.price > filters.max_price) return false;
      if (filters?.in_stock === true && !product.in_stock) return false;

      return true;
    });

  // Sort by score (relevance) by default
  let sorted = scoredProducts.sort((a, b) => b.score - a.score);

  // Apply custom sorting if specified
  if (options?.sort_by) {
    switch (options.sort_by) {
      case "price_asc":
        sorted = sorted.sort((a, b) => a.product.price - b.product.price);
        break;
      case "price_desc":
        sorted = sorted.sort((a, b) => b.product.price - a.product.price);
        break;
      case "rating":
        sorted = sorted.sort((a, b) => b.product.rating - a.product.rating);
        break;
      case "name":
        sorted = sorted.sort((a, b) => a.product.name.localeCompare(b.product.name));
        break;
    }
  }

  // Apply limit
  const limit = options?.limit || 50;
  const limited = sorted.slice(0, limit);

  // Map to SearchResult (without trust_level)
  const results: SearchResult[] = limited.map(({ product }) => ({
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

  return { results, total: scoredProducts.length };
}

/**
 * Get product details by ID
 */
export function getProductById(products: Product[], id: string): Product | undefined {
  return products.find(p => p.id === id);
}

/**
 * Compare multiple products
 */
export function compareProducts(products: Product[], ids: string[]): ProductDetails[] {
  return ids
    .map(id => getProductById(products, id))
    .filter((p): p is Product => p !== undefined)
    .map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      original_price: p.original_price,
      rating: p.rating,
      review_count: p.review_count,
      in_stock: p.in_stock,
      stock_quantity: p.stock_quantity,
      tags: p.tags,
      specs: p.specs,
    }));
}

/**
 * Get all unique categories
 */
export function getCategories(products: Product[]): string[] {
  return [...new Set(products.map(p => p.category))].sort();
}

/**
 * Get all unique brands
 */
export function getBrands(products: Product[]): string[] {
  return [...new Set(products.map(p => p.brand))].sort();
}
