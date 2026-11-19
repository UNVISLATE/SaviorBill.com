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
---

Demand for self-hosted VPN solutions with modern high-performance tunneling and encryption protocols (VLESS, Reality, Trojan) is growing rapidly. In this tutorial, we will set up a fully automated VPN storefront on **SaviorBill** using pre-built Hub integrations:
- [YooKassa Payment Gateway](/en/hub/yookassa-payment) for bank cards and instant payments;
- [Marzban VLESS Delivery](/en/hub/marzban-vless) service module;
- [Server-Driven UI (sbuiSDK)](/en/docs/sbuisdk-components) for native in-app QR code rendering.

---

## Architecture Pipeline

```
[Customer] ────► [SaviorBill Storefront] ────► [YooKassa Invoice]
                                                      │
[Marzban Panel] ◄──── [LuaWorker] ◄──── [Webhook Payment Confirmation]
       │                    │
       └────────────────────┴───► [Customer Dashboard: Live VLESS QR & Key]
```

1. Deploy your Marzban panel with VLESS inbounds enabled.
2. Download `yookassa-payment.zip` and configure your `shop_id` and `secret_key`.
3. Download `marzban-vless.zip` and set up panel domain and admin credentials.
4. Add the product to your SaviorBill catalog.

Customer payments trigger instant automated provisioning with zero manual intervention.
