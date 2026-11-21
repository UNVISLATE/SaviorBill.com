---
title: 'Server-Driven UI (sbuiSDK) Components'
description: 'Complete reference for declarative sbuiSDK rendering components: layout primitives, typography, form controls, vector Liquid QR, CopyField widgets, DatePicker, and modal dialogs.'
category: 'Server-Driven UI (sbuiSDK)'
order: 40
---

## What is Server-Driven UI in SaviorBill?

In conventional billing platforms, modifying checkout form fields, adding resource sliders, or rolling out custom provisioning screens requires rebuilding and redeploying frontend bundles.

**Server-Driven UI (sbuiSDK)** eliminates this overhead:
1. **Declarative Schemas:** service delivery scripts and payment plugins return clean component trees as JSON manifests;
2. **Zero Frontend Code:** the customer portal (`SBPersonalAccountClient`) compiles JSON manifests into native, accessible React components on the fly;
3. **Unified Aesthetic:** components adhere to the platform's Stealth Dark design system (`#09090b` with signature cyan accent `#009080`).

![sbuiSDK Interactive Showcase](/images/docs/sbuisdk-showcase.png)

---

## 1. Layout Primitives

Fundamental containers for structuring screens, responsive grids, and dashboards.

### `row` (Horizontal Flexbox)
Arranges child elements horizontally with customizable alignment.
```json
{
  "type": "row",
  "gap": 16,
  "align": "center",
  "justify": "between",
  "wrap": false,
  "children": [ ... ]
}
```
- **`gap`** (`number | string`): spacing between child elements in pixels;
- **`align`**: `"start" | "center" | "end" | "stretch"`;
- **`justify`**: `"start" | "center" | "end" | "between" | "around"`.

### `column` (Vertical Flexbox)
Vertical flex stack for sequential element layout.
```json
{
  "type": "column",
  "gap": 12,
  "align": "stretch",
  "children": [ ... ]
}
```

### `card` (Panel Container)
Bordered panel with rounded corners and elevated background.
```json
{
  "type": "card",
  "variant": "elevated",
  "header": "VLESS Subscription Parameters",
  "padding": "16px",
  "children": [ ... ]
}
```
- **`variant`**: `"default" | "elevated" | "outline" | "ghost"`.

### `grid` (CSS Grid)
Responsive grid layout.
```json
{
  "type": "grid",
  "columns": "repeat(auto-fit, minmax(280px, 1fr))",
  "gap": 16,
  "children": [ ... ]
}
```

### `divider` and `space`
- **`divider`**: separating rule line (`"orientation": "horizontal" | "vertical"`);
- **`space`**: empty spacing gap (`"size": 24`).

---

## 2. Typography & Status Badges

### `text`
Typography blocks supporting multiple variants and weights.
```json
{
  "type": "text",
  "content": "Secured with TLS 1.3 Reality encryption",
  "variant": "body",
  "bold": true,
  "color": "#a1a1aa",
  "align": "left"
}
```
- **`variant`**: `"h1" | "h2" | "h3" | "h4" | "body" | "caption" | "code" | "muted"`.

### `badge`
Compact badge indicator for service states or billing tiers.
```json
{
  "type": "badge",
  "content": "Active",
  "variant": "success",
  "size": "sm"
}
```
- **`variant`**: `"primary" | "success" | "warning" | "danger" | "neutral"`.

### `alert`
Notice box for warnings, guidelines, or critical messages.
```json
{
  "type": "alert",
  "title": "Notice",
  "content": "Your subscription expires in 2 days.",
  "variant": "warning"
}
```

---

## 3. Specialized Widgets

### `qr` (Vector Liquid QR Code)
Proprietary high-resolution vector QR code generator with rounded modules, smooth Liquid droplets, and centered brand logos.

```json
{
  "type": "qr",
  "value": "vless://e83a91b4-42b7-4a0b-8d59-3a3f5a5c7c2e@node.saviorvpn.net:443?...",
  "size": 180,
  "plateRadius": 18,
  "qrStyle": "liquid",
  "logo": "UNVIDark",
  "logoSize": 36,
  "errorCorrection": "M",
  "color": "#ffffff",
  "backgroundColor": "#09090b"
}
```
- **`qrStyle`**: `"liquid"` (smooth rounded fluid droplets), `"rounded"`, or `"classic"` (square pixels);
- **`logo`**: built-in presets `"UNVI"`, `"UNVIDark"`, `"UNVILight"`, or an arbitrary SVG URL;
- **`plateRadius`**: border radius for the white background plate.

### `copy_field` (One-Click Copy & Secret Field)
Specialized widget designed for access tokens, subscription URLs, SSH keys, and license credentials. Includes one-click clipboard copying with visual confirmation ("Copied"), optional secret masking with dots, and an eye toggle button to reveal/hide values.

```json
{
  "type": "copy_field",
  "label": "Subscription URL",
  "value": "{{public.subscription_url}}",
  "secret": false
}
```
- **`label`** (`string`, optional): header label above the input;
- **`value`** (`string`, required): string value or dynamic template expression (`{{public.subscription_url}}`, `{{public.key}}`);
- **`secret`** (`boolean`, default `false`): masks sensitive data with dots and renders an eye toggle button;
- **`placeholder`** (`string`, optional): fallback placeholder when data is pending.

### `datepicker` (Date & Time Picker)
Feature-rich calendar picker supporting individual dates, date-time pickers, range selections, and quick relative presets.

```json
{
  "type": "datepicker",
  "name": "booking_slot",
  "label": "Port Rental Start Time",
  "mode": "datetime",
  "minDate": "2026-11-20T00:00:00Z",
  "showPresets": true,
  "required": true
}
```
- **`mode`**: `"date" | "time" | "datetime" | "range"`.

### `dialog` (Interactive Modal Dialog)
Modal window for setup instructions or confirmation workflows.
```json
{
  "type": "dialog",
  "dialogId": "vless-instruction",
  "title": "Configuring VLESS in Happ / v2rayN",
  "trigger": {
    "type": "button",
    "label": "View Instructions",
    "variant": "outline"
  },
  "children": [
    {
      "type": "text",
      "content": "1. Copy the subscription URL or scan the QR code in your client."
    }
  ]
}
```

---

## 4. Form Controls

Rendered inside checkout forms to capture customer input prior to invoice generation.

### `input` and `password`
```json
{
  "type": "input",
  "name": "steam_login",
  "label": "Steam Account Username",
  "placeholder": "player_login",
  "required": true,
  "validation": {
    "min_length": 3,
    "max_length": 32,
    "regex": "^[a-zA-Z0-9_]+$",
    "regex_error": "Username can only contain alphanumeric characters and underscores"
  }
}
```

### `number`
Number field or slider for dynamic balance top-ups and resource sizing.
```json
{
  "type": "number",
  "name": "amount_rub",
  "label": "Top-Up Amount ($)",
  "min": 10,
  "max": 1000,
  "step": 5,
  "defaultValue": 50,
  "required": true
}
```

### `select`
Dropdown selection list.
```json
{
  "type": "select",
  "name": "server_location",
  "label": "Server Location",
  "default": "nl-ams",
  "options": [
    { "value": "nl-ams", "label": "Netherlands (Amsterdam)" },
    { "value": "de-fra", "label": "Germany (Frankfurt)" },
    { "value": "fi-hel", "label": "Finland (Helsinki)" }
  ]
}
```

### `toggle`
```json
{
  "type": "toggle",
  "name": "auto_renew",
  "label": "Enable automatic renewal from balance",
  "default": true
}
```

### `button`
```json
{
  "type": "button",
  "label": "Proceed to Checkout",
  "variant": "primary",
  "action": "submit"
}
```

---

## 5. Dynamic Reactivity (`depends_on`)

Any `sbuiSDK` component can dynamically appear or hide based on user selections in other fields:

```json
{
  "type": "input",
  "name": "telegram_chat_id",
  "label": "Telegram Chat ID",
  "required": true,
  "depends_on": {
    "field": "delivery_method",
    "equals": "telegram"
  }
}
```

List matching is also supported:
```json
"depends_on": {
  "field": "protocol",
  "in": ["vless", "trojan"]
}
```

---

## Practical Example: Provisioned VLESS Card

Below is a complete `view_layout` schema returned by `service.lua` in its `public` response to render customer credentials:

```json
{
  "version": "1.0",
  "layout": {
    "type": "card",
    "variant": "elevated",
    "header": "VLESS Subscription Access (Xray / Reality)",
    "children": [
      {
        "type": "row",
        "justify": "between",
        "align": "center",
        "children": [
          { "type": "text", "variant": "caption", "color": "#a1a1aa", "content": "Frankfurt 🇩🇪 • Port 443" },
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
            "value": "vless://e83a91b4-42b7-4a0b-8d59-3a3f5a5c7c2e@de.saviorvpn.net:443?security=reality&fp=chrome#SaviorVPN-DE",
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
The customer dashboard compiles and renders this JSON natively without requiring any custom frontend code.
