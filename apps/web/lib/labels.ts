import { AlcoholMode } from '@churrasquin/calculator';

export const ALCOHOL_NOTE: Record<AlcoholMode, string> = {
  lista: 'Bebida alcoólica entra na lista e no rateio de todo mundo.',
  byob: 'Bebida alcoólica fica por conta de cada um — a lista cobre suco, refri, água e gelo.',
  bar: 'Consumação no bar é paga individualmente e fica fora do rateio.',
  none: 'Churras sem álcool: sucos e refrigerante na conta.',
};

export const PIX_PLACEHOLDER: Record<string, string> = {
  Celular: '(11) 98888-1234',
  CPF: '123.456.789-00',
  'E-mail': 'ze@email.com',
  Aleatória: '0f7a2c1e-9b44-4d21-8f0e-11aa22bb33cc',
};

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WEEKDAYS_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

/** '2026-09-19' → 'SÁB 19/09' (badge dos cards do painel) */
export function shortDayLabel(isoDay: string): string {
  const parts = String(isoDay ?? '').split('-');
  if (parts.length !== 3) return 'A DEFINIR';
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(date.getTime())) return 'A DEFINIR';
  return `${WEEKDAYS_SHORT[date.getDay()]} ${parts[2]}/${parts[1]}`;
}

/** Data do evento já passou? (comparação por dia, local) */
export function isPastDay(isoDay: string): boolean {
  const parts = String(isoDay ?? '').split('-');
  if (parts.length !== 3) return false;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59);
  return date.getTime() < Date.now();
}

/** '2026-09-19' → 'Sábado, 19/09' */
export function dayLabel(isoDay: string): string {
  const parts = String(isoDay ?? '').split('-');
  if (parts.length !== 3) return 'Data a definir';
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(date.getTime())) return 'Data a definir';
  return `${WEEKDAYS[date.getDay()]}, ${parts[2]}/${parts[1]}`;
}
