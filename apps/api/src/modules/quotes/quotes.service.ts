import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { normalizeBrMobile } from '../../common/phone';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculatorService } from '../calculator/calculator.service';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';

/** Hoje (yyyy-mm-dd) no fuso do produto — um churras "de hoje" ainda vale. */
const todayInBrazil = (): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: CalculatorService,
  ) {}

  async create(dto: CreateQuoteRequestDto): Promise<{ id: string; createdAt: Date }> {
    const {
      adjustments,
      contactName,
      whatsapp,
      consent,
      eventDay,
      cep,
      eventCity,
      eventAddress,
      eventHint,
      website,
      ...input
    } = dto;

    // Honeypot preenchido: finge sucesso para o bot não insistir
    if (website) return { id: randomUUID(), createdAt: new Date() };

    if (input.men + input.women < 1) {
      throw new BadRequestException('O churras precisa de pelo menos 1 adulto.');
    }
    const phone = normalizeBrMobile(whatsapp);
    if (!phone) throw new BadRequestException('Informe um celular com DDD válido para o WhatsApp.');
    if (eventDay < todayInBrazil()) throw new BadRequestException('A data do churras já passou.');

    const { totals, items } = await this.calculator.snapshot(input, adjustments);
    const created = await this.prisma.quoteRequest.create({
      data: {
        contactName: contactName.trim(),
        whatsapp: phone,
        consent,
        eventDay,
        startTime: input.startTime,
        endTime: input.endTime,
        cep: cep.replace(/\D/g, ''),
        eventCity: eventCity.trim(),
        eventAddress: eventAddress?.trim() ?? '',
        eventHint: eventHint?.trim() ?? '',
        alcoholMode: input.alcoholMode,
        tier: input.tier,
        men: input.men,
        women: input.women,
        kids: input.kids,
        totalCents: totals.totalCents,
        meatListKg: totals.meatListKg,
        items: { create: items },
      },
      select: { id: true, createdAt: true },
    });
    return created;
  }
}
