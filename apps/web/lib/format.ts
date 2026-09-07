export const money = (v: number): string =>
  'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const kgLabel = (v: number): string =>
  (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';

export const qtyLabel = (v: number): string =>
  (v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

export const hoursLabel = (v: number): string =>
  (v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'h';

/** Aceita "89,90" e "1.234,56". Devolve NaN quando não é número. */
export const parsePtNumber = (text: string): number => {
  const normalized = text.trim().replace(/\./g, '').replace(',', '.');
  return normalized === '' ? NaN : Number(normalized);
};
