'use client';

import { press } from './ui';

export function Header({ userName, onReset }: { userName: string | null; onReset: () => void }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-[66px] w-[66px] shrink-0 rounded-full border-4 border-ink bg-cream p-[5px] shadow-comic-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="churrasqu.in" className="h-full w-full object-contain" />
        </div>
        <div>
          <div className="font-display text-[clamp(30px,5vw,44px)] leading-[0.92] tracking-wide text-ink">
            CHURRASQU<span className="text-ember">.IN</span>
          </div>
          <div className="text-[13px] font-bold uppercase tracking-[2px] text-muted">
            Ninguém paga a mais. Ninguém passa fome.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {userName && (
          <div className="flex items-center gap-2 rounded-full border-[3px] border-ink bg-paper py-1 pl-1 pr-4 shadow-comic-3">
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-brand-sky font-display text-[15px] text-paper">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="text-[14px] font-extrabold text-ink">{userName}</span>
          </div>
        )}
        <button
          onClick={onReset}
          className={`rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[14px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
        >
          Começar de novo
        </button>
      </div>
    </header>
  );
}
