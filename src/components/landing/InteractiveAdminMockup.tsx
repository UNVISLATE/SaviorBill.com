import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  Code2, 
  Settings, 
  Check, 
  TrendingUp, 
  Server, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function InteractiveAdminMockup() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'lua'>('dashboard');
  const [autoRenew, setAutoRenew] = useState(true);
  const [sandboxWorker, setSandboxWorker] = useState(true);
  const [currency, setCurrency] = useState<'RUB' | 'USD' | 'USDT'>('RUB');
  const [activePlan, setActivePlan] = useState<'1m' | '3m' | '1y'>('1m');

  return (
    <div className="relative w-full rounded-2xl bg-[oklch(0.18_0_0)] shadow-2xl overflow-hidden text-left select-none text-xs sm:text-sm">
      
      {/* Browser Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[oklch(0.14_0_0)] border-b border-[oklch(1_0_0/5%)]">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-red-500/80" />
          <div className="size-2.5 rounded-full bg-yellow-500/80" />
          <div className="size-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="px-4 py-0.5 rounded-md bg-[oklch(0.18_0_0)] text-[11px] font-mono text-[oklch(0.6_0_0)] truncate max-w-xs flex items-center gap-1.5">
          <span className="text-[#009080]">https://</span>
          <span>billing.saviorbill.com/admin/dashboard</span>
        </div>
        <div className="flex items-center gap-1.5 text-[oklch(0.5_0_0)]">
          <RefreshCw className="size-3" />
        </div>
      </div>

      {/* App Body (Sidebar + Content) with bottom/right gradient fade */}
      <div className="flex min-h-[380px] sm:min-h-[440px] relative">
        
        {/* Left Mini Sidebar */}
        <div className="w-44 sm:w-52 shrink-0 bg-[oklch(0.16_0_0)] p-3 space-y-1 border-r border-[oklch(1_0_0/4%)]">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.5_0_0)] font-semibold">
            SaviorBill Admin
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            type="button"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-[#009080] text-white' 
                : 'text-[oklch(0.7_0_0)] hover:text-white hover:bg-[oklch(0.20_0_0)]'
            }`}
          >
            <LayoutDashboard className="size-3.5" />
            <span>Дашборд</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            type="button"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'services' 
                ? 'bg-[#009080] text-white' 
                : 'text-[oklch(0.7_0_0)] hover:text-white hover:bg-[oklch(0.20_0_0)]'
            }`}
          >
            <Layers className="size-3.5" />
            <span>Каталог услуг</span>
          </button>

          <button
            onClick={() => setActiveTab('lua')}
            type="button"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'lua' 
                ? 'bg-[#009080] text-white' 
                : 'text-[oklch(0.7_0_0)] hover:text-white hover:bg-[oklch(0.20_0_0)]'
            }`}
          >
            <Code2 className="size-3.5" />
            <span>LuaWorker</span>
          </button>

          <div className="pt-4 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.5_0_0)] font-semibold">
            Настройки
          </div>

          <div className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[oklch(0.55_0_0)]">
            <CreditCard className="size-3.5" />
            <span>Провайдеры (3)</span>
          </div>
          <div className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[oklch(0.55_0_0)]">
            <Settings className="size-3.5" />
            <span>Безопасность</span>
          </div>
        </div>

        {/* Right Content Area (Interactive Preview) */}
        <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-hidden">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Top Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[oklch(0.21_0_0)] space-y-1">
                  <div className="text-[11px] font-mono text-[oklch(0.55_0_0)]">Оборот за 30 дней</div>
                  <div className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                    <span>{currency === 'RUB' ? '418,290 ₽' : currency === 'USD' ? '$4,520' : '4,520 USDT'}</span>
                    <TrendingUp className="size-3.5 text-emerald-400" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[oklch(0.21_0_0)] space-y-1">
                  <div className="text-[11px] font-mono text-[oklch(0.55_0_0)]">Активных подписок</div>
                  <div className="text-base sm:text-lg font-bold text-[#009080]">
                    1,284
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-[oklch(0.21_0_0)] space-y-1">
                  <div className="text-[11px] font-mono text-[oklch(0.55_0_0)]">Комиссия SaviorBill</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400">
                    0.00% (Self-Hosted)
                  </div>
                </div>
              </div>

              {/* Interactive Controls & Toggles */}
              <div className="p-4 rounded-xl bg-[oklch(0.21_0_0)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[oklch(1_0_0/5%)]">
                  <span className="text-xs font-semibold text-white">Статус служб и демо-переключатели</span>
                  <div className="flex gap-1">
                    {(['RUB', 'USD', 'USDT'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        type="button"
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                          currency === c ? 'bg-[#009080] text-white' : 'text-[oklch(0.6_0_0)] hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Server className="size-3.5 text-[#009080]" />
                      <span className="text-[oklch(0.85_0_0)]">Изолированный LuaWorker Sandbox</span>
                    </div>
                    <button
                      onClick={() => setSandboxWorker(!sandboxWorker)}
                      type="button"
                      className={`relative w-8 h-4.5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                        sandboxWorker ? 'bg-[#009080]' : 'bg-[oklch(0.3_0_0)]'
                      }`}
                    >
                      <div className={`size-3.5 rounded-full bg-white transition-transform ${
                        sandboxWorker ? 'translate-x-3.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-3.5 text-emerald-400" />
                      <span className="text-[oklch(0.85_0_0)]">Автоматическое продление тарифов</span>
                    </div>
                    <button
                      onClick={() => setAutoRenew(!autoRenew)}
                      type="button"
                      className={`relative w-8 h-4.5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                        autoRenew ? 'bg-[#009080]' : 'bg-[oklch(0.3_0_0)]'
                      }`}
                    >
                      <div className={`size-3.5 rounded-full bg-white transition-transform ${
                        autoRenew ? 'translate-x-3.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[oklch(0.21_0_0)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">WireGuard Premium VPN</div>
                  <div className="text-[11px] text-[oklch(0.6_0_0)]">Модель: tiered · Выдача через LuaWorker</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">Active</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[oklch(0.21_0_0)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">NVMe VDS Конфигуратор</div>
                  <div className="text-[11px] text-[oklch(0.6_0_0)]">Модель: configurable · CPU, RAM, NVMe</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">Active</span>
              </div>
            </div>
          )}

          {activeTab === 'lua' && (
            <div className="p-3.5 rounded-xl bg-[oklch(0.12_0_0)] font-mono text-[11px] text-[oklch(0.85_0_0)] space-y-1">
              <span className="text-[#009080]">function</span> handle(ctx)<br />
              &nbsp;&nbsp;<span className="text-[#009080]">if</span> ctx.action == <span className="text-emerald-400">"create"</span> <span className="text-[#009080]">then</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#009080]">return</span> &#123; state = <span className="text-emerald-400">"active"</span>, user = ctx.user.login &#125;<br />
              &nbsp;&nbsp;<span className="text-[#009080]">end</span><br />
              <span className="text-[#009080]">end</span>
            </div>
          )}

        </div>

        {/* Soft Right & Bottom Fade Gradient Mask */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[oklch(0.18_0_0)] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[oklch(0.18_0_0)] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
