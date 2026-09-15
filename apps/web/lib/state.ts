import { AlcoholMode, TierId, durationHours } from '@churrasquin/calculator';

/** 'setup' reúne pessoas e tipo de churrasco (tela única, fatia 10). */
export type Screen = 'setup' | 'edit' | 'quote' | 'quoteSent' | 'event' | 'auth' | 'saved';

/** Saída escolhida depois da lista: pedir orçamento (principal) ou organizar e convidar */
export type Branch = 'quote' | 'invite';

export type PixType = 'Celular' | 'CPF' | 'E-mail' | 'Aleatória';

export interface ChurrasState {
  screen: Screen;
  /** Maior etapa já alcançada (1–3) — o stepper só navega para trás/até aqui */
  maxStep: number;
  /** Pessoas confirmadas no passo 1: viram uma linha editável e liberam o tipo de churrasco */
  peopleConfirmed: boolean;
  men: number;
  women: number;
  kids: number;
  eventDay: string;
  startTime: string;
  endTime: string;
  eventName: string;
  eventAddress: string;
  eventCity: string;
  eventHint: string;
  alcoholMode: AlcoholMode;
  tier: TierId;
  edits: Record<string, number | null>;
  prices: Record<string, number>;
  loggedIn: boolean;
  userName: string;
  savedId: string | null;
  savedSlug: string | null;
  pixType: PixType;
  pixKey: string;
  branch: Branch | null;
  eventCep: string;
  contactName: string;
  whatsapp: string;
  quoteId: string | null;
}

/** Duração assumida na conta (não perguntada ao usuário). */
export const DEFAULT_DURATION_HOURS = 6;

export const initialState: ChurrasState = {
  screen: 'setup',
  maxStep: 1,
  peopleConfirmed: false,
  men: 6,
  women: 5,
  kids: 3,
  // local/data só são pedidos no orçamento ou no convite. A duração não é perguntada: a conta usa
  // sempre 6h (faixa de 5 a 6h, carne +12%) e o fim acompanha o início digitado (endTimeFor)
  eventDay: '',
  startTime: '12:00',
  endTime: '18:00', // 12:00 + DEFAULT_DURATION_HOURS
  eventName: '',
  eventAddress: '',
  eventCity: '',
  eventHint: '',
  // legado: bebidas não entram mais na lista; 'byob' só rotula o convite ("cada um leva a sua")
  alcoholMode: 'byob',
  tier: 'medio',
  edits: {},
  prices: {},
  loggedIn: false,
  userName: '',
  savedId: null,
  savedSlug: null,
  pixType: 'Celular',
  pixKey: '',
  branch: null,
  eventCep: '',
  contactName: '',
  whatsapp: '',
  quoteId: null,
};

const pad = (n: number): string => String(n).padStart(2, '0');

/** 'HH:mm' + horas → 'HH:mm' (vira o dia se passar da meia-noite). */
export function endTimeFor(startTime: string, hours: number): string {
  const [h, m] = startTime.split(':').map((v) => Number(v) || 0);
  const total = (h * 60 + m + Math.round(hours * 60)) % (24 * 60);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** Duração atual do churras (derivada de início/fim — é o que o cálculo usa). */
export const durationOf = (state: Pick<ChurrasState, 'startTime' | 'endTime'>): number =>
  durationHours(state.startTime, state.endTime);

export const STEP_OF_SCREEN: Record<Screen, number> = {
  setup: 1,
  edit: 2,
  quote: 3,
  quoteSent: 3,
  event: 3,
  auth: 3,
  saved: 3,
};

const BRANCH_OF_SCREEN: Partial<Record<Screen, Branch>> = {
  quote: 'quote',
  quoteSent: 'quote',
  event: 'invite',
  auth: 'invite',
  saved: 'invite',
};

/** Tela que o passo 3 do stepper abre, conforme o caminho e o progresso nele. */
export function step3Screen(state: ChurrasState): Screen {
  if (state.branch === 'invite') return state.savedSlug ? 'saved' : 'event';
  return state.quoteId ? 'quoteSent' : 'quote';
}

/** Telas que dependem de algo já feito (não abrem por hash/histórico sem isso). */
export function canOpen(state: ChurrasState, screen: Screen): boolean {
  if (STEP_OF_SCREEN[screen] > state.maxStep) return false;
  if (screen === 'saved') return Boolean(state.savedSlug);
  if (screen === 'quoteSent') return Boolean(state.quoteId);
  return true;
}

export type Action =
  | { type: 'patch'; patch: Partial<ChurrasState> }
  | { type: 'go'; screen: Screen }
  | { type: 'reset' }
  | { type: 'chooseTier'; tier: TierId }
  | { type: 'editQty'; id: string; qty: number }
  | { type: 'editPrice'; id: string; price: number }
  | { type: 'removeItem'; id: string }
  | { type: 'restore' };

export function reducer(state: ChurrasState, action: Action): ChurrasState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch };
    case 'go': {
      const step = STEP_OF_SCREEN[action.screen];
      const branch = BRANCH_OF_SCREEN[action.screen] ?? state.branch;
      return { ...state, screen: action.screen, branch, maxStep: Math.max(state.maxStep, step) };
    }
    case 'reset':
      // "Começar de novo" zera o churras, não a sessão do usuário
      return { ...initialState, loggedIn: state.loggedIn, userName: state.userName };
    case 'chooseTier':
      return reducer({ ...state, tier: action.tier }, { type: 'go', screen: 'edit' });
    case 'editQty':
      return { ...state, edits: { ...state.edits, [action.id]: action.qty } };
    case 'editPrice':
      return { ...state, prices: { ...state.prices, [action.id]: action.price } };
    case 'removeItem':
      return { ...state, edits: { ...state.edits, [action.id]: null } };
    case 'restore':
      return { ...state, edits: {}, prices: {} };
  }
}
