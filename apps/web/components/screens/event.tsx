'use client';

import { FormEvent } from 'react';
import { CalculationResult } from '@churrasquin/calculator';
import { money } from '../../lib/format';
import { Action, ChurrasState } from '../../lib/state';
import { EventFields } from '../event-fields';
import { FieldLabel, inputCls, press } from '../ui';

/** Caminho "organizar e convidar": dados do evento antes da conta e do link público. */
export function EventScreen({
  state,
  result,
  dispatch,
  onSave,
  saving,
}: {
  state: ChurrasState;
  result: CalculationResult;
  dispatch: React.Dispatch<Action>;
  onSave: () => void;
  saving: boolean;
}) {
  const patch = (p: Partial<ChurrasState>) => dispatch({ type: 'patch', patch: p });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-[720px] flex-col gap-5 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10"
    >
      <div>
        <h1 className="font-display text-[clamp(30px,5vw,44px)] tracking-wide text-ink">Organizar e convidar</h1>
        <p className="text-[15px] font-bold text-muted">
          Esses dados vão para a página do convite, com confirmação de presença e Pix de {money(result.perAdult)} por
          adulto.
        </p>
      </div>

      <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
        <FieldLabel>Nome do churras</FieldLabel>
        <input
          required
          maxLength={80}
          className={inputCls}
          placeholder="Churras da Laje"
          value={state.eventName}
          onChange={(e) => patch({ eventName: e.target.value })}
        />
      </label>

      <EventFields state={state} patch={patch} withCep={false} />

      <button
        disabled={saving}
        className={`border-4 border-ink bg-mustard px-6 py-4 font-display text-[clamp(24px,3vw,30px)] tracking-wide text-ink shadow-comic-8 hover:shadow-comic-5 disabled:opacity-60 ${press}`}
      >
        {saving ? 'Salvando…' : state.savedId ? 'Atualizar e compartilhar →' : 'Salvar e compartilhar →'}
      </button>
      <p className="-mt-2 text-[13px] font-bold text-muted">
        Salvar exige uma conta rapidinha — é o que garante que o link do seu churras continue no ar.
      </p>
      <button
        type="button"
        onClick={() => dispatch({ type: 'go', screen: 'edit' })}
        className="self-start text-[14px] font-extrabold text-ember underline"
      >
        ← Voltar para a lista
      </button>
    </form>
  );
}
