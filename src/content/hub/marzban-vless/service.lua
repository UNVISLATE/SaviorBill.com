-- Marzban VLESS Service Script for SaviorBill
-- Handles service lifecycle: create, renew, stop, delete, freeze

local M = {}

local function get_settings(ctx)
  local out = {}
  local tpl = (ctx.lua or {}).settings or {}
  for k, v in pairs(tpl) do out[k] = v end
  local svc = (ctx.service or {}).settings or {}
  for k, v in pairs(svc) do out[k] = v end
  return out
end

local function panel_url(s)
  return "https://" .. tostring(s.marzban_domain)
end

local function duration_seconds(ctx)
  local usvc_dur = ((ctx.user or {}).service or {}).duration
  local tier_dur = (((ctx.order or {}).tier or {}).duration_seconds)
  local svc_dur = (ctx.service or {}).duration
  local set_dur = get_settings(ctx).duration

  return tonumber(usvc_dur)
      or tonumber(tier_dur)
      or tonumber(svc_dur)
      or tonumber(set_dur)
      or 0
end

local function is_mock(s)
  return s.mock_mode == true or s.mock_mode == "true" or s.marzban_domain == "mock" or s.marzban_domain == "mock-panel.example.com"
end

local function calc_expire_ts(ctx)
  local ttl = duration_seconds(ctx)
  if ttl <= 0 then return 0 end
  local now = os.time()
  local base = now
  local current_expires = ((ctx.user or {}).service or {}).expires_at
  current_expires = tonumber(current_expires)
  if current_expires and current_expires > now then
    base = current_expires
  end
  return base + ttl
end

local function data_limit_bytes(s)
  local gb = tonumber(s.data_limit_gb) or 0
  if gb <= 0 then return 0 end
  return math.floor(gb * 1024 * 1024 * 1024)
end

local function gen_random_suffix(seed, len)
  math.randomseed((tonumber(seed) or 0) + os.time())
  local chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  local res = {}
  for _ = 1, len do
    local idx = math.random(1, #chars)
    res[#res + 1] = string.sub(chars, idx, idx)
  end
  return table.concat(res)
end

local function resolve_username(ctx)
  local priv = ((ctx.user or {}).service or {}).private_data or {}
  if priv.username and priv.username ~= "" then
    return tostring(priv.username)
  end
  local uid = (ctx.user or {}).id or 0
  return string.format("sb_%s_%s", tostring(uid), gen_random_suffix(uid, 6))
end

-- Marzban Admin Token Auth with Valkey Cache
local function get_admin_token(s)
  local cache_key = "marzban_token:" .. tostring(s.marzban_domain) .. ":" .. tostring(s.marzban_user)
  local cached = cache.get(cache_key)
  if cached and cached ~= "" then
    return cached
  end

  local body_str = http.urlencode({
    username = tostring(s.marzban_user),
    password = tostring(s.marzban_pass),
    grant_type = "password",
  })

  local resp = http({
    url = panel_url(s) .. "/api/admin/token",
    method = "POST",
    headers = { ["Content-Type"] = "application/x-www-form-urlencoded" },
    body = body_str,
    timeout = 10,
  })

  if not resp.ok or resp.status ~= 200 then
    error("Marzban auth failed (status " .. tostring(resp.status) .. "): " .. tostring(resp.body))
  end

  local data = json.decode(resp.body) or {}
  local token = data.access_token
  if not token then
    error("Marzban auth failed: access_token not found in response")
  end

  cache.set(cache_key, token, 1800)
  return token
end

local function marzban_request(s, method, path, body_tbl)
  local token = get_admin_token(s)
  local req = {
    url = panel_url(s) .. path,
    method = method,
    headers = {
      ["Authorization"] = "Bearer " .. token,
      ["Content-Type"] = "application/json",
    },
    timeout = 15,
  }
  if body_tbl then
    req.body = json.encode(body_tbl)
  end

  local resp = http(req)
  if resp.status == 401 then
    cache.del("marzban_token:" .. tostring(s.marzban_domain) .. ":" .. tostring(s.marzban_user))
    req.headers["Authorization"] = "Bearer " .. get_admin_token(s)
    resp = http(req)
  end
  return resp
end

local function build_user_payload(ctx, s, username)
  local exp = calc_expire_ts(ctx)
  local data_limit = data_limit_bytes(s)
  local strategy = s.reset_strategy or "no_reset"

  return {
    username = username,
    status = "active",
    expire = (exp > 0) and exp or 0,
    data_limit = data_limit,
    data_limit_reset_strategy = strategy,
    proxies = {
      vless = {
        flow = "xtls-rprx-vision",
      },
    },
    inbounds = {
      vless = {},
    },
  }, exp
end

local function format_output(user_data, username, exp)
  local sub_url = user_data.subscription_url or ""
  if sub_url ~= "" and not sub_url:match("^https?://") then
    sub_url = "https://" .. sub_url
  end

  return {
    public = {
      subscription_url = sub_url,
      username = username,
      node_type = "VLESS",
    },
    private = {
      username = username,
      marzban_status = user_data.status or "active",
      data_limit = user_data.data_limit,
    },
    state = "active",
    expires_at = (exp and exp > 0) and exp or nil,
  }
end

function M.handle(ctx)
  local act = ctx.action or "create"
  local s = get_settings(ctx)
  local username = resolve_username(ctx)

  if is_mock(s) then
    if act == "create" or act == "renew" then
      local exp = calc_expire_ts(ctx)
      local domain = (s.marzban_domain and s.marzban_domain ~= "" and s.marzban_domain ~= "mock")
        and tostring(s.marzban_domain):gsub("^https?://", ""):gsub("/+$", "")
        or "mock-vless.saviorbill.com"
      local sub_url = string.format("https://%s/sub/%s", domain, gen_random_suffix(username, 24))
      return {
        public = {
          subscription_url = sub_url,
          username = username,
          node_type = "VLESS",
        },
        private = {
          username = username,
          marzban_status = "active",
          data_limit = data_limit_bytes(s),
          is_mock = true,
        },
        state = "active",
        expires_at = (exp and exp > 0) and exp or nil,
      }
    elseif act == "stop" or act == "freeze" then
      return {
        public = { username = username },
        private = { username = username, marzban_status = "disabled", is_mock = true },
        state = "suspended",
      }
    elseif act == "delete" then
      return {
        public = {},
        private = { username = username, deleted = true, is_mock = true },
        state = "terminated",
      }
    else
      error("Unsupported service action: " .. tostring(act))
    end
  end

  assert(s.marzban_domain and s.marzban_user and s.marzban_pass, "Missing required Marzban panel credentials")

  if act == "create" then
    local payload, exp = build_user_payload(ctx, s, username)
    local resp = marzban_request(s, "POST", "/api/user", payload)
    if not resp.ok or (resp.status ~= 200 and resp.status ~= 201) then
      error("Marzban user creation error (" .. tostring(resp.status) .. "): " .. tostring(resp.body))
    end
    local user_data = json.decode(resp.body) or {}
    return format_output(user_data, username, exp)

  elseif act == "renew" then
    local exp = calc_expire_ts(ctx)
    local payload = {
      status = "active",
      expire = (exp > 0) and exp or 0,
    }
    local resp = marzban_request(s, "PUT", "/api/user/" .. username, payload)
    if not resp.ok or resp.status ~= 200 then
      error("Marzban renew error (" .. tostring(resp.status) .. "): " .. tostring(resp.body))
    end
    local user_data = json.decode(resp.body) or {}
    return format_output(user_data, username, exp)

  elseif act == "stop" or act == "freeze" then
    local resp = marzban_request(s, "PUT", "/api/user/" .. username, { status = "disabled" })
    if not resp.ok or resp.status ~= 200 then
      error("Marzban suspend error: " .. tostring(resp.body))
    end
    return {
      public = { username = username },
      private = { username = username, marzban_status = "disabled" },
      state = "suspended",
    }

  elseif act == "delete" then
    local resp = marzban_request(s, "DELETE", "/api/user/" .. username)
    return {
      public = {},
      private = { username = username, deleted = true },
      state = "terminated",
    }
  else
    error("Unsupported service action: " .. tostring(act))
  end
end

return M
