---
title: 'Complete Lua Contracts Specification (A–Z)'
description: 'In-depth specification of SaviorBill Lua contracts: context ctx structures, lifecycle actions, and return schemas.'
category: 'Integrations & Lua'
order: 20
---

## SaviorBill Contract Architecture

All external integrations execute inside an isolated **LuaWorker** (Lua 5.4) sandbox using strict micro-contracts.

Every script exposes a single entrypoint:
```lua
local M = {}

function M.handle(ctx)
  -- process ctx.action
  return { ... }
end

return M
```

---

## 1. Service Script Contract (`Service`)
Handles the complete lifecycle of subscriptions, VPN access, and digital goods.

### Actions (`ctx.action`):
- `create` — initial provisioning upon payment.
- `renew` — extending subscription duration.
- `freeze` / `stop` — disabling access due to non-payment.
- `unfreeze` — restoring service.
- `delete` — permanent teardown and resource release.

### Return Format:
```lua
return {
  public = {
    subscription_url = "https://panel.example.com/sub/token",
    node_type = "VLESS"
  },
  private = {
    marzban_username = "sb_104_a89"
  },
  state = "active",
  expires_at = 1772592000
}
```

---

## 2. Payment Gateway Contract (`Payment`)
Handles financial transactions, invoice creation, and webhooks.

### Actions (`ctx.action`):
- `create` — generates redirect `confirmation_url`.
- `callback` — verifies server-to-server webhook events.
- `check` — polls payment status.
- `refund` — issues refunds.
