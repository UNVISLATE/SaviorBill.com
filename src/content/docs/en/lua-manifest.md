---
title: 'manifest.json Specification for Lua Integrations'
description: 'How to write a manifest.json file for SaviorBill Lua scripts: metadata, auto-generated admin forms, and packaging.'
category: 'Integrations & Lua'
order: 10
---

## What is manifest.json?

Every Lua script in SaviorBill (service delivery module, payment gateway, OAuth provider, or trigger action) is packaged with a `manifest.json` file.

It serves three core purposes:
1. **Core Registration:** registers the unique slug (`id`), display name, category, author, and supported lifecycle actions (`actions`).
2. **Auto-Generated Admin UI:** describes the configuration schema (`settings`). SaviorBill automatically renders input forms in the admin panel without frontend code.
3. **Versioning:** tracks module version (`version`), stability status (`status`), and changelogs.

---

## Minimal Example

```json
{
  "id": "marzban-vless",
  "name": "Marzban VLESS VPN Delivery",
  "category": "VPN & Proxies",
  "author": "Andrey UNVI",
  "version": "1.0.0",
  "status": "stable",
  "description": "Automated VLESS subscription provisioning via Marzban REST API.",
  "actions": ["create", "renew", "stop", "delete", "freeze"],
  "settings": {
    "marzban_domain": {
      "type": "string",
      "label": "Marzban Panel Domain",
      "placeholder": "panel.example.com",
      "required": true
    },
    "marzban_user": {
      "type": "string",
      "label": "Admin Username",
      "required": true
    },
    "marzban_pass": {
      "type": "password",
      "label": "Admin Password",
      "required": true
    }
  }
}
```

---

## Supported Field Types in `settings`
- **`string`**: Single-line text input.
- **`password`**: Obfuscated and encrypted credential field.
- **`number`**: Integer or floating-point input.
- **`select`**: Dropdown with options array `[ { "value": "val", "label": "Label" } ]`.
- **`toggle`**: Boolean switch (`true` / `false`).

---

## Server-Driven UI Configuration (`sbui`)

In addition to admin settings, manifests can define declarative layouts for customer dashboards via the **`sbui`** block:

```json
{
  "sbui": {
    "version": "1.0",
    "service_card": {
      "type": "card",
      "variant": "elevated",
      "header": "VLESS Subscription Access",
      "children": [
        {
          "type": "qr",
          "value": "{{public.subscription_url}}",
          "size": 130,
          "qrStyle": "liquid"
        }
      ]
    }
  }
}
```

- **`service_card`**: Card layout rendered in `SBPersonalAccountClient` with variable interpolation (`{{public.field}}`).
- For component schemas and reactivity, see the [Server-Driven UI (sbuiSDK) Components](/en/docs/sbuisdk-components) documentation.
