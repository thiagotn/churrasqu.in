'use client';

import { useMemo, useReducer } from 'react';
import {
  Adjustments,
  CalculationResult,
  CalculatorInput,
  TIER_IDS,
  TierId,
  calculate,
} from '@churrasquin/calculator';
import { initialState, reducer } from '../lib/state';
import { Header } from './header';
import { Stepper } from './stepper';
import { EditScreen } from './screens/edit';
import { SetupScreen } from './screens/setup';
import { TiersScreen } from './screens/tiers';
import { press } from './ui';

export function ChurrasApp() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { result, tierResults } = useMemo(() => {
    const input: CalculatorInput = {
      men: state.men,
      women: state.women,
      kids: state.kids,
      startTime: state.startTime,
      endTime: state.endTime,
      alcoholMode: state.alcoholMode,
      tier: state.tier,
    };
    const adjustments: Adjustments = { edits: state.edits, prices: state.prices };
    const tierResults = Object.fromEntries(
      TIER_IDS.map((tier) => [tier, calculate({ ...input, tier }, adjustments)]),
    ) as Record<TierId, CalculationResult>;
    return { result: tierResults[state.tier], tierResults };
  }, [state]);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-[clamp(16px,2.4vw,28px)] px-[clamp(12px,3vw,40px)] pb-20 pt-[clamp(14px,3vw,36px)]">
      <Header onReset={() => dispatch({ type: 'reset' })} />
      <Stepper screen={state.screen} maxStep={state.maxStep} onGo={(screen) => dispatch({ type: 'go', screen })} />

      {state.screen === 'setup' && <SetupScreen state={state} result={result} dispatch={dispatch} />}
      {state.screen === 'tiers' && (
        <TiersScreen state={state} result={result} tierResults={tierResults} dispatch={dispatch} />
      )}
      {state.screen === 'edit' && <EditScreen state={state} result={result} dispatch={dispatch} />}
      {state.screen === 'save-teaser' && (
        <section className="mx-auto flex max-w-[560px] flex-col items-start gap-4 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
          <h1 className="font-display text-[clamp(28px,4vw,40px)] tracking-wide text-ink">Quase lá!</h1>
          <p className="text-[15px] font-bold text-body-text">
            Salvar e compartilhar (conta, link público, QR Code e Pix) chegam nas próximas fatias — acompanhe em{' '}
            <code className="font-mono text-[13px]">docs/roadmap.md</code>. Sua lista continua aqui, do jeito que
            você deixou.
          </p>
          <button
            onClick={() => dispatch({ type: 'go', screen: 'edit' })}
            className={`rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[14px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
          >
            ← Voltar para a lista
          </button>
        </section>
      )}

      <footer className="mt-auto flex flex-wrap justify-between gap-2 border-t-[3px] border-[#17130F33] pt-4 text-[13px] font-bold text-muted">
        <span>churrasqu.in — ninguém paga a mais, ninguém passa fome</span>
        <span>Preços de referência — ajuste conforme seu mercado.</span>
      </footer>
    </div>
  );
}
