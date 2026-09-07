import { Injectable } from '@nestjs/common';
import { calculate } from './domain/calculator';
import { makeShareSlug } from './domain/slug';
import { Adjustments, CalculationResult, CalculatorInput } from './domain/types';

@Injectable()
export class CalculatorService {
  /** Lista sugerida + totais para um evento, com ajustes opcionais do usuário. */
  estimate(input: CalculatorInput, adjustments?: Adjustments): CalculationResult {
    return calculate(input, adjustments);
  }

  shareSlug(eventName: string): string {
    return makeShareSlug(eventName);
  }
}
