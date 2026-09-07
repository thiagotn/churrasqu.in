import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Página pública + QR + Pix (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;
  let slug = '';
  let token = '';

  const saveBody = {
    men: 6,
    women: 5,
    kids: 3,
    startTime: '12:30',
    endTime: '19:00',
    alcoholMode: 'lista',
    tier: 'medio',
    eventName: 'Churras do Convite',
    eventDay: '2026-09-19',
    eventAddress: 'Rua das Brasas, 120',
    eventCity: 'Vila Brasa, São Paulo',
    eventHint: 'Portão azul',
    pixType: 'Celular',
    pixKey: '(11) 98888-1234',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = app.getHttpServer();

    const signup = await request(http)
      .post('/auth/signup')
      .send({ name: 'Zé Convite', email: `e2e-share-${Date.now()}@churrasqu.in`, password: 'segredo-forte' })
      .expect(201);
    token = signup.body.accessToken;
    const saved = await request(http)
      .post('/barbecues')
      .set('Authorization', `Bearer ${token}`)
      .send(saveBody)
      .expect(201);
    slug = saved.body.slug;
  });

  afterAll(async () => {
    await app.close();
  });

  it('chave Pix inválida para o tipo → 400', async () => {
    await request(http)
      .post('/barbecues')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...saveBody, pixType: 'CPF', pixKey: '123' })
      .expect(400);
  });

  it('GET /public/:slug devolve o convite sem dados sensíveis', async () => {
    const res = await request(http).get(`/public/${slug}`).expect(200);
    expect(res.body.eventName).toBe('Churras do Convite');
    expect(res.body.organizer).toBe('Zé Convite');
    expect(res.body.perAdult).toBeGreaterThan(0);
    expect(res.body.categories.map((c: { category: string }) => c.category)).toEqual([
      'Carnes',
      'Bebidas',
      'Acompanhamentos',
      'Essenciais',
    ]);
    // convite não expõe ids, preços por item nem dono
    expect(res.body.items).toBeUndefined();
    expect(res.body.ownerId).toBeUndefined();
  });

  it('convite traz payload Pix EMV válido com o valor por adulto', async () => {
    const res = await request(http).get(`/public/${slug}`).expect(200);
    expect(res.body.pix.key).toBe('+5511988881234');
    const payload: string = res.body.pix.payload;
    expect(payload.startsWith('000201')).toBe(true);
    expect(payload).toContain('br.gov.bcb.pix');
    expect(payload).toContain(res.body.perAdult.toFixed(2));
  });

  it('GET /public/:slug/qrcode devolve um PNG', async () => {
    const res = await request(http).get(`/public/${slug}/qrcode`).expect(200);
    expect(res.headers['content-type']).toBe('image/png');
    expect(res.body.length).toBeGreaterThan(500);
  });

  it('slug inexistente → 404', async () => {
    await request(http).get('/public/nao-existe-0000').expect(404);
  });
});
