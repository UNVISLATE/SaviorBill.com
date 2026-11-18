import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface Props {
  command?: string;
  copiedText?: string;
}

export default function TerminalBlock({
  command = 'curl -fsSL https://get.saviorbill.com | bash',
  copiedText = 'Скопировано в буфер'
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
    <div className="w-full max-w-2xl mx-auto rounded-xl bg-[oklch(0.18_0_0)] p-3 sm:p-4 text-left shadow-2xl transition-all">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[oklch(1_0_0/6%)]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="text-[11px] font-mono text-[oklch(0.55_0_0)] ml-2 flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-[#009080]" />
            bash / quick-deploy
          </span>
        </div>
        <div className="text-[11px] font-mono text-[oklch(0.55_0_0)]">
          get.saviorbill.com
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 font-mono text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-[oklch(0.95_0_0)] overflow-x-auto py-1 scrollbar-none">
          <span className="text-[#009080] select-none font-bold">$</span>
          <span className="select-all tracking-wide">{command}</span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.24_0_0)] hover:bg-[#009080] hover:text-white text-[oklch(0.85_0_0)] text-xs font-medium transition-all shrink-0 cursor-pointer active:scale-95"
          title="Копировать команду"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-sans">{copiedText}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
