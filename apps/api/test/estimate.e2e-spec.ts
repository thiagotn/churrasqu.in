import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API pública (e2e)', () => {
  let app: INestApplication;

  const validBody = {
    men: 6,
    women: 5,
    kids: 3,
    startTime: '12:30',
    endTime: '19:00',
    alcoholMode: 'lista',
    tier: 'medio',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /catalog/tiers devolve os 3 níveis com itens e preços', async () => {
    const res = await request(app.getHttpServer()).get('/catalog/tiers').expect(200);
    expect(res.body).toHaveLength(3);
    const medio = res.body.find((t: { id: string }) => t.id === 'medio');
    expect(medio.cuts.map((c: { name: string }) => c.name)).toContain('Picanha');
    expect(medio.charcoal.unitPrice).toBe(39);
  });

  it('POST /barbecues/estimate calcula lista, totais e tierTotals', async () => {
    const res = await request(app.getHttpServer())
      .post('/barbecues/estimate')
      .send(validBody)
      .expect(201);
    expect(res.body.adults).toBe(11);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(Object.keys(res.body.tierTotals).sort()).toEqual(['basico', 'gourmet', 'medio']);
    expect(res.body.tierTotals.medio).toBe(res.body.total);
    expect(res.body.tierTotals.gourmet).toBeGreaterThan(res.body.tierTotals.basico);
  });

  it('aplica ajustes enviados no corpo', async () => {
    const plain = await request(app.getHttpServer()).post('/barbecues/estimate').send(validBody);
    const res = await request(app.getHttpServer())
      .post('/barbecues/estimate')
      .send({ ...validBody, adjustments: { edits: { 'medio-picanha': null } } })
      .expect(201);
    expect(res.body.total).toBeCloseTo(plain.body.total - 2 * 89, 2);
  });

  it('payload inválido → 400', async () => {
    await request(app.getHttpServer())
      .post('/barbecues/estimate')
      .send({ ...validBody, men: -1 })
      .expect(400);
    await request(app.getHttpServer())
      .post('/barbecues/estimate')
      .send({ ...validBody, startTime: '25:99' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/barbecues/estimate')
      .send({ ...validBody, tier: 'premium' })
      .expect(400);
  });

  it('sem adultos → 400', async () => {
    await request(app.getHttpServer())
      .post('/barbecues/estimate')
      .send({ ...validBody, men: 0, women: 0 })
      .expect(400);
  });
});
