'use client';

import { CalculationResult, Catalog, Category, ListItem } from '@churrasquin/calculator';
import { kgLabel, money } from '../../lib/format';
import { Action, ChurrasState } from '../../lib/state';
import { PriceInput, QtyInput, WhatsAppIcon, press } from '../ui';

const CATEGORY_ORDER: Category[] = ['Carnes', 'Acompanhamentos', 'Essenciais'];

// Preço unitário compacto: "R$/kg" em vez de "por kg · R$"
const UNIT_SHORT: Record<ListItem['unit'], string> = {
  kg: 'kg',
  un: 'un',
  kit: 'kit',
  saco: 'saco',
  dz: 'dz',
};

const stepOf = (item: ListItem): number => (item.unit === 'kg' ? 0.5 : 1);

// Mobile: nome (+ remover) na 1ª linha e TODOS os controles numa única 2ª linha,
// sem quebra. Telas largas (xl+): o item inteiro numa linha só. O nome nunca é cortado.
function ItemRow({ item, dispatch }: { item: ListItem; dispatch: React.Dispatch<Action> }) {
  const step = stepOf(item);
  const setQty = (qty: number) => dispatch({ type: 'editQty', id: item.id, qty: Math.max(step, qty) });
  const removeButton = (extra: string) => (
    <button
      aria-label={`remover ${item.name}`}
      onClick={() => dispatch({ type: 'removeItem', id: item.id })}
      className={`h-10 w-10 shrink-0 border-[3px] border-ink bg-paper font-black text-ember hover:bg-ember hover:text-paper ${press} ${extra}`}
    >
      ✕
    </button>
  );
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 border-b-2 border-[#17130F1A] py-3 last:border-b-0 xl:flex-nowrap xl:gap-x-3">
      {/* Nome: linha própria no mobile (w-full força a quebra), flex-1 no desktop */}
      <div className="flex w-full min-w-0 items-center justify-between gap-2 xl:w-auto xl:flex-1">
        <span className="min-w-0 break-words text-[15px] font-black leading-tight text-ink xl:text-[16px]">
          {item.name}
        </span>
        {removeButton('xl:hidden')}
      </div>

      <label className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-bold text-muted">
        R$/{UNIT_SHORT[item.unit]}
        <PriceInput
          value={item.unitPrice}
          onCommit={(price) => dispatch({ type: 'editPrice', id: item.id, price })}
        />
      </label>

      <div className="flex shrink-0 items-center gap-1">
        <button
          aria-label={`menos ${item.name}`}
          onClick={() => setQty(item.qty - step)}
          className={`h-10 w-10 rounded-[10px] border-[3px] border-ink bg-cream font-black text-ink hover:bg-mustard ${press}`}
        >
          −
        </button>
        <QtyInput value={item.qty} min={step} onCommit={setQty} />
        <button
          aria-label={`mais ${item.name}`}
          onClick={() => setQty(item.qty + step)}
          className={`h-10 w-10 rounded-[10px] border-[3px] border-ink bg-cream font-black text-ink hover:bg-mustard ${press}`}
        >
          +
        </button>
      </div>

      <div className="ml-auto min-w-[72px] text-right text-[14px] font-black text-ink xl:ml-0 xl:min-w-[92px] xl:text-[15px]">
        {money(item.qty * item.unitPrice)}
      </div>

      {removeButton('hidden xl:block')}
    </div>
  );
}

export function EditScreen({
  state,
  result,
  catalog,
  dispatch,
  onInvite,
  saving,
}: {
  state: ChurrasState;
  result: CalculationResult;
  catalog: Catalog;
  dispatch: React.Dispatch<Action>;
  /** Caminho secundário: evento → conta → link/Pix/RSVP */
  onInvite: () => void;
  saving: boolean;
}) {
  const active = result.items.filter((i) => i.on);
  const off = result.items.filter((i) => !i.on);
  const hasAdjustments = Object.keys(state.edits).length + Object.keys(state.prices).length > 0;

  return (
    <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)] pb-24 md:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(32px,5vw,48px)] tracking-wide text-ink">Itens do Churras</h1>
          <p className="text-[15px] font-extrabold text-muted">
            Padrão {catalog[state.tier].name} · {result.guests} convidados
          </p>
        </div>
        {hasAdjustments && (
          <button
            onClick={() => dispatch({ type: 'restore' })}
            className={`rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[14px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
          >
            Restaurar sugestão
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-[clamp(16px,2.4vw,28px)] md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        {/* Categorias */}
        <div className="flex flex-col gap-[clamp(16px,2.4vw,28px)]">
          {CATEGORY_ORDER.map((category) => {
            const items = active.filter((i) => i.category === category);
            if (items.length === 0) return null;
            const subtotal = items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
            return (
              <section key={category} className="border-4 border-ink bg-paper shadow-comic-10">
                <header className="flex items-center justify-between bg-ink px-4 py-3 text-paper">
                  <span className="font-display text-[26px] tracking-wide">{category}</span>
                  <span className="text-[15px] font-extrabold">{money(subtotal)}</span>
                </header>
                <div className="px-4">
                  {items.map((item) => (
                    <ItemRow key={item.id} item={item} dispatch={dispatch} />
                  ))}
                </div>
              </section>
            );
          })}

          {off.length > 0 && (
            <section className="border-[3px] border-dashed border-[#17130F66] bg-cream p-4">
              <h2 className="font-display text-[22px] tracking-wide text-ink">Bora incluir mais?</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {off.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      dispatch({ type: 'editQty', id: item.id, qty: Math.max(stepOf(item), item.qty) })
                    }
                    className={`rounded-full border-[3px] border-ink bg-paper px-3 py-2 text-[13px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
                  >
                    + {item.name} · {money(item.unitPrice)}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Total (sticky) */}
        <div className="sticky top-4 flex flex-col gap-4">
          <section className="border-4 border-ink bg-ember p-[clamp(18px,2.5vw,30px)] text-paper shadow-comic-10">
            <div className="text-[12px] font-black uppercase tracking-[1.5px] text-paper/85">Total do churras</div>
            <div className="font-display text-[clamp(44px,6vw,62px)] leading-none">{money(result.total)}</div>
            <dl className="mt-3 text-[15px] font-extrabold">
              {[
                ['Por adulto', money(result.perAdult)],
                ['Itens na lista', String(active.length)],
                ['Carne total', kgLabel(result.meatListKg)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-t-[3px] border-dotted border-paper/40 py-2">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <button
            onClick={() => dispatch({ type: 'go', screen: 'quote' })}
            className={`flex items-center justify-center gap-3 border-4 border-ink bg-whatsapp px-5 py-4 text-left font-display text-[clamp(22px,2.6vw,28px)] leading-none tracking-wide text-ink shadow-comic-8 hover:bg-whatsapp-hover hover:shadow-comic-5 ${press}`}
          >
            <WhatsAppIcon className="h-8 w-8" />
            Receber orçamentos de açougues
          </button>
          <p className="-mt-2 text-[13px] font-bold text-muted">
            Grátis e sem cadastro: mandamos esta lista para açougues perto de você e eles respondem no seu WhatsApp.
          </p>
          <button
            onClick={onInvite}
            disabled={saving}
            className={`border-[3px] border-ink bg-mustard px-4 py-3 text-[16px] font-black text-ink shadow-comic-4 disabled:opacity-60 ${press}`}
          >
            {saving ? 'Salvando…' : state.savedId ? 'Atualizar convite da galera' : 'Organizar e convidar a galera'}
          </button>
          <button
            onClick={() => dispatch({ type: 'go', screen: 'tiers' })}
            className={`rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-[14px] font-extrabold text-ink shadow-comic-3 hover:bg-mustard ${press}`}
          >
            ← Trocar padrão da lista
          </button>
          <p className="text-[13px] font-bold text-muted">
            Preços de referência — o orçamento do açougue traz o valor real.
          </p>
        </div>
      </div>

      {/* Mobile: total sempre à vista + ação principal ao alcance do polegar */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t-4 border-ink bg-mustard px-4 py-2 md:hidden">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[1.5px] text-ink/70">Total do churras</div>
          <div className="font-display text-[24px] leading-none text-ink">{money(result.total)}</div>
          <div className="text-[12px] font-bold text-ink/80">{money(result.perAdult)} por adulto</div>
        </div>
        <button
          onClick={() => dispatch({ type: 'go', screen: 'quote' })}
          className={`flex items-center gap-2 border-[3px] border-ink bg-whatsapp px-3 py-3 font-display text-[18px] leading-none tracking-wide text-ink shadow-comic-3 ${press}`}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Pedir orçamento
        </button>
      </div>
    </div>
  );
}
