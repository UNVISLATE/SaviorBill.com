-- CryptoBot (CryptoPay API) Payment Script for SaviorBill
-- Handles actions: create, callback, check

local M = {}

local function get_secrets(ctx)
  return ((ctx.payment or {}).provider_data or {}).secrets or {}
end

local function base_api_url(s)
  if s.network == "testnet" then
    return "https://testnet-pay.crypt.bot/api"
  end
  return "https://pay.crypt.bot/api"
end

local function api_request(s, endpoint, method, body_tbl)
  local url = base_api_url(s) .. "/" .. endpoint
  local req = {
    url = url,
    method = method or "GET",
    headers = {
      ["Crypto-Pay-API-Token"] = tostring(s.api_token),
      ["Content-Type"] = "application/json",
    },
    timeout = 15,
  }
  if body_tbl then
    req.body = json.encode(body_tbl)
  end

  local resp = http(req)
  if not resp.ok or resp.status ~= 200 then
    error("CryptoBot API error (" .. tostring(resp.status) .. "): " .. tostring(resp.body))
  end

  local data = json.decode(resp.body) or {}
  if not data.ok then
    error("CryptoBot API returned not ok: " .. tostring(data.error or resp.body))
  end
  return data.result
end

-- HMAC-SHA256 signature verification according to CryptoPay documentation
local function verify_webhook_signature(token, body_str, received_sig)
  if not token or not body_str or not received_sig then
    return false
  end
  local secret_key = crypto.sha256(token)
  local calculated_sig = crypto.hmac_sha256(secret_key, body_str)
  return string.lower(calculated_sig) == string.lower(received_sig)
end

local function do_create(ctx)
  local pay = ctx.payment or {}
  local s = get_secrets(ctx)
  assert(s.api_token, "CryptoBot requires api_token")

  local amount_val = string.format("%.2f", tonumber(pay.amount) or 0)
  local currency = string.upper(pay.currency or "RUB")
  local curr_type = s.currency_type or "fiat"

  local payload = {
    amount = amount_val,
    description = string.format("Order #%s | SaviorBill", tostring(pay.id or 0)),
    payload = tostring(pay.id or 0),
    paid_btn_name = "callback",
  }

  if pay.return_url and pay.return_url ~= "" then
    payload.paid_btn_url = pay.return_url
  end

  if curr_type == "fiat" then
    payload.currency_type = "fiat"
    payload.fiat = currency
    payload.accepted_assets = s.accepted_assets or "USDT,TON,BTC,ETH,LTC"
  else
    payload.currency_type = "crypto"
    payload.asset = currency
  end

  local result = api_request(s, "createInvoice", "POST", payload)
  local invoice_id = result.invoice_id
  local pay_url = result.mini_app_invoice_url or result.bot_invoice_url or result.web_app_invoice_url

  if not pay_url then
    error("CryptoBot createInvoice response missing invoice URL")
  end

  return {
    confirmation_url = pay_url,
    external_id = tostring(invoice_id),
    payment_id = pay.id,
  }
end

local function do_callback(ctx)
  local req = ctx.request or {}
  local s = get_secrets(ctx)
  local body_str = req.body or ""
  local headers = req.headers or {}

  local sig = headers["crypto-pay-api-signature"] or headers["Crypto-Pay-Api-Signature"]
  if not sig then
    error("CryptoBot webhook missing crypto-pay-api-signature header")
  end

  if not verify_webhook_signature(s.api_token, body_str, sig) then
    error("CryptoBot webhook signature verification failed")
  end

  local update = json.decode(body_str) or {}
  local update_type = update.update_type
  local payload = update.payload or {}

  local invoice_id = tostring(payload.invoice_id or "")
  local status = payload.status or ""
  local internal_id = tonumber(payload.payload)

  local is_paid = (update_type == "invoice_paid" or status == "paid")
  local is_failed = (status == "expired")

  return {
    public = {},
    private = {
      ok = true,
      paid = is_paid,
      failed = is_failed,
      payment_id = internal_id,
      external_id = invoice_id,
      status = status,
      paid_asset = payload.paid_asset,
      paid_amount = payload.paid_amount,
    },
  }
end

local function do_check(ctx)
  local pay = ctx.payment or {}
  local s = get_secrets(ctx)
  local external_id = pay.external_id or ((pay.private_data or {}).external_id)
  if not external_id then
    return { public = {}, private = { ok = false, error = "No external_id for check" } }
  end

  local result = api_request(s, "getInvoices?invoice_ids=" .. tostring(external_id), "GET")
  local items = result.items or {}
  if #items == 0 then
    return { public = {}, private = { ok = false, error = "Invoice not found in CryptoBot" } }
  end

  local inv = items[1]
  local status = inv.status or ""

  return {
    public = {},
    private = {
      ok = true,
      paid = (status == "paid"),
      failed = (status == "expired"),
      payment_id = tonumber(inv.payload),
      external_id = tostring(inv.invoice_id),
      status = status,
    },
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
  else
    error("Unsupported CryptoBot action: " .. tostring(act))
  end
end

return M
