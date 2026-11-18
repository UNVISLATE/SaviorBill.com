---
title: 'Self-Hosted Billing on FastAPI and Lua: How SaviorBill is Built and Why We Abandoned Monolithic Plugins'
description: 'Deep dive into SaviorBill architecture: isolating service delivery in LuaJIT, Server-Driven UI (sbuiSDK), and eliminating legacy spaghetti code.'
date: '2026-11-18'
author: 'UNVI'
tags: ['FastAPI', 'Lua', 'Billing', 'SelfHosted', 'Architecture']
faq:
  - question: 'Why Lua instead of Python for integrations?'
    answer: 'Lua is an ultra-lightweight embeddable language with instantaneous startup (LuaJIT). All custom delivery workflows and payment hooks execute inside an isolated sandbox without risking the core FastAPI runtime.'
  - question: 'What can you sell with SaviorBill?'
    answer: 'SaviorBill is built to sell digital license keys, VPN subscriptions (WireGuard/VLESS), VPS/hosting with resource calculators, SaaS subscriptions, and AI API credits.'
  - question: 'How do you deploy SaviorBill?'
    answer: 'Simply run in your terminal: curl -fsSL https://get.saviorbill.com | bash'
---

Hello everyone! In this post, I want to talk about my project **SaviorBill** — a modern, event-driven self-hosted billing engine and digital storefront.

## Why We Built SaviorBill

When looking to sell digital goods and memberships, many developers face an unpleasant choice: either run 15-year-old PHP/Perl monoliths (like WHMCS or legacy billing panels) that are prone to vulnerabilities and hard to customize, or pay 5–10% revenue fees to closed US-centric SaaS platforms.

We decided to build a clean-slate modern stack: **Python 3.12, FastAPI, PostgreSQL, Valkey**, and crucially — an **isolated Lua sandbox**.

---

## Core Capabilities

- **Digital Licenses & Keys:** instantaneous delivery from concurrency-safe pools (`SKIP LOCKED`);
- **VPS / VDS Hosting:** interactive resource calculator (vCPU, RAM, NVMe) with lifecycle automation;
- **VPN & Networking:** WireGuard, VLESS, Outline with vector QR codes rendered via `sbuiSDK`;
- **SaaS & AI APIs:** query credit packages and recurring memberships;
- **Multi-Currency FX Engine:** live currency conversions across fiat and crypto.

---

## The Power of the Lua Sandbox

Instead of installing heavy plugins directly into the server, all integrations execute in **LuaWorker** via Valkey Streams.

A service script simply implements deterministic action hooks:

```lua
-- scripts/services/vpn.lua
function handle(ctx)
  if ctx.action == "create" then
    return {
      public = {
        subscription = "https://example.com/sub/token123"
      },
      private = {
        username = ctx.user.login
      },
      state = "active",
      expires_at = os.time() + 30 * 86400
    }
  end
end
```

The `public` object is automatically parsed by `sbuiSDK` and shown to the customer, while `state` and `expires_at` manage billing cycles automatically.

---

## Quickstart

Run one command on any clean Linux machine:

```bash
curl -fsSL https://get.saviorbill.com | bash
```
