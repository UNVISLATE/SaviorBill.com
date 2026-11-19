---
title: 'Self-Hosted Billing on FastAPI and Lua: How SaviorBill is Built and Why We Abandoned Monolithic Plugins'
description: 'Deep dive into SaviorBill architecture: isolating service delivery in Lua 5.4, Server-Driven UI (sbuiSDK), and eliminating legacy spaghetti code.'
date: '2026-11-18'
author: 'Andrey UNVI'
authorAvatar: '/images/avatars/andrey-unvi.jpg'
tags: ['FastAPI', 'Lua', 'Billing', 'SelfHosted', 'Architecture']
faq:
  - question: 'Why Lua instead of Python for integrations?'
    answer: 'Lua is an ultra-lightweight embeddable language with instantaneous startup. All custom delivery workflows and payment hooks execute inside an isolated Lua 5.4 sandbox without risking the core FastAPI runtime.'
  - question: 'What can you sell with SaviorBill?'
    answer: 'SaviorBill is built to sell digital license keys, VPN subscriptions (WireGuard/VLESS), VPS/hosting with resource calculators, SaaS subscriptions, and AI API credits.'
  - question: 'How do you deploy SaviorBill?'
    answer: 'Simply run in your terminal: curl -fsSL https://get.saviorbill.com | bash'
---

Hello everyone! In this post, I want to talk about my project **SaviorBill** — a modern, event-driven self-hosted billing engine and digital storefront.

## Why We Built SaviorBill

When looking to sell digital goods and memberships, many developers face an unpleasant choice: either run legacy monolithic billing panels that are hard to customize and prone to architecture debt, or pay 5–10% revenue fees to closed US-centric SaaS platforms.

We decided to build a clean-slate modern stack: **Python 3.12, FastAPI, PostgreSQL, Valkey**, and crucially — an **isolated Lua sandbox**.

---

## Core Capabilities

- **Digital Licenses & Keys:** instantaneous delivery from concurrency-safe pools (`SKIP LOCKED`);
- **VPS / VDS Hosting:** interactive resource calculator (vCPU, RAM, NVMe) with lifecycle automation;
- **VPN & Proxies:** VLESS, Trojan, and digital keys with vector QR codes rendered via `sbuiSDK`;
- **SaaS & AI APIs:** query credit packages and recurring memberships;
- **Multi-Currency FX Engine:** live currency conversions across fiat and crypto.

---

## The Power of the Lua Sandbox

Instead of installing heavy plugins directly into the server, all integrations execute in **LuaWorker** via Valkey Streams.

A service script simply implements deterministic action hooks:

```lua
-- scripts/services/marzban-vless.lua
local M = {}

function M.create(ctx)
  local s = (ctx.lua or {}).settings or {}
  local resp = http({
    url = "https://" .. s.panel_domain .. "/api/user",
    method = "POST",
    headers = { ["Content-Type"] = "application/json" },
    body = json.encode({ username = "sb_" .. tostring(ctx.user.id) })
  })
  local u = json.decode(resp.body) or {}

  return {
    public = {
      subscription_url = u.subscription_url,
      node_type = "VLESS"
    },
    private = {
      marzban_username = u.username
    },
    state = "active",
    expires_at = os.time() + 30 * 86400
  }
end

return M
```

The `public` object is automatically parsed by `sbuiSDK` and shown to the customer, while `state` and `expires_at` manage billing cycles automatically.

---

## Quickstart

Run one command on any clean Linux machine:

```bash
curl -fsSL https://get.saviorbill.com | bash
```
