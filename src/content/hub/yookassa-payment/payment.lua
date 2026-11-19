-- YooKassa API v3 Payment Script for SaviorBill
-- Handles actions: create, callback, check, refund

local M = {}

local function get_secrets(ctx)
  return ((ctx.payment or {}).provider_data or {}).secrets or {}
end

local function auth_header(s)
  local credentials = tostring(s.shop_id) .. ":" .. tostring(s.secret_key)
  return "Basic " .. crypto.base64_encode(credentials)
end

-- Server-to-server status verification
local function fetch_status(s, external_id)
  local resp = http({
    url = "https://api.yookassa.ru/v3/payments/" .. tostring(external_id),
    method = "GET",
    headers = {
      ["Authorization"] = auth_header(s),
      ["Content-Type"] = "application/json",
    },
    timeout = 10,
  })
  if not resp.ok or resp.status ~= 200 then
    return nil
  end
  return json.decode(resp.body) or {}
end

local function verify_payment(ctx, external_id)
  local s = get_secrets(ctx)
  if not external_id or not s.shop_id or not s.secret_key then
    return { public = {}, private = { ok = false, error = "Missing shop credentials or external_id" } }
  end

  local data = fetch_status(s, external_id)
  if data == nil then
    return { public = {}, private = { ok = false, error = "Failed to query YooKassa API" } }
  end

  local status = data.status
  local is_paid = (status == "succeeded")
  local is_failed = (status == "canceled")

  return {
    public = {},
    private = {
      ok = true,
      paid = is_paid,
      failed = is_failed,
      payment_id = (data.metadata or {}).payment_id,
      external_id = data.id or external_id,
      status = status,
      captured_at = data.captured_at,
    },
  }
end

local function do_create(ctx)
  local pay = ctx.payment or {}
  local s = get_secrets(ctx)
  assert(s.shop_id and s.secret_key, "YooKassa requires shop_id and secret_key")

  local amount_val = string.format("%.2f", tonumber(pay.amount) or 0)
  local return_target = pay.return_url or s.return_url or "https://example.com/billing"

  local idempotence_key = string.format("sb_yk_%s_%s", tostring(pay.id or 0), tostring(os.time()))

  local req_body = json.encode({
    amount = {
      value = amount_val,
      currency = pay.currency or "RUB",
    },
    capture = true,
    confirmation = {
      type = "redirect",
      return_url = return_target,
    },
    description = string.format("Payment #%s | SaviorBill", tostring(pay.id or 0)),
    metadata = {
      payment_id = pay.id,
      user_id = (ctx.user or {}).id,
    },
  })

  local resp = http({
    url = "https://api.yookassa.ru/v3/payments",
    method = "POST",
    headers = {
      ["Authorization"] = auth_header(s),
      ["Idempotence-Key"] = idempotence_key,
      ["Content-Type"] = "application/json",
    },
    body = req_body,
    timeout = 15,
  })

  if not resp.ok or (resp.status ~= 200 and resp.status ~= 201) then
    error("YooKassa create invoice failed (status " .. tostring(resp.status) .. "): " .. tostring(resp.body))
  end

  local data = json.decode(resp.body) or {}
  local confirmation = data.confirmation or {}
  local redirect_url = confirmation.confirmation_url

  if not redirect_url or redirect_url == "" then
    error("YooKassa response missing confirmation_url")
  end

  return {
    confirmation_url = redirect_url,
    external_id = data.id,
    payment_id = pay.id,
  }
end

local function do_callback(ctx)
  local req = ctx.request or {}
  local body_str = req.body or ""
  local event = json.decode(body_str) or {}

  local obj = event.object or {}
  local external_id = obj.id

  if not external_id then
    error("YooKassa webhook missing object.id")
  end

  -- Security: verify status server-to-server
  return verify_payment(ctx, external_id)
end

local function do_check(ctx)
  local pay = ctx.payment or {}
  local external_id = pay.external_id
  if not external_id then
    local priv = pay.private_data or {}
    external_id = priv.external_id
  end

  if not external_id then
    return { public = {}, private = { ok = false, error = "No external_id to check" } }
  end

  return verify_payment(ctx, external_id)
end

local function do_refund(ctx)
  local pay = ctx.payment or {}
  local s = get_secrets(ctx)
  local external_id = pay.external_id or ((pay.private_data or {}).external_id)
  assert(external_id, "Missing external_id for refund")

  local idempotence_key = string.format("sb_refund_%s_%s", tostring(pay.id or 0), tostring(os.time()))
  local amount_val = string.format("%.2f", tonumber(pay.amount) or 0)

  local req_body = json.encode({
    payment_id = external_id,
    amount = {
      value = amount_val,
      currency = pay.currency or "RUB",
    },
  })

  local resp = http({
    url = "https://api.yookassa.ru/v3/refunds",
    method = "POST",
    headers = {
      ["Authorization"] = auth_header(s),
      ["Idempotence-Key"] = idempotence_key,
      ["Content-Type"] = "application/json",
    },
    body = req_body,
    timeout = 15,
  })

  if not resp.ok or (resp.status ~= 200 and resp.status ~= 201) then
    error("YooKassa refund failed: " .. tostring(resp.body))
  end

  local data = json.decode(resp.body) or {}
  return {
    ok = true,
    refund_id = data.id,
    status = data.status,
  }
end

function M.handle(ctx)
  local act = ctx.action or "create"

  if act == "create" then
    return do_create(ctx)
  elseif act == "callback" then
    return do_callback(ctx)
  elseif act == "check" then
    return do_check(ctx)
  elseif act == "refund" then
    return do_refund(ctx)
  else
    error("Unsupported YooKassa action: " .. tostring(act))
  end
end

return M
