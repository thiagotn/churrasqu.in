'use client';

import { useEffect, useRef } from 'react';
import { CalculationResult, Catalog, TIER_IDS, TierId, TierSeed } from '@churrasquin/calculator';
import { kgLabel, money, moneyRound } from '../../lib/format';
import { Action, ChurrasState } from '../../lib/state';
import { press } from '../ui';

// Passo 1 em tela única: pessoas → "Próximo" → pessoas viram uma linha editável e o tipo de churrasco aparece.

const PEOPLE: { key: 'men' | 'women' | 'kids'; title: string; hint: string; one: string; many: string }[] = [
  { key: 'men', title: 'Homens', hint: '~420 g de carne', one: 'homem', many: 'homens' },
  { key: 'women', title: 'Mulheres', hint: '~320 g de carne', one: 'mulher', many: 'mulheres' },
  { key: 'kids', title: 'Crianças', hint: '~200 g de carne', one: 'criança', many: 'crianças' },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[22px] w-[22px] shrink-0">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

/** Mobile: linha (nome + dica à esquerda, controles à direita). Desktop (md+): cartão como antes. */
function PersonStepper({
  title,
  hint,
  value,
  onChange,
}: {
  title: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b-[3px] border-dotted border-[#17130F33] py-2.5 last:border-b-0 md:grid-cols-1 md:border-[3px] md:border-solid md:border-ink md:bg-cream md:p-3 md:last:border-b-[3px]">
      <div className="col-start-1 row-start-1 text-[15px] font-black uppercase text-ink md:text-[13px]">{title}</div>
      <div className="col-start-2 row-span-2 row-start-1 flex items-center gap-2.5 md:col-start-1 md:row-span-1 md:row-start-2 md:my-2 md:justify-between md:gap-2">
        <button
          aria-label={`menos ${title}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className={`h-11 w-11 rounded-xl border-[3px] border-ink bg-paper text-xl font-black text-ink shadow-comic-3 ${press}`}
        >
          −
        </button>
        <div className="w-10 text-center font-display text-[36px] leading-none text-ink md:w-auto md:text-[42px]">{value}</div>
        <button
          aria-label={`mais ${title}`}
          onClick={() => onChange(value + 1)}
          className={`h-11 w-11 rounded-xl border-[3px] border-ink bg-ember text-xl font-black text-paper shadow-comic-3 hover:bg-ember-hover ${press}`}
        >
          +
        </button>
      </div>
      <div className="col-start-1 row-start-2 text-[12px] font-bold text-muted md:row-start-3">{hint}</div>
    </div>
  );
}

const cutsSummary = (seed: TierSeed): string => {
  const names = seed.cuts.map((c) => c.name);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}` : names.join('');
};

/** Mobile: cartão compacto inteiro clicável (tocar = ver os itens). */
function TierOption({ seed, total, onChoose }: { seed: TierSeed; total: number; onChoose: () => void }) {
  return (
    <button
      onClick={onChoose}
      className={`flex w-full items-center gap-3 border-[3px] border-ink bg-paper p-3.5 text-left shadow-comic-5 hover:bg-cream ${press}`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-[28px] leading-none tracking-wide text-ink">{seed.name}</span>
          <span className="font-display text-[22px] leading-none text-ember">{seed.priceLabel}</span>
          <span className="border-2 border-ink bg-mustard px-1.5 py-0.5 text-[10px] font-black uppercase text-ink">{seed.badge}</span>
        </span>
        <span className="line-clamp-2 text-[13px] font-bold text-body-text">{cutsSummary(seed)}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-[1.5px] text-muted">Total estimado</span>
          <span className="font-display text-[24px] leading-none text-ink">{moneyRound(total)}</span>
        </span>
      </span>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-ember text-paper shadow-comic-3">
        <ArrowIcon />
      </span>
    </button>
  );
}

/** Desktop: o cartão de padrão de antes, com o CTA "Ver itens do …". */
function TierCard({ seed, total, onChoose }: { seed: TierSeed; total: number; onChoose: () => void }) {
  return (
    <section className="flex flex-col gap-3 border-4 border-ink bg-paper p-[clamp(18px,2.2vw,26px)] shadow-comic-10">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[clamp(30px,3.4vw,38px)] leading-none tracking-wide text-ink">{seed.name}</span>
          <span className="font-display text-[clamp(22px,2.6vw,28px)] leading-none text-ember">{seed.priceLabel}</span>
        </div>
        <span className="border-[3px] border-ink bg-ember px-2 py-1 text-[11px] font-black uppercase text-paper">{seed.badge}</span>
      </div>

      <p className="min-h-[40px] text-[14px] font-bold text-body-text">{seed.pitch}</p>

      <div className="border-[3px] border-ink bg-cream p-3">
        <div className="text-[12px] font-black uppercase tracking-[1.5px] text-muted">Total estimado</div>
        <div className="font-display text-[clamp(34px,3.8vw,42px)] leading-none text-ink">{money(total)}</div>
      </div>

      <ul className="flex flex-col gap-1 text-[14px] font-bold text-ink">
        {[...seed.cuts.map((c) => c.name), `${seed.sides.length} acompanhamentos`, seed.charcoal.name].map((highlight) => (
          <li key={highlight} className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] shrink-0 rounded-full border-2 border-ink bg-ember" />
            {highlight}
          </li>
        ))}
      </ul>

      <button
        onClick={onChoose}
        className={`mt-auto flex items-center justify-center gap-2.5 border-[3px] border-ink bg-ember px-4 py-3 font-display text-[22px] tracking-wide text-paper shadow-comic-5 hover:bg-ember-hover ${press}`}
      >
        Ver itens do {seed.name}
        <ArrowIcon />
      </button>
    </section>
  );
}

export function SetupScreen({
  state,
  result,
  tierResults,
  catalog,
  dispatch,
}: {
  state: ChurrasState;
  result: CalculationResult;
  tierResults: Record<TierId, CalculationResult>;
  catalog: Catalog;
  dispatch: React.Dispatch<Action>;
}) {
  const patch = (p: Partial<ChurrasState>) => dispatch({ type: 'patch', patch: p });
  const choose = (tier: TierId) => dispatch({ type: 'chooseTier', tier });
  const hasAdult = state.men + state.women > 0;
  const tiersRef = useRef<HTMLHeadingElement>(null);
  const confirmedOnce = useRef(state.peopleConfirmed);

  // Depois do "Próximo", o foco vai para os tipos (leitor de tela anuncia o que apareceu)
  useEffect(() => {
    if (state.peopleConfirmed && !confirmedOnce.current) tiersRef.current?.focus();
    confirmedOnce.current = state.peopleConfirmed;
  }, [state.peopleConfirmed]);

  const peopleLabel = PEOPLE.filter((p) => state[p.key] > 0)
    .map((p) => `${state[p.key]} ${state[p.key] === 1 ? p.one : p.many}`)
    .join(' · ');
  const meatLine = `${result.guests} ${result.guests === 1 ? 'pessoa' : 'pessoas'} · ~${kgLabel(result.meatBaseKg)} de carne`;

  if (!state.peopleConfirmed) {
    return (
      <section className="flex flex-col gap-1 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10 md:gap-5">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-7">
          <div className="flex items-baseline justify-between gap-2 md:min-w-[220px] md:flex-col md:items-start md:gap-1">
            <h1 className="font-display text-[clamp(22px,3vw,28px)] tracking-wide text-ink">Quem vai?</h1>
            <span className="text-[13px] font-extrabold text-muted md:text-[14px]">{meatLine}</span>
          </div>
          <div className="flex flex-col md:grid md:flex-1 md:grid-cols-3 md:gap-3">
            {PEOPLE.map((p) => (
              <PersonStepper
                key={p.key}
                title={p.title}
                hint={p.hint}
                value={state[p.key]}
                onChange={(v) => patch({ [p.key]: v })}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-col items-stretch gap-2 md:mt-0 md:items-end">
          {!hasAdult && (
            <p className="text-[13px] font-black text-ember">O churras precisa de pelo menos 1 adulto.</p>
          )}
          <button
            disabled={!hasAdult}
            onClick={() => patch({ peopleConfirmed: true })}
            className={`border-4 border-ink bg-ember px-6 py-4 font-display text-[clamp(24px,3vw,28px)] tracking-wide text-paper shadow-comic-8 hover:bg-ember-hover hover:shadow-comic-5 disabled:opacity-50 ${press}`}
          >
            Próximo →
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)]">
      <section className="flex items-center gap-3 border-4 border-ink bg-paper px-[clamp(18px,2.5vw,30px)] py-[clamp(14px,1.8vw,20px)] shadow-comic-10">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[11px] font-black uppercase tracking-[1.5px] text-muted">Quem vai</span>
          <span className="text-[16px] font-black text-ink md:text-[20px]">{peopleLabel}</span>
          <span className="text-[13px] font-bold text-muted">{meatLine}</span>
        </div>
        <button
          aria-label="Editar pessoas"
          onClick={() => patch({ peopleConfirmed: false })}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-mustard text-ink shadow-comic-3 md:h-auto md:w-auto md:gap-2 md:px-4 md:py-2 ${press}`}
        >
          <PencilIcon />
          <span className="hidden text-[14px] font-black md:inline">Editar pessoas</span>
        </button>
      </section>

      {/* Mobile: tipos compactos dentro de um cartão */}
      <section className="flex flex-col gap-3.5 border-4 border-ink bg-paper p-[18px] shadow-comic-10 md:hidden">
        <div>
          <h2 ref={tiersRef} tabIndex={-1} className="font-display text-[22px] tracking-wide text-ink outline-none">
            Tipo de churrasco
          </h2>
          <p className="text-[13px] font-bold text-muted">Toque num tipo para ver os itens e quantidades.</p>
        </div>
        {TIER_IDS.map((id) => (
          <TierOption key={id} seed={catalog[id]} total={tierResults[id].total} onChoose={() => choose(id)} />
        ))}
      </section>

      {/* Desktop: os três tipos lado a lado */}
      <div className="hidden flex-col gap-4 md:flex">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-[36px] tracking-wide text-ink">Tipo de churrasco</h2>
          <span className="text-[14px] font-bold text-muted">Preços de referência — o orçamento do açougue traz o valor real.</span>
        </div>
        <div className="grid grid-cols-3 gap-[clamp(16px,2.4vw,28px)]">
          {TIER_IDS.map((id) => (
            <TierCard key={id} seed={catalog[id]} total={tierResults[id].total} onChoose={() => choose(id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
