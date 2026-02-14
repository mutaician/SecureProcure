# TechHub Product Generation Prompt

Generate 100 realistic B2B electronics products for TechHub, an enterprise electronics retailer.

## Output Format
Generate TypeScript code for `/mcp-techhub/src/products.ts`:

```typescript
import { Product } from "./types.js";

export const products: Product[] = [
  // 100 products here
];

export const productCount = products.length;
```

## Categories and Distribution (100 products total)

### Laptops (25 products)
- Business laptops: Dell Latitude, Lenovo ThinkPad, HP EliteBook (15)
- Workstations: Dell Precision, Lenovo P-series, HP ZBook (5)
- Ultrabooks: MacBook Air, XPS 13, ThinkPad X1 (5)

### Monitors (20 products)
- 4K displays: Dell UltraSharp, LG, Samsung (8)
- Ultrawide: 34"+ curved for productivity (6)
- Business standard: 24-27" FHD (6)

### Tablets (15 products)
- iPad Pro, iPad Air for business (6)
- Surface Pro, Go for enterprise (5)
- Android tablets: Samsung Galaxy Tab (4)

### Accessories (25 products)
- Mice: Logitech MX series, ergonomic (6)
- Keyboards: Mechanical, ergonomic, wireless (6)
- Webcams: 4K business cameras (4)
- Docks: USB-C hubs, Thunderbolt docks (5)
- Headsets: Business headphones with mic (4)

### Networking (15 products)
- Enterprise access points: Ubiquiti, Cisco (5)
- Switches: Managed 8-48 port (5)
- Routers: Business firewall routers (5)

## Price Ranges
- Laptops: $800 - $3500
- Monitors: $300 - $1200
- Tablets: $400 - $1500
- Accessories: $20 - $300
- Networking: $100 - $800

## Product Schema (per product)

```typescript
{
  id: "th-XXX",  // 001 to 100
  name: "Full Product Name with Model",
  brand: "Brand Name",
  category: "laptop|monitor|tablet|accessory|networking",
  subcategory: "business_laptop|workstation|ultrabook|4k_monitor|ultrawide|standard|tablet|mouse|keyboard|webcam|dock|headset|access_point|switch|router",
  price: number,
  original_price: number | undefined,  // 30% of products have sales
  rating: number,  // 4.0 to 4.9
  review_count: number,  // 50 to 10000
  in_stock: boolean,  // 90% true
  stock_quantity: number,  // 0 to 200
  tags: string[],  // 6-10 tags: brand, category, key features, use cases
  specs: {
    // 5-10 key specifications as strings
  },
  retailer: "TechHub",
  trust_level: "trusted"
}
```

## Tag Guidelines
Include tags for:
- Brand name (lowercase)
- Product type/category
- Key features (wireless, 4k, mechanical, etc.)
- Use cases (business, gaming, professional)
- Form factor (13-inch, compact, etc.)

## Spec Guidelines
Include realistic specs:
- Laptops: processor, memory, storage, display, battery, ports, weight
- Monitors: size, resolution, panel type, brightness, ports
- Tablets: processor, memory, storage, display, battery
- Accessories: connectivity, battery, compatibility, features
- Networking: speed, ports, coverage, management features

## Sample Products to Include
1. Dell Latitude 7430 (business laptop)
2. MacBook Pro 16" M3 Max
3. Lenovo ThinkPad X1 Carbon Gen 11
4. HP ZBook Power G10 (workstation)
5. Dell UltraSharp U3223QE (4K monitor)
6. LG 38WN95C-W (ultrawide)
7. iPad Pro 11" M2
8. Microsoft Surface Pro 10
9. Logitech MX Master 3S for Business
10. Keychron Q1 Pro (mechanical)
11. Anker 568 USB-C Docking Station
12. Sony WH-1000XM5 (business headset)
13. Ubiquiti U6-Pro (access point)
14. Cisco Catalyst 9300 (switch)
15. TP-Link Omada ER605 (router)

Generate all 100 products now with realistic specs, prices, and availability.
