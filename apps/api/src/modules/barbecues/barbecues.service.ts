import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { makeShareSlug } from '@churrasquin/calculator';
import { Barbecue, BarbecueItem, Rsvp } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculatorService } from '../calculator/calculator.service';
import { normalizePixKey } from '../sharing/pix';
import { SaveBarbecueDto } from './dto/save-barbecue.dto';

const toReais = (cents: number): number => cents / 100;

type BarbecueWithItems = Barbecue & { items: BarbecueItem[]; rsvps?: Rsvp[] };

const CONFIRMED_RESPONSES = ['vou', 'levo-alguem'];

@Injectable()
export class BarbecuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: CalculatorService,
  ) {}

  /** Recalcula com o catálogo atual e congela o resultado como snapshot. */
  private async snapshot(dto: SaveBarbecueDto) {
    if (dto.men + dto.women < 1) {
      throw new BadRequestException('O churras precisa de pelo menos 1 adulto.');
    }
    const { adjustments, eventName, eventDay, eventAddress, eventCity, eventHint, pixType, pixKey, ...input } =
      dto;
    if (pixType && pixKey && normalizePixKey(pixType, pixKey) === null) {
      throw new BadRequestException(`Chave Pix inválida para o tipo ${pixType}.`);
    }
    const { totals, items } = await this.calculator.snapshot(input, adjustments);
    return {
      totals,
      items,
      event: {
        eventName,
        eventDay,
        eventAddress,
        eventCity,
        eventHint: eventHint ?? '',
        pixType: pixType ?? null,
        pixKey: pixKey ?? null,
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
    const { totalCents, perAdultCents, ownerId: _ownerId, items, rsvps, ...rest } = b;
    const confirmed = (rsvps ?? []).filter((r) => CONFIRMED_RESPONSES.includes(r.response));
    return {
      ...rest,
      total: toReais(totalCents),
      perAdult: toReais(perAdultCents),
      confirmedCount: confirmed.length,
      paidCount: confirmed.filter((r) => r.paid).length,
      rsvps: (rsvps ?? []).map((r) => ({
        id: r.id,
        guestName: r.guestName,
        response: r.response,
        paid: r.paid,
        paidAt: r.paidAt,
      })),
      items: items.map(({ unitPriceCents, barbecueId: _b, ...item }) => ({
        ...item,
        unitPrice: toReais(unitPriceCents),
      })),
    };
  }

  async create(ownerId: string, dto: SaveBarbecueDto) {
    const { totals, items, event } = await this.snapshot(dto);
    const slug = await this.uniqueSlug(dto.eventName);
    const barbecue = await this.prisma.barbecue.create({
      data: { ...event, ...totals, slug, ownerId, items: { create: items } },
      include: { items: true, rsvps: true },
    });
    return this.toApi(barbecue);
  }

  async listMine(ownerId: string) {
    const rows = await this.prisma.barbecue.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, rsvps: { orderBy: { createdAt: 'asc' } } },
    });
    return rows.map((b) => this.toApi(b));
  }

  private async owned(ownerId: string, id: string): Promise<BarbecueWithItems> {
    const barbecue = await this.prisma.barbecue.findUnique({
      where: { id },
      include: { items: true, rsvps: { orderBy: { createdAt: 'asc' } } },
    });
    if (!barbecue || barbecue.ownerId !== ownerId) {
      throw new NotFoundException('Churras não encontrado');
    }
    return barbecue;
  }

  /** Organizador marca/desmarca o pagamento de um convidado. */
  async setRsvpPaid(ownerId: string, barbecueId: string, rsvpId: string, paid: boolean) {
    const barbecue = await this.owned(ownerId, barbecueId);
    const rsvp = (barbecue.rsvps ?? []).find((r) => r.id === rsvpId);
    if (!rsvp) throw new NotFoundException('Convidado não encontrado neste churras');
    await this.prisma.rsvp.update({
      where: { id: rsvpId },
      data: { paid, paidAt: paid ? new Date() : null },
    });
    return this.toApi(await this.owned(ownerId, barbecueId));
  }

  /** Organizador escolhe exibir (ou não) quem pagou na página pública. */
  async setPaidVisibility(ownerId: string, barbecueId: string, showPaidPublicly: boolean) {
    await this.owned(ownerId, barbecueId);
    await this.prisma.barbecue.update({ where: { id: barbecueId }, data: { showPaidPublicly } });
    return this.toApi(await this.owned(ownerId, barbecueId));
  }

  async get(ownerId: string, id: string) {
    return this.toApi(await this.owned(ownerId, id));
  }

  /** Atualiza recalculando o snapshot inteiro (mesmo corpo do create; o slug não muda). */
  async update(ownerId: string, id: string, dto: SaveBarbecueDto) {
    await this.owned(ownerId, id);
    const { totals, items, event } = await this.snapshot(dto);
    const [, barbecue] = await this.prisma.$transaction([
      this.prisma.barbecueItem.deleteMany({ where: { barbecueId: id } }),
      this.prisma.barbecue.update({
        where: { id },
        data: { ...event, ...totals, items: { create: items } },
        include: { items: true, rsvps: { orderBy: { createdAt: 'asc' } } },
      }),
    ]);
    return this.toApi(barbecue);
  }
}
