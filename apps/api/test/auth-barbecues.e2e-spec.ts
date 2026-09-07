import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// Exige o Postgres do docker-compose de pé: `docker compose up -d db`
describe('Auth + barbecues persistidos (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;

  const email = `e2e-${Date.now()}@churrasqu.in`;
  const password = 'segredo-forte';
  let accessToken = '';
  let refreshToken = '';
  let barbecueId = '';

  const saveBody = {
    men: 6,
    women: 5,
    kids: 3,
    startTime: '12:30',
    endTime: '19:00',
    alcoholMode: 'lista',
    tier: 'medio',
    eventName: 'Churras da Laje',
    eventDay: '2026-09-19',
    eventAddress: 'Rua das Brasas, 120',
    eventCity: 'Vila Brasa, São Paulo',
    eventHint: 'Portão azul',
    adjustments: { edits: { 'medio-tabua-de-frios': 1 } },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('cadastra, rejeita duplicado e loga', async () => {
    const signup = await request(http)
      .post('/auth/signup')
      .send({ name: 'Zé do Churras', email, password })
      .expect(201);
    expect(signup.body.user.email).toBe(email);
    expect(signup.body.accessToken).toBeTruthy();

    await request(http).post('/auth/signup').send({ name: 'Clone', email, password }).expect(409);
    await request(http).post('/auth/login').send({ email, password: 'senha-errada' }).expect(401);
    await request(http).post('/auth/signup').send({ name: 'X', email: 'a@b.c', password: 'curta' }).expect(400);

    const login = await request(http).post('/auth/login').send({ email, password }).expect(200);
    accessToken = login.body.accessToken;
    refreshToken = login.body.refreshToken;
  });

  it('refresh emite novo par de tokens (e refresh token não autentica rota)', async () => {
    const res = await request(http).post('/auth/refresh').send({ refreshToken }).expect(200);
    expect(res.body.accessToken).toBeTruthy();
    await request(http).get('/barbecues').set('Authorization', `Bearer ${refreshToken}`).expect(401);
  });

  it('salvar exige auth', async () => {
    await request(http).post('/barbecues').send(saveBody).expect(401);
  });

  it('salva o churras com snapshot e slug', async () => {
    const res = await request(http)
      .post('/barbecues')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(saveBody)
      .expect(201);
    barbecueId = res.body.id;
    expect(res.body.slug).toMatch(/^churras-da-laje-[0-9a-f]{4}$/);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.items.length).toBeGreaterThan(0);
    // ajuste aplicado: a tábua de frios opcional entrou no snapshot
    expect(res.body.items.some((i: { itemId: string }) => i.itemId === 'medio-tabua-de-frios')).toBe(true);
    // snapshot não expõe dono nem centavos
    expect(res.body.ownerId).toBeUndefined();
    expect(res.body.totalCents).toBeUndefined();
  });

  it('lista e busca o churras salvo', async () => {
    const list = await request(http).get('/barbecues').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(list.body.map((b: { id: string }) => b.id)).toContain(barbecueId);

    const one = await request(http)
      .get(`/barbecues/${barbecueId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(one.body.eventName).toBe('Churras da Laje');
  });

  it('PATCH recalcula o snapshot e mantém o slug', async () => {
    const before = await request(http)
      .get(`/barbecues/${barbecueId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    const res = await request(http)
      .patch(`/barbecues/${barbecueId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...saveBody, men: 12, eventName: 'Churras da Laje 2' })
      .expect(200);
    expect(res.body.total).toBeGreaterThan(before.body.total);
    expect(res.body.slug).toBe(before.body.slug);
    expect(res.body.eventName).toBe('Churras da Laje 2');
  });

  it('outro usuário não enxerga o churras', async () => {
    const other = await request(http)
      .post('/auth/signup')
      .send({ name: 'Intruso', email: `e2e-other-${Date.now()}@churrasqu.in`, password })
      .expect(201);
    await request(http)
      .get(`/barbecues/${barbecueId}`)
      .set('Authorization', `Bearer ${other.body.accessToken}`)
      .expect(404);
  });
});
