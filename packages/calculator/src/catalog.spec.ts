import { TIERS, TIER_IDS } from './catalog';

describe('integridade do catálogo (seed)', () => {
  it('tem os 3 níveis na ordem $, $$, $$$', () => {
    expect(TIER_IDS).toEqual(['basico', 'medio', 'gourmet']);
    expect(TIERS.basico.priceLabel).toBe('$');
    expect(TIERS.medio.priceLabel).toBe('$$');
    expect(TIERS.gourmet.priceLabel).toBe('$$$');
  });

  it.each(TIER_IDS)('proporções dos cortes de %s somam 1', (tierId) => {
    const sum = TIERS[tierId].cuts.reduce((a, c) => a + c.proportion, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it.each(TIER_IDS)('preços e fatores de %s são positivos', (tierId) => {
    const tier = TIERS[tierId];
    for (const cut of tier.cuts) expect(cut.unitPrice).toBeGreaterThan(0);
    expect(tier.charcoal.unitPrice).toBeGreaterThan(0);
    for (const side of tier.sides) {
      expect(side.unitPrice).toBeGreaterThan(0);
      expect(side.factor).toBeGreaterThan(0);
      expect(['adult', 'guest']).toContain(side.per);
    }
    for (const opt of tier.optional) {
      expect(opt.unitPrice).toBeGreaterThan(0);
      expect(opt.qty).toBeGreaterThan(0);
    }
  });
});
