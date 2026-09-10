import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TIER_IDS } from '@churrasquin/calculator';
import { AuthedRequest, JwtAuthGuard } from '../auth/auth.guard';
import { CalculatorService } from '../calculator/calculator.service';
import { BarbecuesService } from './barbecues.service';
import { EstimateRequestDto } from './dto/estimate.dto';
import { PaidVisibilityDto, RsvpPaidDto } from './dto/paid.dto';
import { SaveBarbecueDto } from './dto/save-barbecue.dto';

@Controller('barbecues')
export class BarbecuesController {
  constructor(
    private readonly calculator: CalculatorService,
    private readonly barbecues: BarbecuesService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: SaveBarbecueDto) {
    return this.barbecues.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listMine(@Req() req: AuthedRequest) {
    return this.barbecues.listMine(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.barbecues.get(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req: AuthedRequest, @Param('id') id: string, @Body() dto: SaveBarbecueDto) {
    return this.barbecues.update(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/rsvps/:rsvpId')
  setRsvpPaid(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Param('rsvpId') rsvpId: string,
    @Body() dto: RsvpPaidDto,
  ) {
    return this.barbecues.setRsvpPaid(req.user.sub, id, rsvpId, dto.paid);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/paid-visibility')
  setPaidVisibility(@Req() req: AuthedRequest, @Param('id') id: string, @Body() dto: PaidVisibilityDto) {
    return this.barbecues.setPaidVisibility(req.user.sub, id, dto.showPaidPublicly);
  }
}
