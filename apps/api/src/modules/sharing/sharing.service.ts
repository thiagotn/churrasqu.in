import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RsvpService } from '../rsvp/rsvp.service';
import { PixKeyType, buildPixPayload, normalizePixKey } from './pix';

const CATEGORY_ORDER = ['Carnes', 'Bebidas', 'Acompanhamentos', 'Essenciais'];

@Injectable()
export class SharingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rsvp: RsvpService,
  ) {}

  private async bySlug(slug: string) {
    const barbecue = await this.prisma.barbecue.findUnique({
      where: { slug },
      include: { items: true, owner: { select: { name: true } } },
    });
    if (!barbecue) throw new NotFoundException('Churras não encontrado — o link está certo?');
    return barbecue;
  }

  /** Dados públicos do convite (tela 6) — sem preços por item, só o rateio. */
  async invite(slug: string) {
    const b = await this.bySlug(slug);
    const categories = CATEGORY_ORDER.map((category) => ({
      category,
      items: b.items.filter((i) => i.category === category).map((i) => i.name),
    })).filter((c) => c.items.length > 0);

    const pixKey = b.pixType && b.pixKey ? normalizePixKey(b.pixType as PixKeyType, b.pixKey) : null;

    return {
      slug: b.slug,
      eventName: b.eventName,
      eventDay: b.eventDay,
      startTime: b.startTime,
      endTime: b.endTime,
      eventAddress: b.eventAddress,
      eventCity: b.eventCity,
      eventHint: b.eventHint,
      alcoholMode: b.alcoholMode,
      tier: b.tier,
      adults: b.men + b.women,
      guests: b.men + b.women + b.kids,
      total: b.totalCents / 100,
      perAdult: b.perAdultCents / 100,
      organizer: b.owner.name,
      categories,
      confirmed: await this.rsvp.confirmed(b.id),
      pix: pixKey ? { type: b.pixType, key: pixKey, payload: this.payloadFor(b, pixKey) } : null,
    };
  }

  private payloadFor(
    b: { perAdultCents: number; eventName: string; eventCity: string; slug: string; owner: { name: string } },
    normalizedKey: string,
  ): string {
    return buildPixPayload({
      key: normalizedKey,
      amount: b.perAdultCents / 100,
      merchantName: b.owner.name,
      city: b.eventCity || 'BRASIL',
      txid: b.slug,
    });
  }

  /** Conteúdo do QR: o Pix (se configurado); senão, o link do convite. */
  async qrContent(slug: string): Promise<string> {
    const b = await this.bySlug(slug);
    const pixKey = b.pixType && b.pixKey ? normalizePixKey(b.pixType as PixKeyType, b.pixKey) : null;
    return pixKey ? this.payloadFor(b, pixKey) : `https://churrasqu.in/c/${b.slug}`;
  }
}
