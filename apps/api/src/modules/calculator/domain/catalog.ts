import { TierId, Unit } from './types';

// Preços de referência provisórios (handoff): em produção devem vir do módulo
// catalog (seed no banco). As proporções e fatores são regra de domínio.

export interface CutSeed {
  name: string;
  /** Proporção do corte sobre a carne total do evento */
  proportion: number;
  unitPrice: number;
}

export interface SideSeed {
  name: string;
  unit: Unit;
  unitPrice: number;
  per: 'adult' | 'guest';
  factor: number;
}

export interface OptionalSeed {
  name: string;
  unit: Unit;
  unitPrice: number;
  qty: number;
}

export interface TierSeed {
  id: TierId;
  name: string;
  badge: string;
  priceLabel: '$' | '$$' | '$$$';
  pitch: string;
  cuts: CutSeed[];
  charcoal: { name: string; unitPrice: number };
  sides: SideSeed[];
  optional: OptionalSeed[];
}

export const TIERS: Record<TierId, TierSeed> = {
  basico: {
    id: 'basico',
    name: 'Básico',
    badge: 'churras básico',
    priceLabel: '$',
    pitch: 'O churras honesto: linguiça, frango e um corte bovino que rende.',
    cuts: [
      { name: 'Linguiça toscana', proportion: 0.32, unitPrice: 26 },
      { name: 'Coxa e sobrecoxa de frango', proportion: 0.28, unitPrice: 19 },
      { name: 'Fraldinha', proportion: 0.4, unitPrice: 49 },
    ],
    charcoal: { name: 'Carvão vegetal 5kg', unitPrice: 29 },
    sides: [
      { name: 'Pão de alho (unidade)', unit: 'un', unitPrice: 4.5, per: 'guest', factor: 1 },
      { name: 'Farofa pronta 500g', unit: 'un', unitPrice: 12, per: 'guest', factor: 1 / 6 },
      { name: 'Kit vinagrete', unit: 'kit', unitPrice: 18, per: 'guest', factor: 1 / 8 },
    ],
    optional: [
      { name: 'Molho barbecue', unit: 'un', unitPrice: 16, qty: 1 },
      { name: 'Sobremesa simples (bolo/pudim)', unit: 'un', unitPrice: 32, qty: 1 },
      { name: 'Pão francês', unit: 'kg', unitPrice: 18, qty: 1 },
    ],
  },
  medio: {
    id: 'medio',
    name: 'Médio',
    badge: 'caiu o VR',
    priceLabel: '$$',
    pitch: 'Picanha na mesa, costela no tempo certo e acompanhamento de gente grande.',
    cuts: [
      { name: 'Picanha', proportion: 0.34, unitPrice: 89 },
      { name: 'Costela bovina', proportion: 0.24, unitPrice: 52 },
      { name: 'Linguiça artesanal', proportion: 0.2, unitPrice: 39 },
      { name: 'Asinha de frango temperada', proportion: 0.22, unitPrice: 28 },
    ],
    charcoal: { name: 'Carvão de eucalipto 5kg', unitPrice: 39 },
    sides: [
      { name: 'Pão de alho artesanal', unit: 'un', unitPrice: 7, per: 'guest', factor: 1 },
      { name: 'Queijo coalho no espeto', unit: 'un', unitPrice: 9.5, per: 'adult', factor: 1 },
      { name: 'Farofa da casa 500g', unit: 'un', unitPrice: 19, per: 'guest', factor: 1 / 6 },
      { name: 'Maionese verde caseira', unit: 'kg', unitPrice: 34, per: 'guest', factor: 1 / 8 },
    ],
    optional: [
      { name: 'Batata rústica assada', unit: 'kg', unitPrice: 22, qty: 2 },
      { name: 'Tábua de frios', unit: 'un', unitPrice: 89, qty: 1 },
      { name: 'Chimichurri artesanal', unit: 'un', unitPrice: 26, qty: 1 },
    ],
  },
  gourmet: {
    id: 'gourmet',
    name: 'Gourmet',
    badge: 'faria limer',
    priceLabel: '$$$',
    pitch: 'Cortes maturados, frutos do mar e harmonização. Churras de fechar o ano.',
    cuts: [
      { name: 'Picanha maturada', proportion: 0.28, unitPrice: 139 },
      { name: 'Tomahawk', proportion: 0.24, unitPrice: 169 },
      { name: 'Ancho Angus', proportion: 0.2, unitPrice: 129 },
      { name: 'Salmão em posta', proportion: 0.16, unitPrice: 99 },
      { name: 'Camarão VG', proportion: 0.12, unitPrice: 159 },
    ],
    charcoal: { name: 'Carvão de coco premium 5kg', unitPrice: 69 },
    sides: [
      { name: 'Provolone à parmegiana', unit: 'un', unitPrice: 26, per: 'adult', factor: 0.5 },
      { name: 'Pão de alho trufado', unit: 'un', unitPrice: 14, per: 'guest', factor: 1 },
      { name: 'Farofa de bacon e castanha', unit: 'un', unitPrice: 34, per: 'guest', factor: 1 / 6 },
      { name: 'Vinagrete de manga com hortelã', unit: 'kit', unitPrice: 39, per: 'guest', factor: 1 / 8 },
      { name: 'Legumes grelhados na brasa', unit: 'kg', unitPrice: 42, per: 'guest', factor: 1 / 6 },
    ],
    optional: [
      { name: 'Ostras frescas (dúzia)', unit: 'dz', unitPrice: 120, qty: 1 },
      { name: 'Tábua de queijos de terroir', unit: 'un', unitPrice: 189, qty: 1 },
      { name: 'Sobremesa de confeitaria', unit: 'un', unitPrice: 96, qty: 1 },
    ],
  },
};
