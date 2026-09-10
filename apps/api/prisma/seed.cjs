// Seed idempotente do catálogo (fatia 8, ADR 0006): lê o TIERS do pacote
// @churrasquin/calculator (fonte do CONTEÚDO) e faz upsert nas tabelas
// CatalogTier/CatalogItem (fonte de RUNTIME). JS puro: roda no container
// sem ts-node (initContainer do homelab chama `node apps/api/prisma/seed.cjs`).
const { PrismaClient } = require('@prisma/client');
const { TIERS, TIER_IDS } = require('@churrasquin/calculator');

const toCents = (v) => Math.round(v * 100);

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const [order, tierId] of TIER_IDS.entries()) {
      const tier = TIERS[tierId];
      await prisma.catalogTier.upsert({
        where: { id: tier.id },
        create: {
          id: tier.id,
          name: tier.name,
          badge: tier.badge,
          priceLabel: tier.priceLabel,
          pitch: tier.pitch,
          charcoalName: tier.charcoal.name,
          charcoalPriceCents: toCents(tier.charcoal.unitPrice),
          sortOrder: order,
        },
        update: {
          name: tier.name,
          badge: tier.badge,
          priceLabel: tier.priceLabel,
          pitch: tier.pitch,
          charcoalName: tier.charcoal.name,
          charcoalPriceCents: toCents(tier.charcoal.unitPrice),
          sortOrder: order,
        },
      });

      const items = [
        ...tier.cuts.map((c, i) => ({
          kind: 'cut', name: c.name, unitPriceCents: toCents(c.unitPrice),
          proportion: c.proportion, unit: null, per: null, factor: null, qty: null, sortOrder: i,
        })),
        ...tier.sides.map((s, i) => ({
          kind: 'side', name: s.name, unitPriceCents: toCents(s.unitPrice),
          proportion: null, unit: s.unit, per: s.per, factor: s.factor, qty: null, sortOrder: i,
        })),
        ...tier.optional.map((o, i) => ({
          kind: 'optional', name: o.name, unitPriceCents: toCents(o.unitPrice),
          proportion: null, unit: o.unit, per: null, factor: null, qty: o.qty, sortOrder: i,
        })),
      ];

      for (const item of items) {
        await prisma.catalogItem.upsert({
          where: { tierId_kind_name: { tierId: tier.id, kind: item.kind, name: item.name } },
          create: { tierId: tier.id, ...item },
          update: { ...item },
        });
      }
    }
    const count = await prisma.catalogItem.count();
    console.log(`✅ catálogo semeado: ${TIER_IDS.length} níveis, ${count} itens`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ seed do catálogo falhou:', e);
  process.exit(1);
});
