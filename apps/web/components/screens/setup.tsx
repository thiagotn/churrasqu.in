'use client';

import { AlcoholMode, CalculationResult } from '@churrasquin/calculator';
import { hoursLabel, kgLabel } from '../../lib/format';
import { Action, ChurrasState } from '../../lib/state';
import { FieldLabel, inputCls, press } from '../ui';

const ALCOHOL_OPTIONS: { id: AlcoholMode; title: string; hint: string }[] = [
  { id: 'lista', title: 'Entra no rateio', hint: 'Cerveja e afins na lista de compras' },
  { id: 'byob', title: 'Cada um leva a sua', hint: 'Fora do rateio — só gelo e cooler' },
  { id: 'bar', title: 'Compra no bar do local', hint: 'Consumação paga individualmente' },
  { id: 'none', title: 'Sem álcool', hint: 'Só sucos e refrigerante' },
];

const ALCOHOL_NOTE: Record<AlcoholMode, string> = {
  lista: 'Bebida alcoólica entra na lista e no rateio de todo mundo.',
  byob: 'Cada um leva a sua bebida — a lista cobre só gelo, refri e água.',
  bar: 'Consumação no bar é paga individualmente e fica fora do rateio.',
  none: 'Churras sem álcool: sucos e refrigerante na conta.',
};

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
    <div className="border-[3px] border-ink bg-cream p-3">
      <div className="text-[13px] font-black uppercase text-ink">{title}</div>
      <div className="my-2 flex items-center justify-between gap-2">
        <button
          aria-label={`menos ${title}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className={`h-11 w-11 rounded-xl border-[3px] border-ink bg-paper text-xl font-black text-ink shadow-comic-3 ${press}`}
        >
          −
        </button>
        <div className="font-display text-[42px] leading-none text-ink">{value}</div>
        <button
          aria-label={`mais ${title}`}
          onClick={() => onChange(value + 1)}
          className={`h-11 w-11 rounded-xl border-[3px] border-ink bg-ember text-xl font-black text-paper shadow-comic-3 hover:bg-ember-hover ${press}`}
        >
          +
        </button>
      </div>
      <div className="text-[12px] font-bold text-muted">{hint}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-[clamp(22px,3vw,28px)] tracking-wide text-ink">{children}</h2>;
}

export function SetupScreen({
  state,
  result,
  dispatch,
}: {
  state: ChurrasState;
  result: CalculationResult;
  dispatch: React.Dispatch<Action>;
}) {
  const patch = (p: Partial<ChurrasState>) => dispatch({ type: 'patch', patch: p });

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[clamp(16px,2.4vw,28px)]">
      {/* Formulário */}
      <section className="flex flex-col gap-6 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
        <div className="flex flex-col gap-3">
          <SectionTitle>1. Quem vai?</SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3">
            <PersonStepper title="Homens" hint="~420 g de carne" value={state.men} onChange={(v) => patch({ men: v })} />
            <PersonStepper title="Mulheres" hint="~320 g de carne" value={state.women} onChange={(v) => patch({ women: v })} />
            <PersonStepper title="Crianças" hint="~200 g de carne" value={state.kids} onChange={(v) => patch({ kids: v })} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SectionTitle>2. Onde vai ser?</SectionTitle>
          <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
            <FieldLabel>Endereço</FieldLabel>
            <input className={inputCls} value={state.eventAddress} onChange={(e) => patch({ eventAddress: e.target.value })} />
          </label>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3">
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Bairro</FieldLabel>
              <input className={inputCls} value={state.eventCity} onChange={(e) => patch({ eventCity: e.target.value })} />
            </label>
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Referência</FieldLabel>
              <input className={inputCls} value={state.eventHint} onChange={(e) => patch({ eventHint: e.target.value })} />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SectionTitle>3. Que dia e a que horas começa?</SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,120px),1fr))] gap-3">
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Data</FieldLabel>
              <input type="date" className={inputCls} value={state.eventDay} onChange={(e) => patch({ eventDay: e.target.value })} />
            </label>
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Começa</FieldLabel>
              <input type="time" className={inputCls} value={state.startTime} onChange={(e) => patch({ startTime: e.target.value })} />
            </label>
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Termina</FieldLabel>
              <input type="time" className={inputCls} value={state.endTime} onChange={(e) => patch({ endTime: e.target.value })} />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-[3px] border-dashed border-[#17130F66] bg-cream p-4">
          <SectionTitle>4. E a bebida alcoólica?</SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
            {ALCOHOL_OPTIONS.map((opt) => {
              const active = state.alcoholMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => patch({ alcoholMode: opt.id })}
                  className={`border-[3px] border-ink p-3 text-left shadow-comic-4 ${press} ${
                    active ? 'bg-brand-sky text-paper' : 'bg-paper text-ink hover:bg-mustard'
                  }`}
                >
                  <div className="text-[15px] font-black">{opt.title}</div>
                  <div className={`text-[12px] font-bold ${active ? 'text-paper/80' : 'text-muted'}`}>{opt.hint}</div>
                </button>
              );
            })}
          </div>
          {state.alcoholMode === 'bar' && (
            <label className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-body-text">
              Gasto médio no bar do local&nbsp;
              <span className="flex items-center gap-1">
                R$
                <input
                  inputMode="numeric"
                  className="h-[40px] w-[72px] border-[3px] border-ink bg-white text-center font-black text-ink outline-none"
                  value={state.barSpend}
                  onChange={(e) => patch({ barSpend: e.target.value.replace(/\D/g, '') })}
                />
                / adulto (fora do rateio)
              </span>
            </label>
          )}
        </div>

        <button
          onClick={() => dispatch({ type: 'go', screen: 'tiers' })}
          className={`border-4 border-ink bg-ember px-6 py-4 font-display text-[clamp(24px,3vw,32px)] tracking-wide text-paper shadow-comic-8 hover:bg-ember-hover hover:shadow-comic-5 ${press}`}
        >
          Calcular meu churras →
        </button>
      </section>

      {/* Coluna direita */}
      <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)]">
        <section className="border-4 border-ink bg-mustard p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
          <h2 className="font-display text-[clamp(22px,3vw,28px)] tracking-wide text-ink">Resumo rápido</h2>
          <dl className="mt-2 text-[15px] font-extrabold text-ink">
            {[
              ['Convidados', `${result.guests} pessoas (${result.adults} adultos)`],
              ['Carne estimada', `~${kgLabel(result.meatBaseKg)}`],
              ['Local', state.eventCity || 'a definir'],
              ['Horário', `${state.startTime} — ${state.endTime} (${hoursLabel(result.hours)})`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b-[3px] border-dotted border-[#17130F55] py-2 last:border-b-0">
                <dt>{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 border-[3px] border-ink bg-paper p-3 text-[14px] font-bold text-body-text">
            {ALCOHOL_NOTE[state.alcoholMode]}
          </div>
        </section>

        <section className="border-4 border-ink bg-paper shadow-comic-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/quintal.jpeg"
            alt="Quintal de churrasco"
            className="h-[clamp(180px,26vw,280px)] w-full border-b-4 border-ink object-cover"
          />
          <p className="p-4 text-[14px] font-bold text-body-text">
            A conta considera ~420 g de carne por homem, ~320 g por mulher e ~200 g por criança — e estica se o
            churras passar de 5 horas.
          </p>
        </section>
      </div>
    </div>
  );
}
