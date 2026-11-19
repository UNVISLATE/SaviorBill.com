import React, { useState } from 'react';
import {
  Gauge,
  Users,
  ShoppingCart,
  Receipt,
  Ticket,
  FolderTree,
  Package,
  KeyRound,
  Images,
  ScrollText,
  Zap,
  Mail,
  CreditCard,
  FileClock,
  MonitorCog,
  Settings,
  ChevronDown,
  ChevronsUpDown,
  PanelLeft,
  Plug
} from 'lucide-react';

interface PeriodData {
  revenue: string;
  paidCount: number;
  pendingCount: number;
  promoCount: number;
  providers: Array<{ name: string; amount: string; count: string; pct: number }>;
}

const PERIOD_DATA: Record<string, PeriodData> = {
  '7': {
    revenue: '3 840 ₽',
    paidCount: 1,
    pendingCount: 0,
    promoCount: 0,
    providers: [
      { name: 'mockcrypto', amount: '930 ₽ · 1 платёж', count: '1 платёж', pct: 100 },
      { name: 'mockcard', amount: '0 ₽ · 0 платежей', count: '0 платежей', pct: 0 },
      { name: 'sbp', amount: '0 ₽ · 0 платежей', count: '0 платежей', pct: 0 },
    ]
  },
  '30': {
    revenue: '13 916 ₽',
    paidCount: 4,
    pendingCount: 1,
    promoCount: 1,
    providers: [
      { name: 'mockcrypto', amount: '930 ₽ · 1 платёж', count: '1 платёж', pct: 100 },
      { name: 'mockcard', amount: '890 ₽ · 1 платёж', count: '1 платёж', pct: 95 },
      { name: 'sbp', amount: '729 ₽ · 2 платежей', count: '2 платежей', pct: 78 },
    ]
  },
  '90': {
    revenue: '48 290 ₽',
    paidCount: 16,
    pendingCount: 2,
    promoCount: 5,
    providers: [
      { name: 'mockcrypto', amount: '22 450 ₽ · 7 платежей', count: '7 платежей', pct: 100 },
      { name: 'mockcard', amount: '18 340 ₽ · 5 платежей', count: '5 платежей', pct: 81 },
      { name: 'sbp', amount: '7 500 ₽ · 4 платежей', count: '4 платежей', pct: 33 },
    ]
  }
};

export default function RealAdminMockup() {
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    users: true,
    catalog: true,
    auto: false,
    providers: false
  });

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const current = PERIOD_DATA[period];

  return (
    /* Outer Window Container:
       Fixed height to prevent ANY layout jumping when toggling sidebar groups.
       Rounded top-left border, seamlessly integrates into the background. */
    <div className="sb-admin-mockup-root w-full h-full text-left select-none font-sans rounded-tl-2xl rounded-bl-none border-t border-l border-white/10 bg-[#0f0f11] shadow-2xl overflow-hidden flex antialiased">
      
      {/* ================= SIDEBAR (Outer Shell) ================= */}
      <aside className="w-56 shrink-0 bg-[#0f0f11] flex flex-col justify-between pt-3 pb-2 pl-2 pr-1 h-full">
        
        {/* Top section: Brand + Nav Menu */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Sidebar Branding Header */}
          <div className="flex items-center gap-2.5 px-2.5 py-1.5 shrink-0">
            <img src="/logo.svg" alt="SaviorBill Logo" className="size-6 object-contain" />
            <span className="text-sm font-semibold tracking-tight text-white">
              SaviorBill Admin
            </span>
          </div>

          {/* Navigation Menu (Scrollable if needed, never alters window dimensions) */}
          <nav className="mt-3 space-y-1 text-xs overflow-y-auto pr-1 flex-1">
            
            {/* Active: Дашборд */}
            <button 
              type="button" 
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#0c5e53] text-white font-medium shadow-xs"
            >
              <Gauge className="size-4 shrink-0 text-white" />
              <span>Дашборд</span>
            </button>

            {/* Group: Пользователи */}
            <div>
              <button 
                type="button" 
                onClick={() => toggleGroup('users')} 
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="size-4 shrink-0" />
                  <span>Пользователи</span>
                </div>
                <ChevronDown className={`size-3 text-[#71717a] transition-transform duration-200 ${openGroups.users ? '' : '-rotate-90'}`} />
              </button>
              {openGroups.users && (
                <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-white/[0.08] ml-4 mt-0.5">
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <Users className="size-3.5 shrink-0" />
                    <span>Пользователи</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <ShoppingCart className="size-3.5 shrink-0" />
                    <span>Заказы</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <Receipt className="size-3.5 shrink-0" />
                    <span>Платежи</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <Ticket className="size-3.5 shrink-0" />
                    <span>Промокоды</span>
                  </div>
                </div>
              )}
            </div>

            {/* Group: Каталог */}
            <div>
              <button 
                type="button" 
                onClick={() => toggleGroup('catalog')} 
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="size-4 shrink-0" />
                  <span>Каталог</span>
                </div>
                <ChevronDown className={`size-3 text-[#71717a] transition-transform duration-200 ${openGroups.catalog ? '' : '-rotate-90'}`} />
              </button>
              {openGroups.catalog && (
                <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-white/[0.08] ml-4 mt-0.5">
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <FolderTree className="size-3.5 shrink-0" />
                    <span>Каталоги</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <Package className="size-3.5 shrink-0" />
                    <span>Услуги</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <KeyRound className="size-3.5 shrink-0" />
                    <span>Ключи</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <Images className="size-3.5 shrink-0" />
                    <span>Медиатека</span>
                  </div>
                </div>
              )}
            </div>

            {/* Group: Автоматизация */}
            <div>
              <button 
                type="button" 
                onClick={() => toggleGroup('auto')} 
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="size-4 shrink-0" />
                  <span>Автоматизация</span>
                </div>
                <ChevronDown className={`size-3 text-[#71717a] transition-transform duration-200 ${openGroups.auto ? '' : '-rotate-90'}`} />
              </button>
              {openGroups.auto && (
                <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-white/[0.08] ml-4 mt-0.5">
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <ScrollText className="size-3.5 shrink-0" />
                    <span>Скрипты</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <Zap className="size-3.5 shrink-0" />
                    <span>Триггеры</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <Mail className="size-3.5 shrink-0" />
                    <span>Email-шаблоны</span>
                  </div>
                </div>
              )}
            </div>

            {/* Group: Провайдеры */}
            <div>
              <button 
                type="button" 
                onClick={() => toggleGroup('providers')} 
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="size-4 shrink-0" />
                  <span>Провайдеры</span>
                </div>
                <ChevronDown className={`size-3 text-[#71717a] transition-transform duration-200 ${openGroups.providers ? '' : '-rotate-90'}`} />
              </button>
              {openGroups.providers && (
                <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-white/[0.08] ml-4 mt-0.5">
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <CreditCard className="size-3.5 shrink-0" />
                    <span>Платежи</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
                    <KeyRound className="size-3.5 shrink-0" />
                    <span>OAuth</span>
                  </div>
                </div>
              )}
            </div>

            {/* Standalone plugin item */}
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] cursor-pointer">
              <Plug className="size-4 shrink-0" />
              <span>Тест-плагин</span>
            </div>

          </nav>
        </div>

        {/* Sidebar Footer (Pinned at bottom) */}
        <div className="px-1 pt-2 border-t border-white/[0.08] space-y-2 shrink-0">
          <div className="space-y-0.5 text-xs text-[#a1a1aa]">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded hover:text-white hover:bg-white/[0.04] cursor-pointer">
              <FileClock className="size-3.5 shrink-0" />
              <span>Аудит</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded hover:text-white hover:bg-white/[0.04] cursor-pointer">
              <MonitorCog className="size-3.5 shrink-0" />
              <span>Система</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded hover:text-white hover:bg-white/[0.04] cursor-pointer">
              <Settings className="size-3.5 shrink-0" />
              <span>Настройки</span>
            </div>
          </div>

          {/* NavUser Component (owner) */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-full bg-neutral-800 text-neutral-200 text-[11px] font-semibold flex items-center justify-center shrink-0">
                OW
              </div>
              <div className="min-w-0 truncate">
                <div className="text-xs font-semibold text-white leading-tight truncate">owner</div>
                <div className="text-[10px] text-[#71717a] leading-tight truncate">owner</div>
              </div>
            </div>
            <ChevronsUpDown className="size-3.5 text-[#71717a] shrink-0" />
          </div>
        </div>

      </aside>

      {/* ================= MAIN CONTENT INSET CARD (Image 3 layout) ================= */}
      <main className="flex-1 flex flex-col min-w-0 mt-2.5 mr-2.5 ml-0 mb-0 rounded-t-xl rounded-b-none border-t border-l border-r border-white/[0.08] bg-[#141416] shadow-lg overflow-hidden h-[calc(100%-0.625rem)]">
        
        {/* Main Top Header Bar (Inside inset panel) */}
        <header className="h-11 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#141416]">
          <div className="flex items-center gap-2.5">
            <button type="button" className="p-1 rounded text-[#a1a1aa] hover:text-white hover:bg-white/[0.06] transition-colors">
              <PanelLeft className="size-4" />
            </button>
            <span className="h-3.5 w-px bg-white/10" />
            <span className="text-xs font-medium text-white/90">Дашборд</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-mono text-[#a1a1aa]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>v0.0.0-dev</span>
          </div>
        </header>

        {/* Dashboard Body Page */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Welcome row & Period Switcher */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold !text-white tracking-tight" style={{ color: '#ffffff' }}>Добро пожаловать, owner</h2>
              <p className="text-xs !text-[#a1a1aa]" style={{ color: '#a1a1aa' }}>Сводка за выбранный период.</p>
            </div>

            {/* Period Button Group */}
            <div className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5 text-xs font-medium">
              {(['7', '30', '90'] as const).map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setPeriod(days)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    period === days 
                      ? 'bg-[#0c5e53] text-white font-semibold shadow-xs' 
                      : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  {days === '7' ? '7 дней' : days === '30' ? '30 дней' : '90 дней'}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="rounded-xl bg-[#1c1c1f] p-3 border border-white/[0.08] flex flex-col justify-between">
              <span className="text-[11px] text-[#a1a1aa]">Доход за период</span>
              <span className="text-lg font-bold text-white pt-1 tabular-nums tracking-tight">{current.revenue}</span>
            </div>

            <div className="rounded-xl bg-[#1c1c1f] p-3 border border-white/[0.08] flex flex-col justify-between">
              <span className="text-[11px] text-[#a1a1aa]">Оплачено заказов</span>
              <span className="text-lg font-bold text-white pt-1 tabular-nums">{current.paidCount}</span>
            </div>

            <div className="rounded-xl bg-[#1c1c1f] p-3 border border-white/[0.08] flex flex-col justify-between">
              <span className="text-[11px] text-[#a1a1aa]">Ожидают оплаты</span>
              <span className="text-lg font-bold text-white pt-1 tabular-nums">{current.pendingCount}</span>
            </div>

            <div className="rounded-xl bg-[#1c1c1f] p-3 border border-white/[0.08] flex flex-col justify-between">
              <span className="text-[11px] text-[#a1a1aa]">Погашено промокодов</span>
              <span className="text-lg font-bold text-white pt-1 tabular-nums">{current.promoCount}</span>
            </div>
          </div>

          {/* Middle Row: Доход по провайдерам + Топ услуг */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Card 1: Доход по провайдерам */}
            <div className="rounded-xl bg-[#1c1c1f] p-3.5 border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-white">Доход по провайдерам</h3>
                <p className="text-[11px] text-[#71717a]">Оплаченные платежи за период</p>
              </div>

              <div className="space-y-2.5">
                {current.providers.map(p => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#f4f4f5]">{p.name}</span>
                      <span className="text-[11px] text-[#a1a1aa] tabular-nums">{p.amount}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#009080] rounded-full transition-all duration-300" 
                        style={{ width: `${p.pct}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Топ услуг */}
            <div className="rounded-xl bg-[#1c1c1f] p-3.5 border border-white/[0.08] flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-semibold text-white">Топ услуг</h3>
                <p className="text-[11px] text-[#71717a]">По числу выданных за всё время</p>
              </div>

              <div className="text-xs">
                <div className="grid grid-cols-6 pb-1 border-b border-white/[0.06] text-[10px] uppercase font-medium text-[#71717a]">
                  <span className="col-span-4">Услуга</span>
                  <span className="col-span-1 text-right">Продано</span>
                  <span className="col-span-1 text-right truncate">Остаток</span>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  <div className="grid grid-cols-6 py-1 text-[11px]">
                    <span className="col-span-4 font-medium text-white/90 truncate">Пополнение баланса Steam</span>
                    <span className="col-span-1 text-right tabular-nums text-white">1</span>
                    <span className="col-span-1 text-right text-[#71717a]">—</span>
                  </div>
                  <div className="grid grid-cols-6 py-1 text-[11px]">
                    <span className="col-span-4 font-medium text-white/90 truncate">UNVI VPN (VLESS + Reality)</span>
                    <span className="col-span-1 text-right tabular-nums text-white">1</span>
                    <span className="col-span-1 text-right text-[#71717a]">—</span>
                  </div>
                  <div className="grid grid-cols-6 py-1 text-[11px]">
                    <span className="col-span-4 font-medium text-white/90 truncate">VPS / VDS NVMe Конструктор</span>
                    <span className="col-span-1 text-right tabular-nums text-white">1</span>
                    <span className="col-span-1 text-right text-[#71717a]">—</span>
                  </div>
                  <div className="grid grid-cols-6 py-1 text-[11px]">
                    <span className="col-span-4 font-medium text-white/90 truncate">Лицензионный ключ UNVI Pro (12 мес.)</span>
                    <span className="col-span-1 text-right tabular-nums text-white">1</span>
                    <span className="col-span-1 text-right tabular-nums text-white/80">9</span>
                  </div>
                  <div className="grid grid-cols-6 py-1 text-[11px]">
                    <span className="col-span-4 font-medium text-white/90 truncate">UNVI Private DNS + AdBlock</span>
                    <span className="col-span-1 text-right tabular-nums text-white">0</span>
                    <span className="col-span-1 text-right text-[#71717a]">—</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: Топ промокодов + Продвинутая аналитика */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Card 1: Топ промокодов */}
            <div className="rounded-xl bg-[#1c1c1f] p-3.5 border border-white/[0.08] flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-semibold text-white">Топ промокодов</h3>
                <p className="text-[11px] text-[#71717a]">По числу использований за всё время</p>
              </div>

              <div className="text-xs">
                <div className="grid grid-cols-6 pb-1 border-b border-white/[0.06] text-[10px] uppercase font-medium text-[#71717a]">
                  <span className="col-span-4">Код</span>
                  <span className="col-span-1 text-right truncate">Использ.</span>
                  <span className="col-span-1 text-right">Остаток</span>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  <div className="grid grid-cols-6 py-1.5 text-[11px]">
                    <span className="col-span-4 font-mono font-medium text-white">UNVI20</span>
                    <span className="col-span-1 text-right tabular-nums text-white">14</span>
                    <span className="col-span-1 text-right tabular-nums text-white/70">86</span>
                  </div>
                  <div className="grid grid-cols-6 py-1.5 text-[11px]">
                    <span className="col-span-4 font-mono font-medium text-white">BONUS250</span>
                    <span className="col-span-1 text-right tabular-nums text-white">7</span>
                    <span className="col-span-1 text-right tabular-nums text-white/70">93</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Продвинутая аналитика */}
            <div className="rounded-xl bg-[#1c1c1f] p-3.5 border border-white/[0.08] flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-semibold text-white">Продвинутая аналитика</h3>
                <p className="text-[11px] text-[#71717a]">Только для владельца — доступ отдельным правом</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-[#71717a] block leading-tight">До первой оплаты</span>
                  <span className="text-sm font-bold text-white pt-1 block">—</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717a] block leading-tight">Churn (неактивны 30 дн.)</span>
                  <span className="text-sm font-bold text-white pt-1 block">100.0%</span>
                  <span className="text-[10px] text-[#71717a]">1 из 1</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717a] block leading-tight">ROI</span>
                  <p className="text-[9px] text-[#71717a] pt-1 leading-snug">
                    нет данных о стоимости привлечения (CAC) в модели — добавить источник расходов на маркетинг, чтобы включить расчёт
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
