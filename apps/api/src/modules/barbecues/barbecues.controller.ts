import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TIER_IDS } from '@churrasquin/calculator';
import { CalculatorService } from '../calculator/calculator.service';
import { EstimateRequestDto } from './dto/estimate.dto';

@Controller('barbecues')
export class BarbecuesController {
  constructor(private readonly calculator: CalculatorService) {}

  /** Público, sem salvar: lista resolvida + totais, e o total dos 3 níveis para a tela de escolha. */
  @Post('estimate')
  estimate(@Body() dto: EstimateRequestDto) {
    if (dto.men + dto.women < 1) {
      throw new BadRequestException('O churras precisa de pelo menos 1 adulto.');
    }
    const { adjustments, ...input } = dto;
    const result = this.calculator.estimate(input, adjustments);
    const tierTotals = Object.fromEntries(
      TIER_IDS.map((tier) => [tier, this.calculator.estimate({ ...input, tier }, adjustments).total]),
    );
    return { ...result, tierTotals };
  }
}
