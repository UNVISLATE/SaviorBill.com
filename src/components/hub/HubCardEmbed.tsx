import React, { useState } from 'react';
import { Download, ExternalLink, Check } from 'lucide-react';

export interface ScriptManifestData {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  actions: string[];
}

const SCRIPTS_DATA: Record<string, ScriptManifestData> = {
  'yookassa-payment': {
    id: 'yookassa-payment',
    name: 'ЮKassa Payment Gateway',
    version: '1.0.0',
    category: 'Payment Gateways',
    description: 'Прием платежей через ЮKassa API v3: карты МИР, Visa, Mastercard, СБП, SberPay, электронные кошельки с двухстадийным подтверждением и обработкой вебхуков payment.succeeded.',
    actions: ['payment.create', 'payment.check', 'webhook']
  },
  'marzban-vless': {
    id: 'marzban-vless',
    name: 'Marzban VLESS VPN Delivery',
    version: '0.9.8-beta',
    category: 'VPN & Proxies',
    description: 'Автоматическая выдача и продление VLESS-подписок через REST API панели Marzban. Создание пользователя, продление срока действия, заморозка и отзыв доступа.',
    actions: ['create', 'renew', 'stop', 'delete', 'freeze']
  },
  'cryptobot-payment': {
    id: 'cryptobot-payment',
    name: 'CryptoBot (CryptoPay) Gateway',
    version: '1.0.0',
    category: 'Payment Gateways',
    description: 'Прием криптовалютных платежей (USDT, TON, BTC, ETH) через официальный Crypto Pay API (@CryptoBot). Автоматическая конвертация валюты счёта и проверка подписи HMAC-SHA256.',
    actions: ['payment.create', 'payment.check', 'webhook']
  }
};

interface HubCardEmbedProps {
  scriptId: string;
  lang?: 'ru' | 'en';
}

export default function HubCardEmbed({ scriptId, lang = 'ru' }: HubCardEmbedProps) {
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
    <div className="my-5 rounded-2xl border border-[oklch(1_0_0/8%)] bg-[oklch(0.14_0_0)] p-4 sm:p-5 shadow-lg not-prose font-sans text-white">
      {/* Top Header: Category & Version (Clean, without Verified badge) */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[oklch(1_0_0/6%)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#009080]/15 text-[#00e0cb] border border-[#009080]/30">
            {data.category}
          </span>
          <span className="text-xs font-mono text-[oklch(0.55_0_0)]">v{data.version}</span>
        </div>
        <span className="text-[11px] font-mono text-[oklch(0.45_0_0)]">LuaJIT</span>
      </div>

      {/* Title & Description (Compact, no empty gap) */}
      <div className="pt-2.5 space-y-1">
        <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
          <a href={hubUrl} className="hover:text-[#00e0cb] transition-colors">
            {data.name}
          </a>
        </h4>
        <p className="text-xs sm:text-sm text-[oklch(0.7_0_0)] leading-relaxed">
          {data.description}
        </p>
      </div>

      {/* Action Badges (Directly below description) */}
      {data.actions && data.actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
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

      {/* Footer: Direct Download & Hub Page Link */}
      <div className="pt-3 mt-3 border-t border-[oklch(1_0_0/6%)] flex items-center justify-between gap-3">
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
