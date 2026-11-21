---
title: 'Complete Lua Contracts Specification (A–Z)'
description: 'In-depth specification of SaviorBill Lua micro-contracts: input context ctx structures, lifecycle actions, and return schemas for services, payment gateways, OAuth providers, triggers, and email transports.'
category: 'Integrations & Lua'
order: 20
---

## SaviorBill Contract Architecture

All user-defined integrations in SaviorBill execute inside an isolated **LuaWorker** (Lua 5.4) sandbox governed by deterministic, strictly typed micro-contracts.

Every integration script is a module exporting a single entrypoint:
```lua
local M = {}

function M.handle(ctx)
  -- process ctx.action and return table
  return { ... }
end

return M
```

The `ctx` parameter is an immutable data dictionary prepared by the billing core. Scripts never communicate directly with PostgreSQL; all mutations occur via the returned table.

---

## 1. Service Script Contract (`Service`)

Handles the complete lifecycle of digital goods, subscriptions, VPNs, VPS servers, or game instances.

### Supported Actions (`ctx.action`):
- **`create`** — initial provisioning and activation following successful order payment;
- **`renew`** — extending subscription duration (triggered upon recurring balance deductions or invoice payments);
- **`freeze`** / **`stop`** — temporary suspension (e.g. upon term expiration or failed auto-renewal);
- **`unfreeze`** — restoring access after debt clearance;
- **`delete`** — permanent teardown and release of external resources.

### Input Structure `ctx`:
```lua
{
  action = "create", -- "create" | "renew" | "stop" | "delete" | "freeze" | "unfreeze"
  lua = {
    id = 12,
    slug = "marzban-vless",
    name = "Marzban VLESS VPN",
    kind = "service",
    actions = { "create", "renew", "stop", "delete", "freeze" },
    settings = {
      marzban_domain = "panel.example.com",
      marzban_user = "admin",
      marzban_pass = "secret"
    }
  },
  user = {
    id = 104,
    login = "buyer_user",
    email = "client@example.com",
    service = {
      id = 301,
      status = "active",         -- current status in DB
      expires_at = 1770000000,    -- Unix expiration timestamp (nil on initial create)
      public_data = { ... },      -- previously saved public credentials
      private_data = { ... }      -- previously saved private credentials
    },
    payment = 452                 -- payment ID that triggered action (or nil)
  },
  service = {
    id = 15,
    slug = "vpn-amsterdam-vless",
    name = "VPN Amsterdam (VLESS)",
    price = "150.00",
    currency = "RUB",
    duration = 2592000,           -- duration in seconds (e.g. 30 days; from tier or service)
    settings = {
      data_limit_gb = 50,
      reset_strategy = "month"
    }
  },
  order = {
    amount = "150.00",
    currency = "RUB",
    tier = "1_month",
    group = "vpn_europe",
    components = { ... },
    form = {                      -- customer inputs from client_order_form
      preferred_node = "ams-01",
      protocol = "vless"
    }
  }
}
```

> [!NOTE]
> `ctx.service.duration` is provided in **seconds**. When calculating expiry timestamps, use `os.time() + (ctx.service.duration or 2592000)`. If a specific tariff tier defines overrides (`tier.settings_override`), they merge seamlessly into `ctx.service.settings`.

### Return Schema:
Upon successful completion, `M.handle(ctx)` returns a table:

```lua
return {
  -- Public data: exposed to the customer in their dashboard (keys, URLs, Server-Driven UI).
  public = {
    subscription_url = "https://panel.example.com/sub/token_xyz",
    username = "sb_104_a89f2e",
    node_type = "VLESS"
  },

  -- Private data: stored securely in core storage; never visible to customers.
  -- Passed back in ctx.user.service.private_data on subsequent renew/delete calls.
  private = {
    marzban_username = "sb_104_a89f2e",
    allocated_ip = "192.168.10.55"
  },

  -- Target service state in billing: "active" | "suspended" | "terminated"
  state = "active",

  -- Subscription expiration Unix timestamp (in seconds)
  expires_at = 1772592000
}
```

---

## 2. Payment Gateway Contract (`Payment`)

Manages inbound and outbound transactions: generating checkout links, processing webhook callbacks, polling payment statuses, and issuing refunds.

### Supported Actions (`ctx.action`):
- **`create`** — creates an invoice with the provider and returns payment redirect URL;
- **`callback`** — verifies incoming HTTP webhooks sent by payment processors;
- **`check`** — scheduled background status poll (fallback when webhooks are delayed);
- **`refund`** — processes customer balance or invoice refunds.

### Input Structure `ctx`:
```lua
{
  action = "create", -- "create" | "callback" | "check" | "refund"
  user = {
    id = 104,
    login = "buyer_user",
    email = "client@example.com"
  },
  payment = {
    id = 8901,
    amount = "250.00",
    currency = "RUB",
    status = "pending",
    return_url = "https://billing.example.com/payment/success",
    provider_data = {
      secrets = {
        shop_id = "123456",
        secret_key = "live_secret_key"
      }
    }
  },
  -- Field request is present ONLY during "callback" actions
  request = {
    method = "POST",
    headers = {
      ["content-type"] = "application/json",
      ["crypto-pay-api-signature"] = "abc123..."
    },
    body = "{\"event\":\"payment.succeeded\", ...}",
    query = {}
  }
}
```

### Response Format for `create`:
```lua
return {
  confirmation_url = "https://checkout.yookassa.ru/v2/payment/...", -- checkout link
  external_id = "2d8f90-000f-5000-8000-1b2c3d4e5f6a",               -- provider invoice ID
  payment_id = ctx.payment.id
}
```

### Response Format for `callback` and `check`:
```lua
return {
  public = {},
  private = {
    ok = true,               -- status of callback handling
    paid = true,             -- true if invoice is paid and confirmed
    failed = false,          -- true if invoice was canceled/expired
    payment_id = 8901,       -- internal SaviorBill payment ID
    external_id = "2d8f90-000f-...",
    status = "succeeded"     -- raw provider status string
  }
}
```

### Response Format for `refund`:
```lua
return {
  ok = true,
  refund_id = "ref_992104",
  status = "succeeded"
}
```

---

## 3. OAuth / OIDC Identity Contract (`Auth`)

Powers external authentication and social logins (Google, GitHub, Telegram, Discord, custom OIDC).

### Supported Actions (`ctx.action`):
- **`start`** — builds provider redirect URL with state token and callback URI;
- **`callback`** — exchanges authorization code for user profile.

### Response Format:
- When `action == "start"`:
  ```lua
  return {
    authorize_url = "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
  ```
- When `action == "callback"`:
  ```lua
  return {
    external_id = "gh_9812401",
    email = "dev@unvi.xyz",
    email_verified = true,
    login = "unvislate",
    name = "Andrey UNVI",
    avatar_url = "https://avatars.githubusercontent.com/u/9812401"
  }
  ```

---

## 4. Event Trigger Contract (`Trigger`)

Executes automated business logic in response to system domain events (user registrations, service terminations, ticket creation, payments).

### Input Structure `ctx`:
```lua
{
  event = "payment.succeeded",
  config = {
    telegram_chat_id = "-1001234567890",
    notify_channel = true
  },
  data = {
    payment_id = 452,
    user_id = 104,
    amount = "150.00",
    currency = "RUB",
    service_id = 15
  }
}
```

Triggers perform outgoing API calls (e.g. sending a Telegram message via bot API) and return `{ ok = true, result = "Sent" }`.

---

## 5. Email Transport Contract (`Email`)

Connects arbitrary transactional email providers (Resend, Mailgun, custom SMTP relays, local Postfix) via Lua.

### Input Structure `ctx`:
```lua
{
  action = "send", -- "send" | "test"
  email = {
    to = "client@example.com",
    subject = "Order #104 Provisioned Successfully",
    body = "<h1>Thank you for your order!</h1>...",
    text = "Thank you for your order!...",
    is_html = true,
    from_email = "no-reply@saviorbill.com",
    from_name = "SaviorBill Robot"
  },
  config = {
    api_key = "re_...",
    endpoint = "https://api.resend.com/emails"
  }
}
```

Returns `{ ok = true }` or raises an error via `error("Failed to deliver email")`.
