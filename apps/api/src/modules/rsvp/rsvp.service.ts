import { randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RsvpDto } from './dto/rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cria ou, com token válido, atualiza a resposta do convidado. Sem conta. */
  async respond(slug: string, dto: RsvpDto) {
    const barbecue = await this.prisma.barbecue.findUnique({ where: { slug }, select: { id: true } });
    if (!barbecue) throw new NotFoundException('Churras não encontrado');

    if (dto.token) {
      const existing = await this.prisma.rsvp.findUnique({ where: { token: dto.token } });
      if (existing && existing.barbecueId === barbecue.id) {
        const updated = await this.prisma.rsvp.update({
          where: { id: existing.id },
          data: { guestName: dto.name, response: dto.response },
        });
        return { token: updated.token, name: updated.guestName, response: updated.response };
      }
    }

    const created = await this.prisma.rsvp.create({
      data: {
        barbecueId: barbecue.id,
        guestName: dto.name,
        response: dto.response,
        token: randomBytes(16).toString('hex'),
      },
    });
    return { token: created.token, name: created.guestName, response: created.response };
  }

  /** Pills de confirmados para a página pública (quem vai; +1 marcado). */
  async confirmed(barbecueId: string): Promise<string[]> {
    const rows = await this.prisma.rsvp.findMany({
      where: { barbecueId, response: { in: ['vou', 'levo-alguem'] } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => (r.response === 'levo-alguem' ? `${r.guestName} (+1)` : r.guestName));
  }
}
