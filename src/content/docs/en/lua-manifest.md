---
title: 'manifest.json Specification for Lua Integrations'
description: 'Canonical manifest specification for SaviorBill Lua scripts: metadata, settings_form admin schemas, client_order_form checkout inputs, Server-Driven UI (view_layout), and packaging rules.'
category: 'Integrations & Lua'
order: 10
---

## What is manifest.json?

Every Lua script in SaviorBill (service delivery module, payment gateway, OAuth provider, or background trigger) is packaged with a declarative `manifest.json` file.

The manifest serves several key purposes:
1. **Core Registration:** defines the unique identifier (`slug` / `id`), display name, category, author, and supported lifecycle events (`actions`).
2. **Auto-Generated Admin UI (`settings_form`):** a strictly ordered array of configuration fields. SaviorBill automatically generates interactive admin settings forms (text, passwords, toggles, sliders, selects) with validation without requiring custom frontend code.
3. **Client Checkout Forms (`client_order_form`):** fields filled out by customers during order placement in the storefront. The billing core validates these inputs and passes them to Lua in `ctx.order.form`.
4. **Server-Driven UI (`view_layout` and `layout`):** declarative layouts for delivered services (vector Liquid QR codes, copy buttons, status badges) rendered directly in the customer portal (`SBPersonalAccountClient`).
5. **Versioning & Media:** tracks module version (`version`), stability status (`status`), and declarative background media downloads (`media_download`).

---

## Canonical Manifest Example

```json
{
  "slug": "marzban-vless",
  "id": "marzban-vless",
  "name": "Marzban VLESS VPN Delivery",
  "category": "VPN & Proxies",
  "author": "Andrey UNVI",
  "version": "1.0.0",
  "status": "stable",
  "description": "Automated VLESS subscription provisioning via Marzban REST API.",
  "actions": [
    "create",
    "renew",
    "stop",
    "delete",
    "freeze"
  ],
  "settings_form": [
    {
      "id": "marzban_domain",
      "type": "text",
      "label": "Marzban Panel Domain",
      "placeholder": "panel.example.com",
      "required": true,
      "description": "Panel hostname without https://"
    },
    {
      "id": "marzban_user",
      "type": "text",
      "label": "Admin Username",
      "placeholder": "admin",
      "required": true
    },
    {
      "id": "marzban_pass",
      "type": "password",
      "label": "Admin Password",
      "required": true
    },
    {
      "id": "data_limit_gb",
      "type": "number",
      "label": "Traffic Limit (GB)",
      "default": 0,
      "description": "0 = unlimited traffic"
    },
    {
      "id": "reset_strategy",
      "type": "select",
      "label": "Traffic Reset Interval",
      "default": "no_reset",
      "options": [
        { "value": "no_reset", "label": "No reset" },
        { "value": "month", "label": "Monthly" },
        { "value": "year", "label": "Annually" }
      ]
    }
  ],
  "view_trigger_label": "Setup Guide & QR",
  "view_layout": {
    "type": "card",
    "variant": "elevated",
    "header": "VLESS Subscription Connection",
    "content": "VLESS Subscription Connection",
    "children": [
      {
        "type": "row",
        "align": "center",
        "justify": "between",
        "children": [
          { "type": "text", "variant": "caption", "content": "VLESS • Reality • TCP Vision" },
          { "type": "badge", "variant": "success", "content": "Active" }
        ]
      },
      {
        "type": "column",
        "gap": 16,
        "align": "center",
        "children": [
          {
            "type": "qr",
            "value": "{{public.subscription_url}}",
            "size": 180,
            "plateRadius": 18,
            "qrStyle": "liquid",
            "logo": "UNVIDark"
          },
          {
            "type": "copy_field",
            "label": "Subscription Link",
            "value": "{{public.subscription_url}}"
          }
        ]
      }
    ]
  }
}
```

---

## Root Manifest Fields

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `slug` | `string` | **Yes** | Unique identifier (`^[a-z0-9_-]+$`). E.g. `marzban-vless`, `cryptobot-payment`. |
| `id` | `string` | No | Compatibility alias (recommended to set identical to `slug`). |
| `name` | `string` | **Yes** | Human-readable title of the module (up to 128 characters). |
| `category` | `string` | **Yes** | Integration category: `VPN & Proxies`, `Payments`, `Hosting & Cloud`, etc. |
| `author` | `string` | No | Author or studio name. |
| `version` | `string` | **Yes** | SemVer or manifest version (e.g. `"1.0.0"`). |
| `status` | `string` | No | Stability indicator: `stable` or `not-stable`. |
| `description` | `string` | No | Summary of protocols and capabilities. |
| `actions` | `array<string>` | **Yes** | Supported lifecycle actions (e.g. `["create", "renew", "stop", "delete"]`). |
| `settings_form` | `array<FieldDefinition>` | No | Ordered list of configuration inputs for the Admin UI. |
| `client_order_form` | `array<FieldDefinition>` | No | Ordered list of customer input fields at checkout. |
| `layout` | `SchemaNode` | No | Server-Driven UI layout for custom storefront order flows. |
| `view_layout` | `SchemaNode` | No | Server-Driven UI node rendered in the customer portal modal. |
| `view_trigger_label` | `string` | No | Text label for the service modal trigger button (e.g. `"Setup Guide & QR"`). |
| `hide_key` | `boolean` | No | When `true`, hides the default raw key display box in customer portal. |
| `media_download` | `array<MediaDownloadItem>` | No | Background safe downloads fetched via mediaworker. |

---

## Field Types (`FieldDefinition`)

Each field in `settings_form` or `client_order_form` is defined as an object inside the array:

- **`text`**: Single-line text input.
- **`password`**: Encrypted sensitive credential field.
- **`number`**: Integer or floating-point input with optional `min`, `max`, `step`.
- **`range`**: Slider control for intuitive numeric input.
- **`select`**: Dropdown with `options` array (`[{ "value": "val", "label": "Label" }]`).
- **`toggle`**: Boolean switch (`true` / `false`).
- **`textarea`**: Multi-line input for configs, SSH keys, or certificates.
- **`datetime`**: Date and time picker.

### Reactive Conditions (`depends_on`)

Fields can conditionally show or hide based on other field values:

```json
{
  "id": "vat_code",
  "type": "select",
  "label": "VAT Rate",
  "default": "1",
  "options": [
    { "value": "1", "label": "0% VAT" },
    { "value": "2", "label": "20% VAT" }
  ],
  "depends_on": {
    "field": "send_receipt",
    "equals": true
  }
}
```

---

## Accessing Settings in Lua

- **Admin/Provider settings:** `ctx.service.settings[id]` (with fallback to `ctx.lua.settings[id]`).
- **Customer order form:** `ctx.order.form[id]`.

---

## Server-Driven UI (`view_layout`)

Define the component tree directly at root level via `view_layout`:
- Supports automatic variable interpolation from Lua's `public` table using `{{public.field}}`.
- Uses `props` for component-specific configurations (such as `qr`, `copy_field`).
- For the complete component reference, see [Server-Driven UI (sbuiSDK) Components](/en/docs/sbuisdk-components).

---

### Packaged Integration Example

<div data-hub-card="marzban-vless" data-lang="en"></div>
