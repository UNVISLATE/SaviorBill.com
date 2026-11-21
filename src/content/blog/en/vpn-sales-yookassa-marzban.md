---
title: 'How to Launch a VPN Service with YooKassa and Marzban on SaviorBill: Complete Guide'
description: 'Step-by-step tutorial on launching an automated VPN business on SaviorBill: integrating Marzban VLESS panel, YooKassa payments, and Server-Driven UI key issuance.'
date: '2026-11-19'
author: 'Andrey UNVI'
authorAvatar: '/images/avatars/andrey-unvi.jpg'
tags: ['VPN', 'Marzban', 'YooKassa', 'VLESS', 'Tutorial', 'sbuiSDK']
faq:
  - question: 'Do I need to write custom backend code for YooKassa and Marzban?'
    answer: 'No, both modules are production-ready and available in the official SaviorBill Hub. Simply import the zip packages through the admin UI and configure your API credentials.'
  - question: 'How do customers receive VPN credentials after payment?'
    answer: 'Instantly upon payment webhook confirmation, the Lua script calls Marzban API, registers the subscriber, and returns the subscription URL and liquid QR code to the customer dashboard via Server-Driven UI.'
  - question: 'Is recurring renewal supported?'
    answer: 'Yes, the billing engine triggers the renew action in the service delivery script whenever balance deductions or subscription renewals occur.'
---

Demand for high-performance self-hosted VPN solutions leveraging modern encryption and obfuscation protocols (VLESS, Reality, Trojan) is accelerating worldwide. However, system administrators and developers face a common challenge: **how can you securely bridge multi-node panels with automated checkout and instant provisioning without clunky middleware?**

In this tutorial, we will configure an end-to-end automated VPN storefront powered by **SaviorBill**, utilizing pre-built integration modules from the official catalog:
- [YooKassa Payment Gateway](/en/hub/yookassa-payment) for bank cards, SBP, and instant payments;
- [Marzban VLESS Delivery](/en/hub/marzban-vless) service module;
- [Server-Driven UI (sbuiSDK)](/en/docs/sbuisdk-components) for native in-app QR code and copy field rendering.

---

## Solution Architecture

The automated pipeline operates on isolated micro-contracts:

```
[Customer] 
     │ 1. Select plan in storefront
     ▼
[SaviorBill Core] ─── 2. Create invoice ───► [YooKassa API]
     │                                            │
     │ 3. Instant Webhook                         ▼
     │◄────────────────────────────────── [Customer completes payment]
     │
     ▼ 4. Dispatch task to LuaWorker
[LuaWorker] ──────── 5. REST API: POST /api/user ───► [Marzban Panel]
     │                                                     │
     │ 6. Return subscription_url + QR                     │ 7. Node provisioned
     ▼                                                     ▼
[Customer Dashboard] ◄──── Live VLESS Key & Liquid QR Code for Happ / v2rayN
```

Because execution is encapsulated within `LuaWorker`, the core platform remains ultra-responsive. Even if an external node or API experiences downtime, only that specific isolated task is retried—never affecting billing operations.

---

## Step 1. Marzban Panel Configuration

Ensure your **Marzban** panel is installed with incoming **VLESS** inbounds configured (with `xtls-rprx-vision` flow and Reality security).

Retrieve your connection credentials:
1. **Panel Hostname** (e.g. `marzban.yourdomain.com` without `https://`);
2. **Superuser Username and Password** (created with `marzban cli admin create`).

---

## Step 2. Configuring YooKassa Payment Gateway

Download the payment module directly from the card below:

<div data-hub-card="yookassa-payment" data-lang="en"></div>

1. In the SaviorBill Admin Panel, navigate to **Providers → Payment Gateways → Add**.
2. Select the downloaded script and input your credentials:
   - **`shop_id`**: your merchant shop ID from YooKassa;
   - **`secret_key`**: secret API key (format `live_...`);
   - **`return_url`**: customer redirect URL (e.g. `https://billing.example.com/client/services`).
3. In your YooKassa dashboard under **Integration → HTTP Notifications**, configure your webhook URL:
   ```
   https://billing.example.com/api/v1/payments/callback/yookassa-payment
   ```
   and enable the `payment.succeeded` event.

---

## Step 3. Installing Marzban VLESS Delivery Script

The automated delivery script featuring Server-Driven UI is available here:

<div data-hub-card="marzban-vless" data-lang="en"></div>

1. In the Admin Panel, go to **Automation → Scripts → Import** and select the zip archive.
2. Under template settings, enter your Marzban panel domain, login, and password.

The script autonomously handles:
- Generating a deterministic subscriber username `sb_<user_id>_<hash>`;
- Creating the user in Marzban via secure POST request with automatic JWT administrator token retrieval;
- Caching auth tokens in Valkey for 30 minutes to minimize overhead on the panel;
- Enforcing traffic limits and expiration timestamps.

---

## Step 4. Creating Product Tiers and Storefront

Link checkout and fulfillment into a unified offering:

1. Open **Catalog → Services → Create Service**:
   - Title: `VPN Netherlands (VLESS Reality)`;
   - Execution Type: `Lua Script (marzban-vless)`;
   - Default Duration: `30 days` (`2,592,000` seconds).
2. Configure tiered pricing (e.g. 1 Month, 6 Months, 1 Year).
3. Set default traffic limits (e.g. `100 GB`) and reset schedule (`Monthly`).

---

## Step 5. Customer Experience: Native Server-Driven UI

When a customer completes checkout, the payment webhook verifies the order in milliseconds. The billing core triggers the `create` action, and the script returns a clean Server-Driven UI schema:

```lua
return {
  public = {
    subscription_url = sub_url,
    username = username,
    node_type = "VLESS"
  },
  state = "active",
  expires_at = exp
}
```

The customer dashboard (`SBPersonalAccountClient`) instantly renders the access card with a centered vector Liquid QR code for smartphone scanning and a one-click copy button for desktop clients.

Zero manual configuration, zero manual link sending—fully autonomous 24/7.
