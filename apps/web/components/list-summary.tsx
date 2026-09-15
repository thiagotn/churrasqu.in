'use client';

import { CalculationResult, Category } from '@churrasquin/calculator';
import { kgLabel, money, qtyLabel } from '../lib/format';
import { CUTS_NOTE } from '../lib/labels';

const CATEGORY_ORDER: Category[] = ['Carnes', 'Acompanhamentos', 'Essenciais'];

/** Lista compacta por categoria (quantidades) — o que vai para o açougue. */
export function ListSummary({ result, tierName }: { result: CalculationResult; tierName: string }) {
  const active = result.items.filter((i) => i.on);
  return (
    <section className="flex flex-col gap-3 border-4 border-ink bg-paper p-[clamp(18px,2.5vw,30px)] shadow-comic-10">
      <div>
        <h2 className="font-display text-[clamp(22px,3vw,28px)] tracking-wide text-ink">Itens do Churras</h2>
        <p className="text-[14px] font-extrabold text-muted">
          Churras {tierName} · {result.guests} convidados · {kgLabel(result.meatListKg)} de carne · referência {money(result.total)}
        </p>
      </div>
      {CATEGORY_ORDER.map((category) => {
        const items = active.filter((i) => i.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="border-[3px] border-ink bg-cream">
            <div className="flex justify-between bg-ink px-3 py-1.5 text-paper">
              <span className="font-display text-[18px] tracking-wide">{category}</span>
              <span className="text-[13px] font-extrabold">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <ul className="px-3 py-2 text-[14px] font-bold text-ink">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-0.5">
                  <span className="min-w-0 truncate">{item.name}</span>
                  <span className="shrink-0 font-black">
                    {qtyLabel(item.qty)} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
            {category === 'Carnes' && (
              <p className="border-t-2 border-dashed border-[#17130F33] px-3 py-1.5 text-[12px] font-bold text-body-text">{CUTS_NOTE}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
