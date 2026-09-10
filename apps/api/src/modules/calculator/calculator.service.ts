import { Injectable } from '@nestjs/common';
import {
  Adjustments,
  CalculationResult,
  CalculatorInput,
  calculate,
  makeShareSlug,
} from '@churrasquin/calculator';
import { CatalogService } from '../catalog/catalog.service';

@Injectable()
export class CalculatorService {
  constructor(private readonly catalog: CatalogService) {}

  /** Lista sugerida + totais para um evento, com o catálogo de runtime (banco → fallback pacote). */
  async estimate(input: CalculatorInput, adjustments?: Adjustments): Promise<CalculationResult> {
    return calculate(input, adjustments, await this.catalog.record());
  }

  shareSlug(eventName: string): string {
    return makeShareSlug(eventName);
  }
}
