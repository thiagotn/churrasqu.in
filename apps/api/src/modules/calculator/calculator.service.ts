import { Injectable } from '@nestjs/common';
import {
  Adjustments,
  CalculationResult,
  CalculatorInput,
  calculate,
  makeShareSlug,
} from '@churrasquin/calculator';
import { CatalogService } from '../catalog/catalog.service';

const toCents = (v: number): number => Math.round(v * 100);

/** Resultado congelado para persistir (churras salvo, pedido de orçamento). */
export interface CalculationSnapshot {
  totals: { totalCents: number; perAdultCents: number; meatListKg: number };
  items: { itemId: string; name: string; category: string; unit: string; qty: number; unitPriceCents: number }[];
}

@Injectable()
export class CalculatorService {
  constructor(private readonly catalog: CatalogService) {}

  /** Lista sugerida + totais para um evento, com o catálogo de runtime (banco → fallback pacote). */
  async estimate(input: CalculatorInput, adjustments?: Adjustments): Promise<CalculationResult> {
    return calculate(input, adjustments, await this.catalog.record());
  }

  /** Recalcula com o catálogo atual e congela totais (centavos) + itens ligados. */
  async snapshot(input: CalculatorInput, adjustments?: Adjustments): Promise<CalculationSnapshot> {
    const result = await this.estimate(input, adjustments);
    return {
      totals: {
        totalCents: toCents(result.total),
        perAdultCents: toCents(result.perAdult),
        meatListKg: result.meatListKg,
      },
      items: result.items
        .filter((i) => i.on)
        .map((i) => ({
          itemId: i.id,
          name: i.name,
          category: i.category,
          unit: i.unit,
          qty: i.qty,
          unitPriceCents: toCents(i.unitPrice),
        })),
    };
  }

  shareSlug(eventName: string): string {
    return makeShareSlug(eventName);
  }
}
