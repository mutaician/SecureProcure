# SecureProcure 🛡️

> **AI-Powered Procurement with Trust-Aware Security**
> 
> A demonstration of autonomous agent systems with security guardrails for electronics purchasing.

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Detailed Setup Guide](#-detailed-setup-guide)
- [Agent Configuration](#-agent-configuration)
- [Testing the System](#-testing-the-system)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)

---

## 🎯 Problem Statement

In modern procurement systems, AI agents autonomously search for products, compare prices, and execute purchases. However, this creates significant security risks:

### The "Lethal Trifecta" of Agent Systems
1. **Untrusted Data Sources**: Agents may pull product data from unverified retailers
2. **Payment Capabilities**: Agents can execute financial transactions
3. **Autonomous Decision Making**: Agents operate without human oversight

**Real-world scenario**: An AI agent searching for a Raspberry Pi finds the cheapest option on a sketchy marketplace. Without security guardrails, it would automatically purchase from an untrusted vendor, potentially leading to:
- Fraudulent transactions
- Data theft
- Supply chain compromise

### Current Solutions Fall Short
- Most systems either trust the agent completely
- Or require humans to approve every step (defeating the purpose of automation)
- No middle ground for intelligent security policies

---

## 💡 Solution Overview

**SecureProcure** demonstrates a **trust-aware procurement system** where:

1. **Autonomous Agents** search for products across multiple retailers
2. **Security Layer** validates trust levels at payment time
3. **Human-in-the-Loop** only when security policies trigger
4. **Observable Decision Making** shows why actions were taken

### Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Multi-Retailer Search** | Searches TechHub, GadgetZone, and IoTMarket simultaneously |
| 🤖 **Autonomous Agents** | Discovery, Checkout, and Orchestrator agents work together |
| 🛡️ **Trust-Based Security** | Payment blocked for untrusted retailers until human confirms |
| 💰 **Budget Management** | Built-in budget tracking and enforcement |
| 🔒 **Transparent Policies** | Clear security decisions visible to users |

### Demo Flow

```
User: "I need a Raspberry Pi under $100"

Discovery Agent → Searches all retailers
               → Finds cheapest at IoTMarket ($89)
               
Orchestrator  → Presents option to user
               → User confirms
               
Checkout Agent → Adds to cart
               → Attempts payment
               → ⚠️ BLOCKED: Untrusted retailer
               
Orchestrator  → Asks user: "This retailer isn't verified. Proceed?"
               → User: "Yes" / "Find alternative"
               
[If Yes]     → Payment completes
[If No]      → Finds alternative from trusted retailer
```

---

## 🏗️ Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│              (Archestra Platform - Port 3000)               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Procurement Orchestrator Agent                 │
│         (Coordinates Discovery → Checkout flow)             │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│  Discovery Agent    │       │  Checkout Agent     │
│                     │       │                     │
│  • Search retailers │       │  • Cart management  │
│  • Compare prices   │       │  • Payment processing│
│  • Pick best option │       │  • Security validation│
└─────────┬───────────┘       └──────────┬──────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MCP Servers                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │
│  │TechHub  │ │GadgetZone│ │IoTMarket│ │  Cart Service   │  │
│  │:3001    │ │:3002     │ │:3003    │ │   :3004         │  │
│  │TRUSTED  │ │TRUSTED   │ │UNTRUSTED│ │  (persistent)   │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Trust Levels

| Retailer | Trust Level | Product Categories |
|----------|-------------|-------------------|
| **TechHub** | ✅ Trusted | B2B Electronics (laptops, monitors, enterprise) |
| **GadgetZone** | ✅ Trusted | Consumer Mobile (phones, tablets, accessories) |
| **IoTMarket** | ⚠️ Untrusted | IoT/Maker Components (cheaper but unverified) |

### Technology Stack

| Component | Technology |
|-----------|------------|
| **Orchestration Platform** | [Archestra](https://archestra.ai/) |
| **Agent Framework** | Multi-agent system with specialized roles |
| **MCP Transport** | StreamableHTTP (JSON-RPC over HTTP) |
| **MCP Servers** | Node.js + Express + TypeScript |
| **Cart Database** | In-memory with payment validation |
| **Deployment** | Docker Compose on Digital Ocean |

---

## 📋 Prerequisites

### System Requirements

- **Docker** 20.10+ and Docker Compose
- **Node.js** 18+ (for local development)
- **Git**
- **4GB RAM** minimum (for running all services)

### Accounts Needed

1. **Digital Ocean** (or any VPS provider) - for deployment
2. **OpenAI API Key** - for agent LLM capabilities
3. **(Optional)** GitHub Student Pack - $200 Digital Ocean credit

### Local Development (Optional)

```bash
# Install pnpm
npm install -g pnpm

# Clone repository
git clone https://github.com/mutaician/SecureProcure.git
cd secureprocure

# Install dependencies
pnpm install

# Build all MCP servers
pnpm run build:all
```

---

## 🚀 Quick Start

### 1. Clone and Prepare

```bash
git https://github.com/mutaician/SecureProcure.git
cd secureprocure
```

### 2. Start MCP Servers

```bash
docker-compose -f docker-compose.mcp.yml up -d
```

Verify they're running:
```bash
curl http://secureprocure_techhub_1:3001/health  # TechHub
curl http://secureprocure_gadgetzone_1:3002/health  # GadgetZone
curl http://secureprocure_iotmarket_1:3003/health  # IoTMarket
curl http://secureprocure_cart_1:3004/health  # Cart
```

### 3. Start Archestra

```bash
docker run -d \
  --name archestra \
  -p 3000:3000 \
  -p 9000:9000 \
  -e ARCHESTRA_QUICKSTART=true \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v archestra-postgres-data:/var/lib/postgresql/data \
  -v archestra-app-data:/app/data \
  archestra/platform:latest
```

### 4. Access the UI

Open: `http://localhost:3000`

---

## 📖 Detailed Setup Guide

### Production Deployment (Digital Ocean)

#### Step 1: Create Droplet

**Recommended specs:**
- **Plan**: Basic, Shared CPU
- **Size**: 4GB RAM / 2 vCPUs ($24/mo, or FREE with GitHub Student Pack)
- **Region**: Closest to your location
- **Image**: Ubuntu 22.04 (LTS) x64
- **Authentication**: Password or SSH key

#### Step 2: Initial Setup

SSH into your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

Update system:
```bash
apt update && apt upgrade -y
```

Install Docker:
```bash
curl -fsSL https://get.docker.com | sh
apt install docker-compose -y
```

Add swap (safety buffer):
```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

#### Step 3: Deploy MCP Servers

```bash
# Clone repository
git clone https://github.com/mutaician/SecureProcure.git
cd secureprocure

# Update docker-compose to bind to all interfaces
sed -i 's/"3001:3001"/"0.0.0.0:3001:3001"/' docker-compose.mcp.yml
sed -i 's/"3002:3002"/"0.0.0.0:3002:3002"/' docker-compose.mcp.yml
sed -i 's/"3003:3003"/"0.0.0.0:3003:3003"/' docker-compose.mcp.yml
sed -i 's/"3004:3004"/"0.0.0.0:3004:3004"/' docker-compose.mcp.yml

# Start MCP servers
docker-compose -f docker-compose.mcp.yml up -d
```

#### Step 4: Deploy Archestra

```bash
docker pull archestra/platform:latest

docker run -d \
  --name archestra \
  -p 0.0.0.0:3000:3000 \
  -p 0.0.0.0:9000:9000 \
  -e ARCHESTRA_QUICKSTART=true \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v archestra-postgres-data:/var/lib/postgresql/data \
  -v archestra-app-data:/app/data \
  archestra/platform:latest
```

#### Step 5: Configure Firewall

```bash
ufw allow 22/tcp     # SSH
ufw allow 3000/tcp   # Archestra UI
ufw allow 9000/tcp   # Archestra API
ufw allow 3001/tcp   # TechHub MCP
ufw allow 3002/tcp   # GadgetZone MCP
ufw allow 3003/tcp   # IoTMarket MCP
ufw allow 3004/tcp   # Cart MCP
ufw enable
```

#### Step 6: Access Your Deployment

- **Archestra UI**: `http://YOUR_DROPLET_IP:3000`
- **MCP Health Checks**:
  - `http://YOUR_DROPLET_IP:3001/health`
  - `http://YOUR_DROPLET_IP:3002/health`
  - `http://YOUR_DROPLET_IP:3003/health`
  - `http://YOUR_DROPLET_IP:3004/health`

---

## 🤖 Agent Configuration

### Overview

SecureProcure uses a **3-agent architecture**:

| Agent | Type | Purpose |
|-------|------|---------|
| `discovery-agent` | Sub-agent | Searches all retailers, finds best products |
| `checkout-agent` | Sub-agent | Manages cart and payment processing |
| `procurement-orchestrator` | Parent agent | Coordinates the full workflow |

### Step 1: Configure MCP Servers in Archestra

Navigate to **MCP Registry** → **Add MCP Server** → **Remote**

| Name | Server URL | Authentication |
|------|------------|----------------|
| TechHub | `http://secureprocure_techhub_1:3001/sse` | None |
| GadgetZone | `http://secureprocure_gadgetzone_1:3002/sse` | None |
| IoTMarket | `http://secureprocure_iotmarket_1:3003/sse` | None |
| Cart | `http://secureprocure_cart_1:3004/sse` | None |

> **Note**: Use your server's public IP (or `localhost` for local development). The URL **must end in `/sse`** for Archestra's StreamableHTTP transport.

### Step 2: Create Discovery Agent

Navigate to **Agents** → **Create Agent**

**Basic Settings:**
- **Name**: `discovery-agent`
- **Description**: `Product researcher that finds the best electronics across all retailers. Returns a single recommendation with alternatives if needed. Call this when you need to find products.`
- **Model**: gpt-5.2

**System Prompt:**
```
You are a product research specialist. Find the best electronics for the given requirements.

INSTRUCTIONS:
1. Search ALL retailers (TechHub, GadgetZone, IoTMarket)
2. Pick the single best option based on: price, specs, availability
3. Return your findings to the parent agent

RETURNS:
- Best product found
- Price
- Why it's the best choice
- 1-2 alternatives if relevant

Be decisive. Don't ask clarifying questions unless absolutely critical.
```

**MCP Servers:** Select from registry (TechHub, GadgetZone, IoTMarket)

### Step 3: Create Checkout Agent

Navigate to **Agents** → **Create Agent**

**Basic Settings:**
- **Name**: `checkout-agent`
- **Description**: `Handles cart operations and payments. Call this to add items to cart and process checkout. Will request user confirmation if needed.`
- **Model**: gpt-5.2

**System Prompt:**
```
You are a checkout handler. Complete purchases efficiently.

INSTRUCTIONS:
1. Add items to cart using add_item
2. Show cart summary
3. Call process_payment()
4. If payment returns "requires_confirmation" → ask user for confirmation
5. If user confirms → retry with user_confirmed=true
6. Return result to parent agent

Don't explain technical details. Just get it done.
```

**MCP Servers:** Select from registry (Cart)

### Step 4: Create Orchestrator Agent

Navigate to **Agents** → **Create Agent**

**Basic Settings:**
- **Name**: `procurement-orchestrator` (or just `orchestrator`)
- **Description**: `Handles electronics procurement from start to finish. Takes user requests, delegates to specialists, and drives the process forward. Main entry point for all purchasing requests.`
- **Model**: gpt-5.2
- **Enable as Chat Agent**: ✅ (This makes it available in the chat interface)

**System Prompt:**
```
You are a procurement assistant. Help users buy electronics efficiently.

WORKFLOW:
1. User tells you what they want
2. Delegate to discovery-agent to find the best product
3. Present recommendation to user
4. If user approves, delegate to checkout-agent to complete purchase
5. Handle payment confirmation if needed

DELEGATION PATTERN:
- Discovery Agent: "Find me [product]"
- Checkout Agent: "Add [specific product] to cart and checkout"

BE PROACTIVE:
- Don't ask "What's your budget?" - if they care, they'll mention it
- Don't ask "What specs?" - pick good defaults
- Don't present 10 options - pick the best one
- Only pause for: budget constraints, final confirmation, security warnings

EXAMPLE FLOWS:

User: "I want a MacBook Pro"
→ Discovery: Finds MacBook Pro 14" M3 at TechHub $1999
→ You: "Found MacBook Pro 14" M3 for $1999. Add to cart?"
→ User: "Yes"
→ Checkout: Adds, shows total, processes payment
→ Done!

User: "Get me a Raspberry Pi under $100"
→ Discovery: Finds Raspberry Pi 5 Kit at IoTMarket for $89
→ You: "Found Raspberry Pi 5 Kit for $89. Add to cart?"
→ User: "Sure"
→ Checkout: Adds, attempts payment
→ Payment: Returns "requires_confirmation" (unverified retailer)
→ You: "This retailer isn't verified. Do you want to proceed?"
→ User: "Yes" (or "No, find another")
→ Complete purchase (or search alternatives)

KEEP IT MOVING:
- One question at a time
- Make decisions for the user when possible
- Only pause for: final yes/no, security confirmation, errors
```

**Sub-Agent Connections:**
- discovery-agent
- checkout-agent

---

## 🧪 Testing the System

### Test 1: Simple Purchase (Trusted Retailer)

```
User: "I need a MacBook Pro"

Expected Flow:
1. Discovery searches all retailers
2. Finds MacBook at TechHub (trusted)
3. Checkout adds to cart
4. Payment processes immediately
5. Success with receipt
```

### Test 2: Untrusted Retailer (Security Demo)

```
User: "Get me a Raspberry Pi under $100"

Expected Flow:
1. Discovery finds cheapest at IoTMarket ($89)
2. User confirms adding to cart
3. Checkout attempts payment
4. ⚠️ BLOCKED: requires_confirmation=true
5. Orchestrator asks user: "This retailer isn't verified. Proceed?"
6. User decides: Yes/No
```

### Test 3: Budget Enforcement

```
User: "Set budget to $500, then buy a laptop"

Expected Flow:
1. Budget set to $500
2. Discovery finds laptops over $500
3. User tries to checkout
4. Payment fails: "Budget exceeded"
5. Agent offers alternatives under budget
```

---

## 🔧 Troubleshooting

### MCP Servers Not Responding

```bash
# Check if containers are running
docker ps

# Check logs
docker logs secureprocure_techhub_1
docker logs secureprocure_cart_1

# Restart MCP servers
docker-compose -f docker-compose.mcp.yml restart
```

### Archestra Can't Connect to MCPs

**Symptom**: "fetch failed" or "connection refused"

**Solution**: 
- Verify you're using the **public IP** (not localhost) in MCP URLs
- Check firewall: `ufw status`
- Ensure ports are bound to 0.0.0.0 (not just localhost)

### Trust Level Not Detected Correctly

**Check product IDs follow the naming convention:**
- `th-*` = TechHub (trusted)
- `gz-*` = GadgetZone (trusted)
- `iot-*` = IoTMarket (untrusted)

The cart server auto-detects trust from product_id prefix.

### Out of Memory

**Symptom**: Containers crash, slow performance

**Solution**:
```bash
# Add more swap
fallocate -l 4G /swapfile2
chmod 600 /swapfile2
mkswap /swapfile2
swapon /swapfile2

# Check memory usage
docker stats --no-stream
free -h
```

### Payment Not Being Blocked for Untrusted

**Check**:
1. Product ID starts with `iot-`
2. Cart server is auto-detecting trust (check logs)
3. `process_payment()` is being called (not bypassed)

---

## 🚀 Future Enhancements

### Potential Features

- [ ] **Real Product Database**: Connect to real retailer APIs
- [ ] **Payment Integration**: Stripe/PayPal for real transactions
- [ ] **User Authentication**: Multi-user with individual budgets
- [ ] **Audit Logging**: Track all agent decisions
- [ ] **Custom UI**: React frontend instead of Archestra default
- [ ] **Mobile App**: iOS/Android client
- [ ] **Voice Interface**: Alexa/Google Assistant integration
- [ ] **Supply Chain Integration**: Real inventory checking

### Architecture Improvements

- [ ] **Horizontal Scaling**: Multiple agent instances
- [ ] **Persistent Database**: PostgreSQL for cart/order history
- [ ] **Caching Layer**: Redis for product search
- [ ] **Monitoring**: Prometheus/Grafana for observability
- [ ] **CI/CD Pipeline**: Automated testing and deployment

---


## 🤝 Contributing

This is a hackathon demonstration project. Contributions welcome!

## 🙏 Acknowledgments

- [Archestra](https://archestra.ai/) - Agent orchestration platform
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- Digital Ocean - Hosting credits via GitHub Student Pack

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review agent configuration prompts in `/prompts/`
3. Open an issue on GitHub

---

**Built with ❤️ for the hackathon community**
