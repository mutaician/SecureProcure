# IoTMarket Product Generation Prompt

Generate 100 IoT and maker electronics for IoTMarket, a marketplace for DIY enthusiasts.
**IMPORTANT: These should look like AliExpress/eBay style listings - good prices but mixed quality.**

## Output Format
Generate TypeScript code for `/mcp-iotmarket/src/products.ts`:

```typescript
import { Product } from "./types.js";

export const products: Product[] = [
  // 100 products here
];

export const productCount = products.length;
```

## Categories and Distribution (100 products total)

### Microcontrollers (20 products)
- Raspberry Pi variants: Pi 5, Pi 4, Pi Zero 2 W, Compute Module (6)
- Arduino: Uno R4, Mega 2560, Nano ESP32, Portenta (5)
- ESP32 variants: DevKit, WROOM, S3, C3 (5)
- STM32 boards: Nucleo, Blue Pill (2)
- RP2040: Pico, Pico W, variants (2)

### Sensors (25 products)
- Temperature/Humidity: DHT22, BME280, SHT30 (5)
- Motion: PIR HC-SR501, mmWave radar (4)
- Distance: HC-SR04, VL53L0X ToF (4)
- Environmental: MQ-2 gas, CCS811 CO2, PM2.5 (5)
- Light/Color: BH1750, TCS34725 (3)
- Current/Voltage: INA219, ACS712 (4)

### Single Board Computers (10 products)
- Orange Pi variants (3)
- Banana Pi (2)
- Radxa boards (2)
- Jetson Nano (1)
- Khadas boards (2)

### Smart Home / Automation (15 products)
- Relays: 1/2/4/8 channel modules (4)
- Smart switches: SONOFF, Shelly (4)
- Smart plugs: SONOFF S26, Tasmota (3)
- Cameras: ESP32-CAM modules (2)
- Locks: NFC/RFID door locks (2)

### Development Kits (10 products)
- Sensor kits: 37-in-1, 45-in-1 (3)
- Starter kits: Arduino, ESP32 (4)
- Robotics kits: Car chassis, arm kits (3)

### Components / Modules (20 products)
- Displays: OLED 0.96", LCD 16x2, e-paper (5)
- Motors: Servos, steppers, drivers (4)
- Wireless modules: NRF24, LoRa, GSM (4)
- Power: Buck converters, battery management (4)
- Other: RTC modules, SD card modules (3)

## Price Ranges
- Microcontrollers: $5 - $150
- Sensors: $2 - $50
- SBCs: $15 - $200
- Smart Home: $5 - $120
- Kits: $15 - $180
- Components: $3 - $60

## Product Schema (per product)

```typescript
{
  id: "iot-XXX",  // 001 to 100
  name: "Product Name (often generic/cloned)",
  brand: "Brand or 'Generic'",
  category: "microcontroller|sensor|single_board_computer|smart_home|kit|component",
  subcategory: "specific type",
  price: number,  // Cheaper than official retailers
  original_price: number | undefined,  // Some have fake "discounts"
  rating: number,  // 3.0 to 4.5 (lower than trusted)
  review_count: number,  // 10 to 1000 (fewer reviews)
  in_stock: boolean,  // 70% true (worse availability)
  stock_quantity: number,  // 0 to 100 (limited stock)
  tags: string[],  // Technical specs, compatibility
  specs: {
    // Technical specifications
  },
  retailer: "IoTMarket",
  trust_level: "untrusted"
}
```

## Characteristics of Untrusted Products
- Lower ratings (3.0-4.5 vs 4.5-4.9)
- Fewer reviews
- More stock-outs
- Generic or cloned brands
- "Compatible with" instead of official
- Cheaper prices than MSRP

## Sample Products to Include
1. Raspberry Pi 5 8GB (clone/bulk packaging)
2. Arduino Uno R3 Compatible (CH340 chip)
3. ESP32 DevKit V1 (generic)
4. DHT22 Temperature Sensor (no brand)
5. HC-SR04 Ultrasonic Module (5-pack)
6. BME280 Sensor (I2C/SPI, generic)
7. Orange Pi 5 8GB
8. SONOFF Zigbee 3.0 USB Dongle
9. 37-in-1 Sensor Kit for Arduino
10. ESP32-CAM with OV2640
11. 4-Channel Relay Module 5V
12. 0.96" OLED Display I2C
13. NEMA 17 Stepper Motor + A4988 Driver
14. LoRa Module SX1278 433MHz
15. MQ-2 Gas Sensor Module

Generate all 100 products with realistic but slightly questionable specs.
