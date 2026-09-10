'use client';

import { useState } from 'react';
import { CalculationResult, TIERS, TIER_IDS, TierId, TierSeed } from '@churrasquin/calculator';
import { kgLabel, money, moneyRound } from '../../lib/format';
import { Action, ChurrasState } from '../../lib/state';
import { press } from '../ui';

function TierCard({
  seed,
  tierResult,
  active,
  dispatch,
}: {
  seed: TierSeed;
  tierResult: CalculationResult;
  active: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <section
      className={`flex flex-col gap-3 border-4 border-ink p-[clamp(18px,2.5vw,30px)] shadow-comic-10 ${
        active ? 'bg-mustard' : 'bg-paper'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[clamp(30px,4vw,40px)] leading-none tracking-wide text-ink">
            {seed.name}
          </span>
          <span className="font-display text-[clamp(22px,3vw,30px)] leading-none text-ember">
            {seed.priceLabel}
          </span>
        </div>
        <span
          className={`border-[3px] border-ink px-2 py-1 text-[11px] font-black uppercase text-paper ${
            active ? 'bg-ink' : 'bg-ember'
          }`}
        >
          {seed.badge}
        </span>
      </div>

      <p className="min-h-[46px] text-[14px] font-bold text-body-text">{seed.pitch}</p>

      <div className="border-[3px] border-ink bg-paper p-3">
        <div className="text-[12px] font-black uppercase tracking-[1.5px] text-muted">Total estimado</div>
        <div className="font-display text-[clamp(34px,4.6vw,46px)] leading-none text-ink">
          {money(tierResult.total)}
        </div>
        <div className="text-[14px] font-black text-ember">{money(tierResult.perAdult)} por adulto</div>
      </div>

      <ul className="flex flex-col gap-1 text-[14px] font-bold text-ink">
        {[
          ...seed.cuts.map((c) => c.name),
          `${seed.sides.length} acompanhamentos`,
          seed.charcoal.name,
        ].map((highlight) => (
          <li key={highlight} className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] shrink-0 rounded-full border-2 border-ink bg-ember" />
            {highlight}
          </li>
        ))}
      </ul>

      <button
        onClick={() => dispatch({ type: 'chooseTier', tier: seed.id })}
        className={`mt-auto border-[3px] border-ink px-4 py-3 font-display text-[22px] tracking-wide shadow-comic-5 ${press} ${
          active ? 'bg-ink text-paper' : 'bg-ember text-paper hover:bg-ember-hover'
        }`}
      >
        {active ? 'Editar esta lista →' : `Escolher ${seed.name}`}
      </button>
    </section>
  );
}

export function TiersScreen({
  state,
  result,
  tierResults,
  dispatch,
}: {
  state: ChurrasState;
  result: CalculationResult;
  tierResults: Record<TierId, CalculationResult>;
  dispatch: React.Dispatch<Action>;
}) {
  // Aba em foco no mobile (escolher mesmo é no CTA do card)
  const [preview, setPreview] = useState<TierId>(state.tier);

  return (
    <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(32px,5vw,48px)] tracking-wide text-ink">
            Escolha o padrão do churras
          </h1>
          <p className="text-[15px] font-extrabold text-muted">
            {result.guests} convidados · {kgLabel(result.meatBaseKg)} de carne · {state.eventCity}
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'go', screen: 'setup' })}
          className={`rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[14px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
        >
          ← Ajustar pessoas
        </button>
      </div>

      {/* Mobile: abas com o preço no rótulo (comparação sempre visível) + um card por vez */}
      <div className="md:hidden">
        <div className="sticky top-2 z-10 grid grid-cols-3 gap-1.5 border-[3px] border-ink bg-paper p-1.5 shadow-comic-4">
          {TIER_IDS.map((tierId) => {
            const selected = preview === tierId;
            return (
              <button
                key={tierId}
                aria-pressed={selected}
                onClick={() => setPreview(tierId)}
                className={`flex flex-col items-center gap-0.5 px-1 py-2 ${
                  selected ? 'bg-ink text-paper' : 'bg-paper text-ink'
                }`}
              >
                <span className="font-display text-[16px] leading-none tracking-wide">
                  {TIERS[tierId].name}
                </span>
                <span className={`text-[12px] font-black ${selected ? 'text-mustard' : 'text-ember'}`}>
                  {moneyRound(tierResults[tierId].total)}
                </span>
              </button>
            );
          })}
        </div>
        <div key={preview} className="step-enter mt-4">
          <TierCard
            seed={TIERS[preview]}
            tierResult={tierResults[preview]}
            active={state.tier === preview}
            dispatch={dispatch}
          />
        </div>
      </div>

      {/* Desktop: comparação lado a lado */}
      <div className="hidden grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-[clamp(16px,2.4vw,28px)] md:grid">
        {TIER_IDS.map((tierId) => (
          <TierCard
            key={tierId}
            seed={TIERS[tierId]}
            tierResult={tierResults[tierId]}
            active={state.tier === tierId}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  );
}
