'use client';

import { FormEvent, useState } from 'react';
import { CalculationResult } from '@churrasquin/calculator';
import { ApiError, api } from '../../lib/api';
import { Action, ChurrasState } from '../../lib/state';
import { EventFields } from '../event-fields';
import { ListSummary } from '../list-summary';
import { FieldLabel, inputCls, press } from '../ui';

/** '11988881234' → '(11) 98888-1234' enquanto digita */
export const maskPhone = (raw: string): string => {
  const d = raw.replace(/\D/g, '').replace(/^55(?=\d{11})/, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const isMobile = (raw: string): boolean => /^[1-9][1-9]9\d{8}$/.test(raw.replace(/\D/g, ''));

export function QuoteScreen({
  state,
  result,
  tierName,
  dispatch,
}: {
  state: ChurrasState;
  result: CalculationResult;
  tierName: string;
  dispatch: React.Dispatch<Action>;
}) {
  const patch = (p: Partial<ChurrasState>) => dispatch({ type: 'patch', patch: p });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isMobile(state.whatsapp)) {
      setError('Informe um celular com DDD — é por ele que os açougues vão falar com você.');
      return;
    }
    if (!consent) {
      setError('Marque que aceita o contato pelo WhatsApp para receber os orçamentos.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await api<{ id: string }>('/quote-requests', {
        method: 'POST',
        body: {
          men: state.men,
          women: state.women,
          kids: state.kids,
          startTime: state.startTime,
          endTime: state.endTime,
          alcoholMode: state.alcoholMode,
          tier: state.tier,
          adjustments: { edits: state.edits, prices: state.prices },
          contactName: state.contactName,
          whatsapp: state.whatsapp,
          consent,
          eventDay: state.eventDay,
          cep: state.eventCep,
          eventCity: state.eventCity,
          eventAddress: state.eventAddress,
          eventHint: state.eventHint,
          website: website || undefined,
        },
      });
      patch({ quoteId: res.id });
      dispatch({ type: 'go', screen: 'quoteSent' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('Muitos pedidos seguidos daqui — espera uns minutinhos e tenta de novo.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Sem conexão com a API — tenta de novo em instantes.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-[clamp(16px,2.4vw,28px)]">
      <form
        onSubmit={submit}
        className="flex flex-col gap-5 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10"
      >
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,44px)] tracking-wide text-ink">
            Receba orçamentos de açougues
          </h1>
          <p className="text-[15px] font-bold text-muted">
            Conta pra gente onde e quando é o churras. Os açougues da região recebem a sua lista e mandam o
            orçamento no seu WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-display text-[clamp(22px,3vw,26px)] tracking-wide text-ink">Quando e onde</h2>
          <EventFields state={state} patch={patch} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-display text-[clamp(22px,3vw,26px)] tracking-wide text-ink">Seu contato</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-3">
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>Seu nome</FieldLabel>
              <input
                required
                maxLength={80}
                autoComplete="given-name"
                className={inputCls}
                value={state.contactName}
                onChange={(e) => patch({ contactName: e.target.value })}
              />
            </label>
            <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
              <FieldLabel>WhatsApp</FieldLabel>
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 98888-1234"
                className={inputCls}
                value={state.whatsapp}
                onChange={(e) => patch({ whatsapp: maskPhone(e.target.value) })}
              />
            </label>
          </div>
          {/* honeypot: fora da tela para gente, visível para bot */}
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            name="website"
            className="absolute left-[-9999px] h-px w-px opacity-0"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <label className="flex items-start gap-3 border-[3px] border-dashed border-[#17130F66] bg-cream p-3 text-[14px] font-bold text-body-text">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#C2341F]"
            />
            Aceito ser contatado por açougues pelo WhatsApp com orçamentos para este churras.
          </label>
        </div>

        {error && <p className="border-[3px] border-ember bg-paper p-3 text-[13px] font-black text-ember">{error}</p>}

        <button
          disabled={busy}
          className={`border-4 border-ink bg-ember px-6 py-4 font-display text-[clamp(24px,3vw,30px)] tracking-wide text-paper shadow-comic-8 hover:bg-ember-hover hover:shadow-comic-5 disabled:opacity-60 ${press}`}
        >
          {busy ? 'Enviando…' : 'Quero receber orçamentos →'}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'go', screen: 'edit' })}
          className="self-start text-[14px] font-extrabold text-ember underline"
        >
          ← Voltar para a lista
        </button>
      </form>

      <ListSummary result={result} tierName={tierName} />
    </div>
  );
}
