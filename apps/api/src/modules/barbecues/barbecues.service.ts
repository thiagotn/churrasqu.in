import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { makeShareSlug } from '@churrasquin/calculator';
import { Barbecue, BarbecueItem } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculatorService } from '../calculator/calculator.service';
import { SaveBarbecueDto } from './dto/save-barbecue.dto';

const toCents = (v: number): number => Math.round(v * 100);
const toReais = (cents: number): number => cents / 100;

type BarbecueWithItems = Barbecue & { items: BarbecueItem[] };

@Injectable()
export class BarbecuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: CalculatorService,
  ) {}

  /** Recalcula com o seed atual e congela o resultado como snapshot. */
  private snapshot(dto: SaveBarbecueDto) {
    if (dto.men + dto.women < 1) {
      throw new BadRequestException('O churras precisa de pelo menos 1 adulto.');
    }
    const { adjustments, eventName, eventDay, eventAddress, eventCity, eventHint, ...input } = dto;
    const result = this.calculator.estimate(input, adjustments);
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
      event: {
        eventName,
        eventDay,
        eventAddress,
        eventCity,
        eventHint: eventHint ?? '',
        startTime: input.startTime,
        endTime: input.endTime,
        alcoholMode: input.alcoholMode,
        tier: input.tier,
        men: input.men,
        women: input.women,
        kids: input.kids,
      },
    };
  }

  private async uniqueSlug(eventName: string): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = makeShareSlug(eventName);
      const clash = await this.prisma.barbecue.findUnique({ where: { slug } });
      if (!clash) return slug;
    }
    throw new Error('Não consegui gerar um slug único');
  }

  private toApi(b: BarbecueWithItems) {
    const { totalCents, perAdultCents, ownerId: _ownerId, items, ...rest } = b;
    return {
      ...rest,
      total: toReais(totalCents),
      perAdult: toReais(perAdultCents),
      items: items.map(({ unitPriceCents, barbecueId: _b, ...item }) => ({
        ...item,
        unitPrice: toReais(unitPriceCents),
      })),
    };
  }

  async create(ownerId: string, dto: SaveBarbecueDto) {
    const { totals, items, event } = this.snapshot(dto);
    const slug = await this.uniqueSlug(dto.eventName);
    const barbecue = await this.prisma.barbecue.create({
      data: { ...event, ...totals, slug, ownerId, items: { create: items } },
      include: { items: true },
    });
    return this.toApi(barbecue);
  }

  async listMine(ownerId: string) {
    const rows = await this.prisma.barbecue.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return rows.map((b) => this.toApi(b));
  }

  private async owned(ownerId: string, id: string): Promise<BarbecueWithItems> {
    const barbecue = await this.prisma.barbecue.findUnique({ where: { id }, include: { items: true } });
    if (!barbecue || barbecue.ownerId !== ownerId) {
      throw new NotFoundException('Churras não encontrado');
    }
    return barbecue;
  }

  async get(ownerId: string, id: string) {
    return this.toApi(await this.owned(ownerId, id));
  }

  /** Atualiza recalculando o snapshot inteiro (mesmo corpo do create; o slug não muda). */
  async update(ownerId: string, id: string, dto: SaveBarbecueDto) {
    await this.owned(ownerId, id);
    const { totals, items, event } = this.snapshot(dto);
    const [, barbecue] = await this.prisma.$transaction([
      this.prisma.barbecueItem.deleteMany({ where: { barbecueId: id } }),
      this.prisma.barbecue.update({
        where: { id },
        data: { ...event, ...totals, items: { create: items } },
        include: { items: true },
      }),
    ]);
    return this.toApi(barbecue);
  }
}
