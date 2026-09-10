import { Injectable, Logger } from '@nestjs/common';
import { Catalog, TIERS, TIER_IDS, TierId, TierSeed, Unit } from '@churrasquin/calculator';
import { PrismaService } from '../../prisma/prisma.service';

const CACHE_TTL_MS = 60_000;

/**
 * Catálogo de runtime (ADR 0006): lido do banco (seed em prisma/seed.cjs) com
 * cache de 60s — editar um preço via SQL reflete em até 1min sem redeploy.
 * Fallback: seed do pacote quando as tabelas estão vazias/indisponíveis
 * (dev sem seed, testes de unidade).
 */
@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);
  private cache: Catalog | null = null;
  private loadedAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  async record(): Promise<Catalog> {
    if (this.cache && Date.now() - this.loadedAt < CACHE_TTL_MS) return this.cache;
    try {
      const tiers = await this.prisma.catalogTier.findMany({
        include: { items: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      });
      if (tiers.length === TIER_IDS.length) {
        const record = {} as Catalog;
        for (const tier of tiers) {
          record[tier.id as TierId] = {
            id: tier.id as TierId,
            name: tier.name,
            badge: tier.badge,
            priceLabel: tier.priceLabel as TierSeed['priceLabel'],
            pitch: tier.pitch,
            charcoal: { name: tier.charcoalName, unitPrice: tier.charcoalPriceCents / 100 },
            cuts: tier.items
              .filter((i) => i.kind === 'cut')
              .map((i) => ({ name: i.name, proportion: i.proportion ?? 0, unitPrice: i.unitPriceCents / 100 })),
            sides: tier.items
              .filter((i) => i.kind === 'side')
              .map((i) => ({
                name: i.name,
                unit: (i.unit ?? 'un') as Unit,
                unitPrice: i.unitPriceCents / 100,
                per: (i.per ?? 'guest') as 'adult' | 'guest',
                factor: i.factor ?? 0,
              })),
            optional: tier.items
              .filter((i) => i.kind === 'optional')
              .map((i) => ({
                name: i.name,
                unit: (i.unit ?? 'un') as Unit,
                unitPrice: i.unitPriceCents / 100,
                qty: i.qty ?? 1,
              })),
          };
        }
        this.cache = record;
        this.loadedAt = Date.now();
        return record;
      }
      this.logger.warn('catálogo no banco ausente/incompleto — usando o seed do pacote');
    } catch (err) {
      this.logger.warn(`catálogo do banco indisponível — usando o seed do pacote (${String(err)})`);
    }
    this.cache = TIERS;
    this.loadedAt = Date.now();
    return TIERS;
  }

  async tiers(): Promise<TierSeed[]> {
    const record = await this.record();
    return TIER_IDS.map((id) => record[id]);
  }
}
