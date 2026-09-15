'use client';

import { CalculationResult } from '@churrasquin/calculator';
import { dayLabel } from '../../lib/labels';
import { Action, ChurrasState } from '../../lib/state';
import { ListSummary } from '../list-summary';
import { press } from '../ui';

export function QuoteSentScreen({
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
  const protocol = (state.quoteId ?? '').slice(-6).toUpperCase();
  return (
    <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)]">
      <section className="border-4 border-ink bg-mustard p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
        <h1 className="font-display text-[clamp(30px,5vw,44px)] tracking-wide text-ink">
          Pedido enviado{state.contactName ? `, ${state.contactName.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-[15px] font-extrabold text-ink">
          Protocolo #{protocol} · {dayLabel(state.eventDay)} às {state.startTime} ·{' '}
          {state.eventCity}
        </p>
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-[clamp(16px,2.4vw,28px)]">
        <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)]">
          <section className="flex flex-col gap-3 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
            <h2 className="font-display text-[clamp(22px,3vw,28px)] tracking-wide text-ink">E agora?</h2>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-[15px] font-bold text-body-text">
              <li>A gente repassa sua lista para açougues perto do CEP {state.eventCep}.</li>
              <li>
                Eles chamam no WhatsApp <span className="font-black text-ink">{state.whatsapp}</span> com preço e
                condições de entrega ou retirada — e podem sugerir outro corte com preço parecido.
              </li>
              <li>Você compara e fecha com quem fizer o melhor negócio — sem compromisso.</li>
            </ol>
          </section>

          <section className="flex flex-col gap-3 border-4 border-ink bg-brand-sky p-[clamp(18px,2.5vw,30px)] text-paper shadow-comic-10">
            <h2 className="font-display text-[clamp(22px,3vw,28px)] tracking-wide">Também quer convidar a galera?</h2>
            <p className="text-[15px] font-bold">
              Crie o link do churras com confirmação de presença e Pix para dividir a conta. Data e local já vão
              preenchidos.
            </p>
            <button
              onClick={() => dispatch({ type: 'go', screen: 'event' })}
              className={`self-start border-[3px] border-ink bg-mustard px-5 py-3 text-[15px] font-black text-ink shadow-comic-4 ${press}`}
            >
              Organizar e convidar →
            </button>
          </section>

          <button
            onClick={() => dispatch({ type: 'reset' })}
            className={`self-start rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[14px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
          >
            Calcular outro churras
          </button>
        </div>

        <ListSummary result={result} tierName={tierName} />
      </div>
    </div>
  );
}
