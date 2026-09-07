import { Injectable } from '@nestjs/common';
import {
  Adjustments,
  CalculationResult,
  CalculatorInput,
  calculate,
  makeShareSlug,
} from '@churrasquin/calculator';

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
