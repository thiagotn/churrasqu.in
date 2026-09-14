import { TIERS, TierSeed } from './catalog';
import { slugify } from './slug';
import {
  Adjustments,
  AlcoholMode,
  CalculationResult,
  CalculatorInput,
  Category,
  ListItem,
  TierId,
  Unit,
} from './types';


export const ALCOHOL_MODES: AlcoholMode[] = ['lista', 'byob', 'bar', 'none'];

/** Kg arredondado para múltiplo de 0.5, mínimo 0.5. */
export const roundKg = (v: number): number => Math.max(0.5, Math.round(v * 2) / 2);

/** Unidades arredondadas para cima, mínimo 1. */
export const roundUnits = (v: number): number => Math.max(1, Math.ceil(v));

const round2 = (v: number): number => Math.round(v * 100) / 100;

const toMinutes = (t: string): number => {
  const parts = String(t ?? '').split(':');
  return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
};

/** Duração em horas; fim <= início vira o dia seguinte; resultado limitado a 1–14h. */
export function durationHours(startTime: string, endTime: string): number {
  let d = (toMinutes(endTime) - toMinutes(startTime)) / 60;
  if (d <= 0) d += 24;
  return Math.min(14, Math.max(1, d));
}

/** Fator de esticada: churras longo consome mais carne e carvão. */
export const stretchFor = (hours: number): number =>
  hours >= 7 ? 1.25 : hours >= 5 ? 1.12 : 1;

/** Carne base em kg por perfil de convidado, já esticada pela duração. */
export function meatBaseKg(
  counts: Pick<CalculatorInput, 'men' | 'women' | 'kids'>,
  stretch: number,
): number {
  return (counts.men * 0.42 + counts.women * 0.32 + counts.kids * 0.2) * stretch;
}

/** Nível gourmet assa 5% a mais de carne. */
export const meatForTier = (baseKg: number, tier: TierId): number =>
  tier === 'gourmet' ? baseKg * 1.05 : baseKg;

/** Fonte do catálogo (níveis + preços de referência). Default: seed do pacote; a api injeta o banco. */
export type Catalog = Record<TierId, TierSeed>;

function validate(input: CalculatorInput, catalog: Catalog): void {
  for (const field of ['men', 'women', 'kids'] as const) {
    const v = input[field];
    if (!Number.isInteger(v) || v < 0) {
      throw new Error(`${field} deve ser um inteiro >= 0 (recebido: ${v})`);
    }
  }
  if (!catalog[input.tier]) {
    throw new Error(`Nível desconhecido: ${String(input.tier)}`);
  }
  if (!ALCOHOL_MODES.includes(input.alcoholMode)) {
    throw new Error(`Política de bebida desconhecida: ${String(input.alcoholMode)}`);
  }
}

/**
 * Lista de compras sugerida para o nível, sem ajustes do usuário.
 * Ids são estáveis por nome (`medio-picanha`), para que edits/prices sobrevivam
 * a mudanças de convidados ou horário.
 * Sem bebidas (fatia 10): a lista foca no que o açougue vende — carnes, acompanhamentos e essenciais.
 */
export function buildBaseList(input: CalculatorInput, catalog: Catalog = TIERS): ListItem[] {
  validate(input, catalog);
  const tier = catalog[input.tier];
  const adults = input.men + input.women;
  const guests = adults + input.kids;
  const hours = durationHours(input.startTime, input.endTime);
  const stretch = stretchFor(hours);
  const meatKg = meatForTier(meatBaseKg(input, stretch), input.tier);

  const items: ListItem[] = [];
  const used = new Map<string, number>();
  const push = (
    name: string,
    category: Category,
    unit: Unit,
    unitPrice: number,
    qty: number,
    opts: { on?: boolean; optional?: boolean } = {},
  ): void => {
    const base = `${input.tier}-${slugify(name)}`;
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    items.push({
      id: n === 0 ? base : `${base}-${n + 1}`,
      name,
      category,
      unit,
      unitPrice,
      qty,
      on: opts.on ?? true,
      optional: opts.optional ?? false,
    });
  };

  for (const cut of tier.cuts) {
    push(cut.name, 'Carnes', 'kg', cut.unitPrice, roundKg(meatKg * cut.proportion));
  }

  for (const side of tier.sides) {
    const bucket = side.per === 'adult' ? adults : guests;
    push(
      side.name,
      'Acompanhamentos',
      side.unit,
      side.unitPrice,
      side.unit === 'kg' ? roundKg(bucket * side.factor) : roundUnits(bucket * side.factor),
    );
  }

  push(tier.charcoal.name, 'Essenciais', 'saco', tier.charcoal.unitPrice, roundUnits(meatKg / 5));
  push('Sal grosso 1kg', 'Essenciais', 'un', 9.5, roundUnits(meatKg / 8));
  push('Kit descartáveis (pratos, copos, guardanapos)', 'Essenciais', 'kit', 38, roundUnits(guests / 10));
  push('Acendedor e papel alumínio', 'Essenciais', 'kit', 24, 1);
  if (hours >= 7) {
    push('Gelo extra e reposição de carvão', 'Essenciais', 'kit', 42, 1);
  }

  for (const opt of tier.optional) {
    push(opt.name, 'Acompanhamentos', opt.unit, opt.unitPrice, opt.qty, { on: false, optional: true });
  }

  return items;
}

/** Aplica preços e quantidades editados; `edits[id] = null` remove o item. */
export function applyAdjustments(items: ListItem[], adjustments?: Adjustments): ListItem[] {
  if (!adjustments) return items;
  const { edits = {}, prices = {} } = adjustments;
  return items.map((raw) => {
    const item = prices[raw.id] !== undefined ? { ...raw, unitPrice: prices[raw.id] } : raw;
    const edit = edits[item.id];
    if (edit === null) return { ...item, on: false };
    if (edit !== undefined) return { ...item, qty: edit, on: true };
    return item;
  });
}

/** Item como persistido no snapshot de um churras salvo (subset relevante). */
export interface SnapshotItem {
  itemId: string;
  qty: number;
  unitPrice: number;
}

/**
 * Reconstrói os ajustes do usuário a partir do snapshot salvo — o inverso do save.
 * Compara a lista base do input com o snapshot pelos ids estáveis (ADR 0002):
 * qty/preço diferentes viram edits/prices; item base ausente = removido; opcional
 * presente = reativado. Itens do snapshot sem correspondente na base (catálogo
 * mudou desde o save) não são reconstruíveis e ficam de fora.
 */
export function adjustmentsFromSnapshot(
  input: CalculatorInput,
  snapshot: SnapshotItem[],
  catalog: Catalog = TIERS,
): Adjustments {
  const base = buildBaseList(input, catalog);
  const saved = new Map(snapshot.map((s) => [s.itemId, s]));
  const edits: Record<string, number | null> = {};
  const prices: Record<string, number> = {};
  for (const item of base) {
    const match = saved.get(item.id);
    if (!match) {
      if (item.on) edits[item.id] = null;
      continue;
    }
    if (match.unitPrice !== item.unitPrice) prices[item.id] = match.unitPrice;
    if (!item.on || match.qty !== item.qty) edits[item.id] = match.qty;
  }
  return { edits, prices };
}

export function calculate(
  input: CalculatorInput,
  adjustments?: Adjustments,
  catalog: Catalog = TIERS,
): CalculationResult {
  const items = applyAdjustments(buildBaseList(input, catalog), adjustments);
  const adults = input.men + input.women;
  const guests = adults + input.kids;
  const hours = durationHours(input.startTime, input.endTime);
  const stretch = stretchFor(hours);
  const active = items.filter((i) => i.on);
  const total = round2(active.reduce((sum, i) => sum + i.qty * i.unitPrice, 0));
  return {
    items,
    adults,
    guests,
    hours,
    stretch,
    meatBaseKg: meatForTier(meatBaseKg(input, stretch), input.tier),
    meatListKg: active
      .filter((i) => i.category === 'Carnes' && i.unit === 'kg')
      .reduce((sum, i) => sum + i.qty, 0),
    total,
    perAdult: adults > 0 ? round2(total / adults) : 0,
  };
}
