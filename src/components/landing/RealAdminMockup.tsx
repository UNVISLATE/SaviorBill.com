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
  Settings,
  Lock,
  RefreshCw
} from 'lucide-react';

interface PeriodData {
  revenue: string;
  paidCount: number;
  pendingCount: number;
  promoCount: number;
  providers: Array<{ name: string; amount: string; count: number; pct: number }>;
}

const PERIOD_DATA: Record<string, PeriodData> = {
  '7': {
    revenue: '3 840 ₽',
    paidCount: 1,
    pendingCount: 0,
    promoCount: 0,
    providers: [
      { name: 'mockcrypto', amount: '930 ₽', count: 1, pct: 100 },
      { name: 'mockcard', amount: '0 ₽', count: 0, pct: 0 },
      { name: 'sbp', amount: '0 ₽', count: 0, pct: 0 },
    ]
  },
  '30': {
    revenue: '13 916 ₽',
    paidCount: 4,
    pendingCount: 1,
    promoCount: 1,
    providers: [
      { name: 'mockcrypto', amount: '930 ₽', count: 1, pct: 100 },
      { name: 'mockcard', amount: '890 ₽', count: 1, pct: 95 },
      { name: 'sbp', amount: '729 ₽', count: 2, pct: 78 },
    ]
  },
  '90': {
    revenue: '48 290 ₽',
    paidCount: 16,
    pendingCount: 2,
    promoCount: 5,
    providers: [
      { name: 'mockcrypto', amount: '22 450 ₽', count: 7, pct: 100 },
      { name: 'mockcard', amount: '18 340 ₽', count: 5, pct: 81 },
      { name: 'sbp', amount: '7 500 ₽', count: 4, pct: 33 },
    ]
  }
};

export default function RealAdminMockup() {
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [activeItem, setActiveItem] = useState('dashboard');
  const current = PERIOD_DATA[period];

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/60 bg-[oklch(0.12_0_0)] border border-[oklch(1_0_0/8%)] text-[oklch(0.92_0_0)] font-sans select-none text-left">
      
      {/* Top Browser Window Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[oklch(0.14_0_0)] border-b border-[oklch(1_0_0/6%)]">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ff5f56]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#27c93f]" />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[oklch(0.10_0_0)] text-xs text-[oklch(0.6_0_0)] font-mono max-w-sm w-full mx-4 truncate border border-[oklch(1_0_0/4%)]">
          <Lock className="size-3 text-[#009080] shrink-0" />
          <span className="text-[#009080]">https://</span>
          <span className="text-[oklch(0.75_0_0)]">billing.saviorbill.com</span>
          <span className="text-[oklch(0.45_0_0)]">/admin/dashboard</span>
        </div>

        <div className="flex items-center gap-2 text-[oklch(0.45_0_0)]">
          <RefreshCw className="size-3.5 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Main Admin Container */}
      <div className="flex min-h-[580px] bg-[oklch(0.12_0_0)]">
        
        {/* Real Sidebar (1v1 from SaviorBill adminui/src/components/layout) */}
        <aside className="w-56 shrink-0 bg-[oklch(0.135_0_0)] border-r border-[oklch(1_0_0/6%)] flex flex-col justify-between py-4 text-xs">
          
          <div className="space-y-4">
            {/* Brand Logo Header */}
            <div className="px-4 flex items-center gap-2.5 pb-2 border-b border-[oklch(1_0_0/6%)]">
              <img src="/logo.svg" alt="" className="size-6 object-contain" />
              <div>
                <div className="font-bold tracking-tight text-white text-sm">Savior<span className="text-[#009080]">Bill</span></div>
                <div className="text-[10px] text-[oklch(0.5_0_0)] font-mono">ADMIN PANEL</div>
              </div>
            </div>

            {/* Nav Groups */}
            <nav className="px-2 space-y-3 font-medium">
              
              {/* Group: Обзор */}
              <div>
                <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-[oklch(0.45_0_0)]">
                  Обзор
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItem('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                    activeItem === 'dashboard'
                      ? 'bg-[#009080]/15 text-[#00e0cb] font-semibold'
                      : 'text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white'
                  }`}
                >
                  <Gauge className="size-4 shrink-0" />
                  <span>Дашборд</span>
                </button>
              </div>

              {/* Group: Пользователи */}
              <div>
                <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-[oklch(0.45_0_0)]">
                  Пользователи
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <Users className="size-4 shrink-0" />
                    <span>Пользователи</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <ShoppingCart className="size-4 shrink-0" />
                    <span>Заказы</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <Receipt className="size-4 shrink-0" />
                    <span>Платежи</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <Ticket className="size-4 shrink-0" />
                    <span>Промокоды</span>
                  </div>
                </div>
              </div>

              {/* Group: Каталог */}
              <div>
                <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-[oklch(0.45_0_0)]">
                  Каталог
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <FolderTree className="size-4 shrink-0" />
                    <span>Каталоги</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <Package className="size-4 shrink-0" />
                    <span>Услуги</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <KeyRound className="size-4 shrink-0" />
                    <span>Ключи</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <Images className="size-4 shrink-0" />
                    <span>Медиатека</span>
                  </div>
                </div>
              </div>

              {/* Group: Автоматизация */}
              <div>
                <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-[oklch(0.45_0_0)]">
                  Автоматизация
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <ScrollText className="size-4 shrink-0 text-[#009080]" />
                    <span>Скрипты (Lua)</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[oklch(0.7_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
                    <Zap className="size-4 shrink-0" />
                    <span>Триггеры</span>
                  </div>
                </div>
              </div>

            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="px-3 pt-3 border-t border-[oklch(1_0_0/6%)] space-y-1">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[oklch(0.6_0_0)] hover:bg-[oklch(0.18_0_0)] hover:text-white cursor-pointer transition-colors">
              <Settings className="size-4 shrink-0" />
              <span>Настройки</span>
            </div>
            
            <div className="flex items-center gap-2.5 px-2.5 py-2 mt-2 rounded-xl bg-[oklch(0.16_0_0)]">
              <span className="size-6 rounded-full bg-[#009080] text-white flex items-center justify-center font-bold text-xs">
                O
              </span>
              <div className="leading-tight truncate">
                <div className="text-white font-medium truncate">owner</div>
                <div className="text-[10px] text-[oklch(0.5_0_0)] truncate">Владелец</div>
              </div>
            </div>
          </div>

        </aside>

        {/* Dashboard Main Workspace (1v1 from DashboardPage.tsx) */}
        <main className="flex-1 p-5 overflow-y-auto space-y-4">
          
          {/* Top Bar: Welcome + Period Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[oklch(1_0_0/6%)]">
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Добро пожаловать, owner
              </h2>
              <p className="text-xs text-[oklch(0.6_0_0)]">
                Сводка за выбранный период.
              </p>
            </div>

            {/* Period Switcher (1v1 ButtonGroup) */}
            <div className="inline-flex rounded-lg bg-[oklch(0.16_0_0)] p-0.5 border border-[oklch(1_0_0/6%)] text-xs font-medium">
              {(['7', '30', '90'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    period === p
                      ? 'bg-[#009080] text-white font-semibold shadow-sm'
                      : 'text-[oklch(0.65_0_0)] hover:text-white'
                  }`}
                >
                  {p} дней
                </button>
              ))}
            </div>
          </div>

          {/* 4 StatCards (1v1 from DashboardPage.tsx) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[oklch(0.155_0_0)] border border-[oklch(1_0_0/6%)]">
              <div className="text-xs text-[oklch(0.6_0_0)] mb-1">Доход за период</div>
              <div className="text-lg font-bold text-white tabular-nums">{current.revenue}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[oklch(0.155_0_0)] border border-[oklch(1_0_0/6%)]">
              <div className="text-xs text-[oklch(0.6_0_0)] mb-1">Оплачено заказов</div>
              <div className="text-lg font-bold text-white tabular-nums">{current.paidCount}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[oklch(0.155_0_0)] border border-[oklch(1_0_0/6%)]">
              <div className="text-xs text-[oklch(0.6_0_0)] mb-1">Ожидают оплаты</div>
              <div className="text-lg font-bold text-white tabular-nums">{current.pendingCount}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[oklch(0.155_0_0)] border border-[oklch(1_0_0/6%)]">
              <div className="text-xs text-[oklch(0.6_0_0)] mb-1">Погашено промокодов</div>
              <div className="text-lg font-bold text-white tabular-nums">{current.promoCount}</div>
            </div>
          </div>

          {/* Middle Row: Доход по провайдерам + Топ услуг */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Card: Доход по провайдерам */}
            <div className="p-4 rounded-xl bg-[oklch(0.155_0_0)] border border-[oklch(1_0_0/6%)] space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white">Доход по провайдерам</h3>
                <p className="text-[11px] text-[oklch(0.6_0_0)]">Оплаченные платежи за период</p>
              </div>

              <div className="space-y-2.5">
                {current.providers.map((pr) => (
                  <div key={pr.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-medium text-white">{pr.name}</span>
                      <span className="text-[oklch(0.65_0_0)]">{pr.amount} · {pr.count} плат.</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[oklch(0.20_0_0)] overflow-hidden">
                      <div
                        className="h-full bg-[#009080] rounded-full transition-all duration-300"
                        style={{ width: `${pr.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Топ услуг */}
            <div className="p-4 rounded-xl bg-[oklch(0.155_0_0)] border border-[oklch(1_0_0/6%)] space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white">Топ услуг</h3>
                <p className="text-[11px] text-[oklch(0.6_0_0)]">По числу выданных за всё время</p>
              </div>

              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-mono text-[oklch(0.5_0_0)] border-b border-[oklch(1_0_0/6%)]">
                    <th className="pb-1.5 font-normal">Услуга</th>
                    <th className="pb-1.5 text-right font-normal">Продано</th>
                    <th className="pb-1.5 text-right font-normal">Остаток</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[oklch(1_0_0/4%)]">
                  <tr>
                    <td className="py-1.5 font-medium text-white truncate max-w-[120px]">Steam Баланс</td>
                    <td className="py-1.5 text-right tabular-nums text-white">1</td>
                    <td className="py-1.5 text-right tabular-nums text-[oklch(0.55_0_0)]">—</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium text-white truncate max-w-[120px]">UNVI VPN (VLESS)</td>
                    <td className="py-1.5 text-right tabular-nums text-white">1</td>
                    <td className="py-1.5 text-right tabular-nums text-[oklch(0.55_0_0)]">—</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium text-white truncate max-w-[120px]">VPS NVMe</td>
                    <td className="py-1.5 text-right tabular-nums text-white">1</td>
                    <td className="py-1.5 text-right tabular-nums text-[oklch(0.55_0_0)]">—</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium text-white truncate max-w-[120px]">UNVI Pro Ключ</td>
                    <td className="py-1.5 text-right tabular-nums text-white">1</td>
                    <td className="py-1.5 text-right tabular-nums text-[#009080] font-semibold">9</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Bottom Row: Топ промокодов + Продвинутая аналитика */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Топ промокодов */}
            <div className="p-4 rounded-xl bg-[oklch(0.155_0_0)] border border-[oklch(1_0_0/6%)] space-y-2">
              <div>
                <h3 className="text-sm font-bold text-white">Топ промокодов</h3>
                <p className="text-[11px] text-[oklch(0.6_0_0)]">По числу использований за всё время</p>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 font-mono">
                <span className="text-[#00e0cb] bg-[oklch(0.20_0_0)] px-2 py-0.5 rounded font-semibold">UNVI20</span>
                <span className="text-white">14 исп. · 86 ост.</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#00e0cb] bg-[oklch(0.20_0_0)] px-2 py-0.5 rounded font-semibold">BONUS250</span>
                <span className="text-white">7 исп. · 93 ост.</span>
              </div>
            </div>

            {/* Продвинутая аналитика */}
            <div className="p-4 rounded-xl bg-[oklch(0.155_0_0)] border border-[oklch(1_0_0/6%)] space-y-2">
              <div>
                <h3 className="text-sm font-bold text-white">Продвинутая аналитика</h3>
                <p className="text-[11px] text-[oklch(0.6_0_0)]">Только для владельца — доступ отдельным правом</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <div className="text-[10px] text-[oklch(0.5_0_0)]">До 1-й оплаты</div>
                  <div className="font-bold text-white">—</div>
                </div>
                <div>
                  <div className="text-[10px] text-[oklch(0.5_0_0)]">Churn (30 дн.)</div>
                  <div className="font-bold text-emerald-400">100.0%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[oklch(0.5_0_0)]">ROI</div>
                  <div className="text-[10px] text-[oklch(0.55_0_0)] truncate">CAC n/a</div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
