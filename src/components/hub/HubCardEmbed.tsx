import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp, Code2, ExternalLink, Check } from 'lucide-react';

export interface ScriptManifestData {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  actions: string[];
  luaSnippet?: string;
}

const SCRIPTS_DATA: Record<string, ScriptManifestData> = {
  'yookassa-payment': {
    id: 'yookassa-payment',
    name: 'ЮKassa Payment Gateway',
    version: '1.0.0',
    category: 'Payment Gateways',
    description: 'Прием платежей через ЮKassa API v3: карты МИР, Visa, Mastercard, СБП, SberPay, электронные кошельки с двухстадийным подтверждением и обработкой вебхуков payment.succeeded.',
    actions: ['payment.create', 'payment.check', 'webhook'],
    luaSnippet: `-- YooKassa API v3 Payment Script for SaviorBill
-- Handles actions: create, callback, check, refund
local M = {}

local function auth_header(s)
  local credentials = tostring(s.shop_id) .. ":" .. tostring(s.secret_key)
  return "Basic " .. crypto.base64_encode(credentials)
end

function M.create(ctx)
  local s = ((ctx.payment or {}).provider_data or {}).secrets or {}
  local p = ctx.payment or {}
  local idempotence_key = crypto.uuid_v4()
  local resp = http({
    url = "https://api.yookassa.ru/v3/payments",
    method = "POST",
    headers = {
      ["Authorization"] = auth_header(s),
      ["Idempotence-Key"] = idempotence_key,
      ["Content-Type"] = "application/json"
    },
    body = json.encode({
      amount = { value = string.format("%.2f", tonumber(p.amount) or 0), currency = p.currency or "RUB" },
      confirmation = { type = "redirect", return_url = s.return_url },
      capture = true,
      description = "Оплата заказа #" .. tostring(p.invoice_id)
    })
  })
  local data = json.decode(resp.body) or {}
  return {
    public = { redirect_url = (data.confirmation or {}).confirmation_url },
    private = { external_id = data.id, status = data.status }
  }
end
return M`
  },
  'marzban-vless': {
    id: 'marzban-vless',
    name: 'Marzban VLESS VPN Delivery',
    version: '0.9.8-beta',
    category: 'VPN & Proxies',
    description: 'Автоматическая выдача и продление VLESS-подписок через REST API панели Marzban. Создание пользователя, продление срока действия, заморозка и отзыв доступа.',
    actions: ['create', 'renew', 'stop', 'delete', 'freeze'],
    luaSnippet: `-- Marzban VLESS Service Script for SaviorBill
-- Handles service lifecycle: create, renew, stop, delete, freeze
local M = {}

local function get_token(s)
  local cache_key = "marzban_jwt_" .. crypto.sha256(s.marzban_user .. s.marzban_domain)
  local cached = valkey.get(cache_key)
  if cached and cached ~= "" then return cached end

  local resp = http({
    url = "https://" .. s.marzban_domain .. "/api/admin/token",
    method = "POST",
    headers = { ["Content-Type"] = "application/x-www-form-urlencoded" },
    body = http.urlencode({ username = s.marzban_user, password = s.marzban_pass })
  })
  local data = json.decode(resp.body) or {}
  valkey.set(cache_key, data.access_token, 1800)
  return data.access_token
end

function M.create(ctx)
  local s = (ctx.lua or {}).settings or {}
  local token = get_token(s)
  local username = "sb_" .. tostring(ctx.user.id) .. "_" .. crypto.random_hex(4)
  local resp = http({
    url = "https://" .. s.marzban_domain .. "/api/user",
    method = "POST",
    headers = { ["Authorization"] = "Bearer " .. token, ["Content-Type"] = "application/json" },
    body = json.encode({
      username = username,
      proxies = { vless = { flow = "xtls-rprx-vision" } },
      inbounds = { vless = { "VLESS Reality TCP" } },
      data_limit = (tonumber(s.data_limit_gb) or 0) * 1073741824,
      expire = os.time() + (tonumber(ctx.service.duration) or 2592000)
    })
  })
  local u = json.decode(resp.body) or {}
  return {
    public = { subscription_url = u.subscription_url, username = username },
    private = { marzban_username = username },
    state = "active"
  }
end
return M`
  },
  'cryptobot-payment': {
    id: 'cryptobot-payment',
    name: 'CryptoBot (CryptoPay) Gateway',
    version: '1.0.0',
    category: 'Payment Gateways',
    description: 'Прием криптовалютных платежей (USDT, TON, BTC, ETH) через официальный Crypto Pay API (@CryptoBot). Автоматическая конвертация валюты счёта и проверка подписи HMAC-SHA256.',
    actions: ['payment.create', 'payment.check', 'webhook'],
    luaSnippet: `-- CryptoBot Payment Script for SaviorBill
local M = {}

function M.create(ctx)
  local s = ((ctx.payment or {}).provider_data or {}).secrets or {}
  local p = ctx.payment or {}
  local resp = http({
    url = "https://pay.crypt.bot/api/createInvoice",
    method = "POST",
    headers = {
      ["Crypto-Pay-API-Token"] = s.api_token,
      ["Content-Type"] = "application/json"
    },
    body = json.encode({
      amount = tostring(p.amount),
      currency_type = "fiat",
      fiat = p.currency or "RUB",
      description = "Заказ #" .. tostring(p.invoice_id)
    })
  })
  local data = json.decode(resp.body) or {}
  local inv = data.result or {}
  return {
    public = { redirect_url = inv.pay_url, bot_invoice_url = inv.bot_invoice_url },
    private = { invoice_id = inv.invoice_id, status = inv.status }
  }
end
return M`
  }
};

interface HubCardEmbedProps {
  scriptId: string;
  lang?: 'ru' | 'en';
}

export default function HubCardEmbed({ scriptId, lang = 'ru' }: HubCardEmbedProps) {
  const [showCode, setShowCode] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const data = SCRIPTS_DATA[scriptId];
  if (!data) return null;

  const isRu = lang === 'ru';
  const zipUrl = `/downloads/hub/${data.id}.zip`;
  const hubUrl = `/${lang}/hub/${data.id}`;

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `${data.id}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="my-6 rounded-2xl border border-[oklch(1_0_0/10%)] bg-[oklch(0.14_0_0)] p-5 shadow-xl transition-all not-prose font-sans text-white hover:border-[#009080]/40">
      {/* Top Header: Category, Version, Verified */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[oklch(1_0_0/6%)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#009080]/15 text-[#00e0cb] border border-[#009080]/30">
            {data.category}
          </span>
          <span className="text-xs font-mono text-[oklch(0.55_0_0)]">v{data.version}</span>
        </div>

        <span className="text-[11px] text-[#00e0cb] font-semibold flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[#00e0cb] animate-pulse" />
          <span>{isRu ? 'Проверен ядром' : 'Verified Module'}</span>
        </span>
      </div>

      {/* Title & Description */}
      <div className="pt-3 pb-2 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
            <a href={hubUrl} className="hover:text-[#00e0cb] transition-colors">
              {data.name}
            </a>
          </h4>
          <span className="text-[11px] font-mono text-[oklch(0.5_0_0)]">LuaJIT</span>
        </div>
        <p className="text-xs sm:text-sm text-[oklch(0.7_0_0)] leading-relaxed">
          {data.description}
        </p>
      </div>

      {/* Action Badges */}
      {data.actions && data.actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 py-2">
          <span className="text-[10px] font-mono text-[oklch(0.5_0_0)] uppercase tracking-wider">
            {isRu ? 'Действия:' : 'Actions:'}
          </span>
          {data.actions.map((act) => (
            <span
              key={act}
              className="px-2 py-0.5 rounded bg-[oklch(0.18_0_0)] text-[oklch(0.85_0_0)] font-mono text-[10px] border border-[oklch(1_0_0/4%)]"
            >
              {act}
            </span>
          ))}
        </div>
      )}

      {/* Code Snippet (Expandable) */}
      {data.luaSnippet && (
        <div className="pt-2 border-t border-[oklch(1_0_0/6%)]">
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1.5 text-xs font-mono text-[#009080] hover:text-[#00e0cb] py-1 transition-colors cursor-pointer select-none"
          >
            <Code2 className="size-3.5" />
            <span>{showCode ? (isRu ? 'Скрыть исходный код' : 'Hide source code') : (isRu ? 'Посмотреть код Lua' : 'View Lua source code')}</span>
            {showCode ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {showCode && (
            <div className="mt-2.5 rounded-xl bg-black/60 border border-[oklch(1_0_0/8%)] p-3 text-xs font-mono text-[oklch(0.85_0_0)] overflow-x-auto max-h-72 select-all">
              <pre className="leading-relaxed"><code>{data.luaSnippet}</code></pre>
            </div>
          )}
        </div>
      )}

      {/* Footer: Direct Download & Hub Page Link */}
      <div className="pt-3.5 mt-3 border-t border-[oklch(1_0_0/6%)] flex items-center justify-between gap-3">
        <a
          href={hubUrl}
          className="text-xs text-[#009080] hover:text-[#00e0cb] font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <span>{isRu ? 'Открыть в каталоге Hub' : 'Open in Hub Catalog'}</span>
          <ExternalLink className="size-3" />
        </a>

        <button
          type="button"
          onClick={handleDownload}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
            downloading
              ? 'bg-[#009080] text-white'
              : 'bg-[#009080] hover:bg-[#007a6d] text-white'
          }`}
        >
          {downloading ? (
            <>
              <Check className="size-3.5" />
              <span>{isRu ? 'Скачивание...' : 'Downloading...'}</span>
            </>
          ) : (
            <>
              <Download className="size-3.5" />
              <span>{isRu ? 'Скачать .zip' : 'Download .zip'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
