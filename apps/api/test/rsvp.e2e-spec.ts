import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('RSVP (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;
  let slug = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = app.getHttpServer();

    const signup = await request(http)
      .post('/auth/signup')
      .send({ name: 'Zé RSVP', email: `e2e-rsvp-${Date.now()}@churrasqu.in`, password: 'segredo-forte' })
      .expect(201);
    const saved = await request(http)
      .post('/barbecues')
      .set('Authorization', `Bearer ${signup.body.accessToken}`)
      .send({
        men: 4,
        women: 4,
        kids: 0,
        startTime: '12:00',
        endTime: '17:00',
        alcoholMode: 'lista',
        tier: 'basico',
        eventName: 'Churras do RSVP',
        eventDay: '2026-10-10',
        eventAddress: 'Rua X, 1',
        eventCity: 'Centro',
      })
      .expect(201);
    slug = saved.body.slug;
  });

  afterAll(async () => {
    await app.close();
  });

  it('convidado confirma presença e aparece nos confirmados', async () => {
    const res = await request(http)
      .post(`/public/${slug}/rsvp`)
      .send({ name: 'Maria', response: 'vou' })
      .expect(200);
    expect(res.body.token).toHaveLength(32);

    const invite = await request(http).get(`/public/${slug}`).expect(200);
    expect(invite.body.confirmed).toContain('Maria');
  });

  it('quem leva alguém aparece com (+1)', async () => {
    await request(http).post(`/public/${slug}/rsvp`).send({ name: 'João', response: 'levo-alguem' }).expect(200);
    const invite = await request(http).get(`/public/${slug}`);
    expect(invite.body.confirmed).toContain('João (+1)');
  });

  it('token permite mudar a própria resposta sem duplicar', async () => {
    const first = await request(http)
      .post(`/public/${slug}/rsvp`)
      .send({ name: 'Ana', response: 'vou' })
      .expect(200);
    await request(http)
      .post(`/public/${slug}/rsvp`)
      .send({ name: 'Ana', response: 'nao-vou', token: first.body.token })
      .expect(200);
    const invite = await request(http).get(`/public/${slug}`);
    const anas = invite.body.confirmed.filter((n: string) => n.startsWith('Ana'));
    expect(anas).toHaveLength(0);
  });

  it('validações: resposta inválida e slug inexistente', async () => {
    await request(http).post(`/public/${slug}/rsvp`).send({ name: 'X', response: 'talvez' }).expect(400);
    await request(http).post('/public/nao-existe-0000/rsvp').send({ name: 'X', response: 'vou' }).expect(404);
  });
});
