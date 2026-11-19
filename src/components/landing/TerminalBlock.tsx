import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface Props {
  command?: string;
  copiedText?: string;
}

export default function TerminalBlock({
  command = 'curl -fsSL https://get.saviorbill.com | bash',
  copiedText = 'Скопировано!'
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl bg-[oklch(0.18_0_0)] p-3 sm:p-4 text-left shadow-2xl transition-all overflow-hidden">
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-2.5 sm:mb-3 border-b border-[oklch(1_0_0/6%)] gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-[oklch(0.55_0_0)] ml-1 sm:ml-2 flex items-center gap-1.5 truncate">
            <Terminal className="w-3 h-3 text-[#009080] shrink-0" />
            <span className="truncate">bash / quick-deploy</span>
          </span>
        </div>
        <div className="text-[10px] sm:text-[11px] font-mono text-[oklch(0.55_0_0)] shrink-0">
          get.saviorbill.com
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-3 font-mono text-xs sm:text-sm min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[oklch(0.95_0_0)] whitespace-nowrap min-w-0 flex-1 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[#009080] select-none font-bold shrink-0">$</span>
          <span className="select-all tracking-wide whitespace-nowrap text-[11px] sm:text-sm">{command}</span>
        </div>

        {/* Fixed-width button: Prevents ANY layout reflow or wrapping when toggling 'Copy' <-> 'Скопировано!' */}
        <button
          onClick={handleCopy}
          type="button"
          className={`flex items-center justify-center gap-1 sm:gap-1.5 w-24 sm:w-32 h-8 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer active:scale-95 select-none ${
            copied
              ? 'bg-[#009080] text-white shadow-xs'
              : 'bg-[oklch(0.24_0_0)] hover:bg-[#009080] hover:text-white text-[oklch(0.85_0_0)]'
          }`}
          title="Копировать команду"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="text-white font-sans truncate text-[11px] sm:text-xs">{copiedText}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 shrink-0" />
              <span className="font-sans text-[11px] sm:text-xs">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
