import { AlcoholMode, TierId } from '@churrasquin/calculator';

export type Screen = 'setup' | 'tiers' | 'edit' | 'auth' | 'saved';

export interface ChurrasState {
  screen: Screen;
  /** Maior etapa já alcançada (1–4) — o stepper só navega para trás/até aqui */
  maxStep: number;
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
  barSpend: string;
  tier: TierId;
  edits: Record<string, number | null>;
  prices: Record<string, number>;
  loggedIn: boolean;
  userName: string;
  savedId: string | null;
  savedSlug: string | null;
}

export const initialState: ChurrasState = {
  screen: 'setup',
  maxStep: 1,
  men: 6,
  women: 5,
  kids: 3,
  eventDay: '2026-09-19',
  startTime: '12:30',
  endTime: '19:00',
  eventName: 'Churras da Laje',
  eventAddress: 'Rua das Brasas, 120',
  eventCity: 'Vila Brasa, São Paulo',
  eventHint: 'Portão azul, quintal do fundo',
  alcoholMode: 'lista',
  barSpend: '60',
  tier: 'medio',
  edits: {},
  prices: {},
  loggedIn: false,
  userName: '',
  savedId: null,
  savedSlug: null,
};

export const STEP_OF_SCREEN: Record<Screen, number> = {
  setup: 1,
  tiers: 2,
  edit: 3,
  auth: 3,
  saved: 4,
};

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
      return { ...state, screen: action.screen, maxStep: Math.max(state.maxStep, step) };
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
