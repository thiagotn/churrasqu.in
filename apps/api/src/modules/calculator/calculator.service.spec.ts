import { Test } from '@nestjs/testing';
import { CalculatorModule } from './calculator.module';
import { CalculatorService } from './calculator.service';

describe('CalculatorService (módulo Nest)', () => {
  let service: CalculatorService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CalculatorModule],
    }).compile();
    service = moduleRef.get(CalculatorService);
  });

  it('estima um churras completo', () => {
    const result = service.estimate({
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

  it('gera slug de compartilhamento', () => {
    expect(service.shareSlug('Churras da Laje')).toMatch(/^churras-da-laje-[0-9a-f]{4}$/);
  });
});
