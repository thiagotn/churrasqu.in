'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import {
  Adjustments,
  CalculationResult,
  CalculatorInput,
  TIER_IDS,
  TierId,
  calculate,
} from '@churrasquin/calculator';
import { ApiError, api, session } from '../lib/api';
import { money } from '../lib/format';
import { initialState, reducer } from '../lib/state';
import { Header } from './header';
import { Stepper } from './stepper';
import { AuthScreen } from './screens/auth';
import { EditScreen } from './screens/edit';
import { SetupScreen } from './screens/setup';
import { TiersScreen } from './screens/tiers';
import { press } from './ui';

interface SavedBarbecue {
  id: string;
  slug: string;
}

export function ChurrasApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const current = session.get();
    if (current) dispatch({ type: 'patch', patch: { loggedIn: true, userName: current.name } });
  }, []);

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

  const saveBarbecue = async (token: string) => {
    setSaving(true);
    setSaveError('');
    const body = {
      men: state.men,
      women: state.women,
      kids: state.kids,
      startTime: state.startTime,
      endTime: state.endTime,
      alcoholMode: state.alcoholMode,
      tier: state.tier,
      adjustments: { edits: state.edits, prices: state.prices },
      eventName: state.eventName,
      eventDay: state.eventDay,
      eventAddress: state.eventAddress,
      eventCity: state.eventCity,
      eventHint: state.eventHint,
    };
    try {
      const saved = state.savedId
        ? await api<SavedBarbecue>(`/barbecues/${state.savedId}`, { method: 'PATCH', body, token })
        : await api<SavedBarbecue>('/barbecues', { method: 'POST', body, token });
      dispatch({ type: 'patch', patch: { savedId: saved.id, savedSlug: saved.slug } });
      dispatch({ type: 'go', screen: 'saved' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        session.clear();
        dispatch({ type: 'patch', patch: { loggedIn: false, userName: '' } });
        dispatch({ type: 'go', screen: 'auth' });
      } else {
        setSaveError(err instanceof ApiError ? err.message : 'Sem conexão com a API — ela está de pé? (npm run dev:api)');
      }
    } finally {
      setSaving(false);
    }
  };

  const onSaveClick = () => {
    const current = session.get();
    if (current) void saveBarbecue(current.token);
    else dispatch({ type: 'go', screen: 'auth' });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://churrasqu.in/c/${state.savedSlug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard bloqueado */
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-[clamp(16px,2.4vw,28px)] px-[clamp(12px,3vw,40px)] pb-20 pt-[clamp(14px,3vw,36px)]">
      <Header userName={state.loggedIn ? state.userName : null} onReset={() => dispatch({ type: 'reset' })} />
      <Stepper screen={state.screen} maxStep={state.maxStep} onGo={(screen) => dispatch({ type: 'go', screen })} />

      {saveError && (
        <p className="border-[3px] border-ember bg-paper p-3 text-[13px] font-black text-ember">{saveError}</p>
      )}

      {state.screen === 'setup' && <SetupScreen state={state} result={result} dispatch={dispatch} />}
      {state.screen === 'tiers' && (
        <TiersScreen state={state} result={result} tierResults={tierResults} dispatch={dispatch} />
      )}
      {state.screen === 'edit' && (
        <EditScreen state={state} result={result} dispatch={dispatch} onSave={onSaveClick} saving={saving} />
      )}
      {state.screen === 'auth' && (
        <AuthScreen
          onAuthed={(name, token) => {
            dispatch({ type: 'patch', patch: { loggedIn: true, userName: name } });
            void saveBarbecue(token);
          }}
          onBack={() => dispatch({ type: 'go', screen: 'edit' })}
        />
      )}
      {state.screen === 'saved' && (
        <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)]">
          <section className="border-4 border-ink bg-mustard p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
            <h1 className="font-display text-[clamp(30px,5vw,44px)] tracking-wide text-ink">
              Churras salvo! Agora é só espalhar.
            </h1>
            <p className="text-[15px] font-extrabold text-ink">
              Total {money(result.total)} · {money(result.perAdult)} por adulto · {result.guests} convidados
            </p>
          </section>
          <section className="flex max-w-[560px] flex-col gap-3 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
            <div className="text-[12px] font-black uppercase tracking-[1.5px] text-muted">Link público</div>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap border-[3px] border-ink bg-cream p-3 font-mono text-[14px] font-bold text-ink">
              churrasqu.in/c/{state.savedSlug}
            </div>
            <button
              onClick={copyLink}
              className={`border-[3px] border-ink bg-ember px-4 py-3 text-[15px] font-black text-paper shadow-comic-4 hover:bg-ember-hover ${press}`}
            >
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <p className="text-[13px] font-bold text-muted">
              A página pública, o QR Code e o Pix chegam nas fatias 4 e 5 —{' '}
              <code className="font-mono">docs/roadmap.md</code>. Editar a lista e salvar de novo atualiza este
              mesmo link.
            </p>
            <button
              onClick={() => dispatch({ type: 'go', screen: 'edit' })}
              className={`self-start rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[14px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
            >
              ← Voltar para a lista
            </button>
          </section>
        </div>
      )}

      <footer className="mt-auto flex flex-wrap justify-between gap-2 border-t-[3px] border-[#17130F33] pt-4 text-[13px] font-bold text-muted">
        <span>churrasqu.in — ninguém paga a mais, ninguém passa fome</span>
        <span>Preços de referência — ajuste conforme seu mercado.</span>
      </footer>
    </div>
  );
}
