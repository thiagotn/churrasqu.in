'use client';

import { ChurrasState, durationOf, endTimeFor } from '../lib/state';
import { FieldLabel, inputCls } from './ui';

type EventFieldsState = Pick<
  ChurrasState,
  'eventDay' | 'startTime' | 'endTime' | 'eventCep' | 'eventCity' | 'eventAddress' | 'eventHint'
>;

/** Hoje em yyyy-mm-dd no fuso local (mínimo do input de data). */
export const todayIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** '01310100' → '01310-100' enquanto digita */
export const maskCep = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

/**
 * Quando e onde — compartilhado entre o pedido de orçamento e o convite.
 * Só o início é digitado: o fim acompanha mantendo a duração da conta (6h num churras novo; a salva, se retomado).
 */
export function EventFields({
  state,
  patch,
  withCep = true,
}: {
  state: EventFieldsState;
  patch: (p: Partial<ChurrasState>) => void;
  withCep?: boolean;
}) {
  const hours = durationOf(state);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-3">
        <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
          <FieldLabel>Data</FieldLabel>
          <input
            required
            type="date"
            min={todayIso()}
            className={inputCls}
            value={state.eventDay}
            onChange={(e) => patch({ eventDay: e.target.value })}
          />
        </label>
        <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
          <FieldLabel>Começa</FieldLabel>
          <input
            required
            type="time"
            className={inputCls}
            value={state.startTime}
            onChange={(e) =>
              e.target.value && patch({ startTime: e.target.value, endTime: endTimeFor(e.target.value, hours) })
            }
          />
        </label>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-3">
        {withCep && (
          <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
            <FieldLabel>CEP</FieldLabel>
            <input
              required
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              pattern="\d{5}-?\d{3}"
              className={inputCls}
              value={state.eventCep}
              onChange={(e) => patch({ eventCep: maskCep(e.target.value) })}
            />
          </label>
        )}
        <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
          <FieldLabel>Bairro / cidade</FieldLabel>
          <input
            required
            className={inputCls}
            placeholder="Vila Brasa, São Paulo"
            value={state.eventCity}
            onChange={(e) => patch({ eventCity: e.target.value })}
          />
        </label>
      </div>
      <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
        <FieldLabel>Endereço (opcional)</FieldLabel>
        <input
          autoComplete="street-address"
          className={inputCls}
          placeholder="Rua das Brasas, 120"
          value={state.eventAddress}
          onChange={(e) => patch({ eventAddress: e.target.value })}
        />
      </label>
      <label className="grid grid-cols-[minmax(0,1fr)] gap-1">
        <FieldLabel>Referência (opcional)</FieldLabel>
        <input
          className={inputCls}
          placeholder="Portão azul, quintal do fundo"
          value={state.eventHint}
          onChange={(e) => patch({ eventHint: e.target.value })}
        />
      </label>
    </div>
  );
}
