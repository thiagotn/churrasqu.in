import { Test } from '@nestjs/testing';
import { TIERS } from '@churrasquin/calculator';
import { CatalogService } from '../catalog/catalog.service';
import { CalculatorModule } from './calculator.module';
import { CalculatorService } from './calculator.service';

describe('CalculatorService (módulo Nest)', () => {
  let service: CalculatorService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CalculatorModule],
    })
      // unidade não toca banco: catálogo vem do seed do pacote
      .overrideProvider(CatalogService)
      .useValue({ record: async () => TIERS })
      .compile();
    service = moduleRef.get(CalculatorService);
  });

  it('estima um churras completo', async () => {
    const result = await service.estimate({
      men: 6,
      women: 5,
      kids: 3,
      startTime: '12:30',
      endTime: '19:00',
      alcoholMode: 'lista',
      tier: 'medio',
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.perAdult).toBeCloseTo(result.total / 11, 2);
  });

  it('congela snapshot em centavos só com itens ligados', async () => {
    const input = {
      men: 6,
      women: 5,
      kids: 3,
      startTime: '12:00',
      endTime: '18:00',
      alcoholMode: 'lista' as const,
      tier: 'medio' as const,
    };
    const result = await service.estimate(input);
    const snap = await service.snapshot(input);
    expect(snap.totals.totalCents).toBe(Math.round(result.total * 100));
    expect(snap.totals.meatListKg).toBe(result.meatListKg);
    expect(snap.items).toHaveLength(result.items.filter((i) => i.on).length);
    expect(Number.isInteger(snap.items[0].unitPriceCents)).toBe(true);
  });

  it('gera slug de compartilhamento', () => {
    expect(service.shareSlug('Churras da Laje')).toMatch(/^churras-da-laje-[0-9a-f]{4}$/);
  });
});
