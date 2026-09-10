'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Adjustments,
  CalculationResult,
  CalculatorInput,
  Catalog,
  TIERS,
  TIER_IDS,
  TierId,
  TierSeed,
  adjustmentsFromSnapshot,
  calculate,
} from '@churrasquin/calculator';
import { ApiError, api, session } from '../lib/api';
import { STEP_OF_SCREEN, Screen, initialState, reducer } from '../lib/state';
import { Header } from './header';
import { Stepper } from './stepper';
import { AuthScreen } from './screens/auth';
import { EditScreen } from './screens/edit';
import { SetupScreen } from './screens/setup';
import { ShareScreen } from './screens/share';
import { TiersScreen } from './screens/tiers';

interface SavedBarbecue {
  id: string;
  slug: string;
}

// Passos do wizard viram hashes na URL: histórico nativo do browser (o voltar do
// celular volta um passo) sem tocar no history.state interno do App Router do Next.
const HASH_OF: Record<Screen, string> = {
  setup: 'convidados',
  tiers: 'padrao',
  edit: 'lista',
  auth: 'conta',
  saved: 'compartilhar',
};
const SCREEN_OF: Record<string, Screen> = Object.fromEntries(
  (Object.entries(HASH_OF) as [Screen, string][]).map(([screen, hash]) => [hash, screen]),
);

export function ChurrasApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  // Catálogo de runtime: começa com o seed do pacote (primeira render instantânea)
  // e troca em silêncio pelos preços do banco quando a API responde (ADR 0006).
  const [catalog, setCatalog] = useState<Catalog>(TIERS);

  useEffect(() => {
    api<TierSeed[]>('/catalog/tiers')
      .then((tiers) => {
        const record = Object.fromEntries(tiers.map((t) => [t.id, t])) as Catalog;
        if (TIER_IDS.every((id) => record[id])) setCatalog(record);
      })
      .catch(() => {
        /* API fora do ar: segue com o seed do pacote */
      });
  }, []);

  const stepRef = useRef<HTMLElement>(null);
  const prevScreen = useRef(state.screen);
  const cameFromHistory = useRef(false);
  const maxStepRef = useRef(state.maxStep);
  maxStepRef.current = state.maxStep;

  useEffect(() => {
    const current = session.get();
    if (current) dispatch({ type: 'patch', patch: { loggedIn: true, userName: current.name } });
  }, []);

  // "Editar lista" no painel /meus: reconstrói o wizard a partir do snapshot salvo
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('churrasquin.resume');
      if (!raw) return;
      sessionStorage.removeItem('churrasquin.resume');
      const saved = JSON.parse(raw);
      const input: CalculatorInput = {
        men: saved.men,
        women: saved.women,
        kids: saved.kids,
        startTime: saved.startTime,
        endTime: saved.endTime,
        alcoholMode: saved.alcoholMode,
        tier: saved.tier,
      };
      const adjustments = adjustmentsFromSnapshot(
        input,
        (saved.items ?? []).map((i: { itemId: string; qty: number; unitPrice: number }) => ({
          itemId: i.itemId,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
      );
      dispatch({
        type: 'patch',
        patch: {
          ...input,
          eventName: saved.eventName,
          eventDay: saved.eventDay,
          eventAddress: saved.eventAddress,
          eventCity: saved.eventCity,
          eventHint: saved.eventHint ?? '',
          pixType: saved.pixType ?? 'Celular',
          pixKey: saved.pixKey ?? '',
          edits: adjustments.edits ?? {},
          prices: adjustments.prices ?? {},
          savedId: saved.id,
          savedSlug: saved.slug,
          screen: 'edit',
          maxStep: 4,
        },
      });
    } catch {
      /* payload inválido: segue no fluxo normal */
    }
  }, []);

  // Botão voltar do celular navega entre os passos em vez de sair do site.
  useEffect(() => {
    // o reset de rolagem é nosso; sem isso o browser restaura o scroll antigo no voltar
    window.history.scrollRestoration = 'manual';
    // deep-link com hash cai no começo do wizard (o estado do churras é local)
    window.history.replaceState(window.history.state, '', `#${HASH_OF.setup}`);
    const onHash = () => {
      const target = SCREEN_OF[window.location.hash.slice(1)];
      if (!target || target === prevScreen.current) return;
      // não deixa o hash pular além do progresso alcançado
      if (STEP_OF_SCREEN[target] > maxStepRef.current) return;
      cameFromHistory.current = true;
      dispatch({ type: 'patch', patch: { screen: target } });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Wizard mobile: cada troca de passo abre no TOPO (a SPA preservava a rolagem do
  // passo anterior — clicar o CTA no fim do formulário abria o meio da tela seguinte)
  // e recebe foco para leitores de tela anunciarem o passo novo.
  useEffect(() => {
    if (prevScreen.current === state.screen) return;
    prevScreen.current = state.screen;
    if (cameFromHistory.current) cameFromHistory.current = false;
    else window.location.hash = HASH_OF[state.screen];
    window.scrollTo(0, 0);
    stepRef.current?.focus({ preventScroll: true });
  }, [state.screen]);

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
      TIER_IDS.map((tier) => [tier, calculate({ ...input, tier }, adjustments, catalog)]),
    ) as Record<TierId, CalculationResult>;
    return { result: tierResults[state.tier], tierResults };
  }, [state, catalog]);

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
      pixType: state.pixType,
      pixKey: state.pixKey || undefined,
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

  return (
    <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-[clamp(16px,2.4vw,28px)] px-[clamp(12px,3vw,40px)] pb-20 pt-[clamp(14px,3vw,36px)]">
      <Header userName={state.loggedIn ? state.userName : null} onReset={() => dispatch({ type: 'reset' })} />
      <Stepper screen={state.screen} maxStep={state.maxStep} onGo={(screen) => dispatch({ type: 'go', screen })} />

      {saveError && (
        <p className="border-[3px] border-ember bg-paper p-3 text-[13px] font-black text-ember">{saveError}</p>
      )}

      {/* key remonta o passo (animação de entrada); tabIndex -1 permite o foco programático */}
      <main key={state.screen} ref={stepRef} tabIndex={-1} className="step-enter outline-none">
      {state.screen === 'setup' && <SetupScreen state={state} result={result} dispatch={dispatch} />}
      {state.screen === 'tiers' && (
        <TiersScreen state={state} result={result} tierResults={tierResults} catalog={catalog} dispatch={dispatch} />
      )}
      {state.screen === 'edit' && (
        <EditScreen state={state} result={result} catalog={catalog} dispatch={dispatch} onSave={onSaveClick} saving={saving} />
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
        <ShareScreen state={state} result={result} dispatch={dispatch} onUpdate={onSaveClick} saving={saving} />
      )}
      </main>

      <footer className="mt-auto flex flex-wrap justify-between gap-2 border-t-[3px] border-[#17130F33] pt-4 text-[13px] font-bold text-muted">
        <span>churrasqu.in — ninguém paga a mais, ninguém passa fome</span>
        <span>Preços de referência — ajuste conforme seu mercado.</span>
      </footer>
    </div>
  );
}
