# GadgetZone Product Generation Prompt

Generate 100+ realistic consumer mobile electronics for GadgetZone, a mobile-focused retailer.

## Output Format
Generate TypeScript code for `/mcp-gadgetzone/src/products.ts`:

```typescript
import { Product } from "./types.js";

export const products: Product[] = [
  // 100 products here
];

export const productCount = products.length;
```

## Categories and Distribution (100 products total)

### Smartphones (35 products)
- iPhone: 15, 15 Pro, 15 Pro Max, 14 series (10)
- Samsung: Galaxy S24 series, S23 series, A series (10)
- Google: Pixel 8, 8 Pro, 7a (5)
- OnePlus: 12, 12R, Open (4)
- Xiaomi: 14 series, Redmi (4)
- Others: Nothing Phone, ASUS ROG (2)

### Tablets (15 products)
- iPad: Pro 12.9, Pro 11, Air, mini (6)
- Samsung: Galaxy Tab S9 series, A series (5)
- Others: Fire HD, Lenovo Tab (4)

### Audio (25 products)
- True wireless: AirPods Pro, Galaxy Buds, Sony WF (10)
- Over-ear: Sony WH, Bose QC, AirPods Max (8)
- Speakers: JBL, Bose, Sonos portable (7)

### Charging (15 products)
- Power banks: Anker, Baseus (6)
- Wireless chargers: MagSafe, Qi2 (5)
- Chargers: GaN chargers, multi-port (4)

### Wearables (10 products)
- Smartwatches: Apple Watch Series 9, Ultra 2, Galaxy Watch 6 (6)
- Fitness trackers: Fitbit, Garmin (4)

## Price Ranges
- Smartphones: $300 - $1400
- Tablets: $150 - $1100
- Audio: $30 - $550
- Charging: $10 - $150
- Wearables: $100 - $800

## Product Schema (per product)

```typescript
{
  id: "gz-XXX",  // 001 to 100
  name: "Full Product Name",
  brand: "Brand Name",
  category: "phone|tablet|audio|charging|wearable",
  subcategory: "smartphone|tablet|earbuds|headphones|speaker|power_bank|wireless_charger|charger|smartwatch|fitness_tracker",
  price: number,
  original_price: number | undefined,  // 40% have discounts
  rating: number,  // 3.8 to 4.9
  review_count: number,  // 100 to 20000
  in_stock: boolean,  // 85% true
  stock_quantity: number,  // 0 to 500
  tags: string[],  // 6-10 tags
  specs: {
    // 5-10 key specifications
  },
  retailer: "GadgetZone",
  trust_level: "trusted"
}
```

## Sample Products to Include
1. iPhone 15 Pro Max 256GB
2. Samsung Galaxy S24 Ultra
3. Google Pixel 8 Pro
4. OnePlus 12
5. iPad Pro 12.9" M2
6. Samsung Galaxy Tab S9+
7. AirPods Pro 2nd Gen USB-C
8. Sony WH-1000XM5
9. JBL Flip 6
10. Anker Prime 20000mAh 200W
11. Apple Watch Ultra 2
12. Samsung Galaxy Watch 6 Classic
13. Belkin MagSafe 3-in-1 Charger
14. Anker 737 GaNPrime 120W
15. Nothing Ear (2)

Generate all 100+ products with current 2024-2026 model specs and realistic pricing.
