export type TierId = 'basico' | 'medio' | 'gourmet';

/** Legado: churras salvos antes da fatia 10 guardam a política; não altera mais a lista. */
export type AlcoholMode = 'lista' | 'byob' | 'bar' | 'none';

export type Unit = 'kg' | 'un' | 'kit' | 'saco' | 'dz';

/** 'Bebidas' só aparece em snapshots salvos antes da fatia 10; a lista sugerida não gera mais. */
export type Category = 'Carnes' | 'Bebidas' | 'Acompanhamentos' | 'Essenciais';

export interface CalculatorInput {
  men: number;
  women: number;
  kids: number;
  /** Formato 'HH:mm'. Fim menor ou igual ao início vira o dia seguinte; duração é limitada a 1–14h. */
  startTime: string;
  endTime: string;
  alcoholMode: AlcoholMode;
  tier: TierId;
}

export interface ListItem {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  unitPrice: number;
  qty: number;
  /** false = fora do total (removido pelo usuário ou opcional ainda não incluído) */
  on: boolean;
  /** true = sugestão opcional do nível ("Bora incluir mais?") */
  optional: boolean;
}

/**
 * Ajustes do usuário sobre a lista sugerida, chaveados por item id.
 * `edits[id] = null` remove o item; um número define a quantidade (e reativa opcionais).
 * `prices[id]` sobrescreve o preço unitário de referência.
 */
export interface Adjustments {
  edits?: Record<string, number | null>;
  prices?: Record<string, number>;
}

export interface CalculationResult {
  items: ListItem[];
  adults: number;
  guests: number;
  hours: number;
  stretch: number;
  /** Carne teórica do evento (já com o fator do nível), antes do arredondamento por corte */
  meatBaseKg: number;
  /** Soma dos itens de carne ativos, já arredondados/editados */
  meatListKg: number;
  total: number;
  perAdult: number;
}
