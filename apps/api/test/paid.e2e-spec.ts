import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cobranças — quem pagou (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;
  let token = '';
  let otherToken = '';
  let barbecueId = '';
  let slug = '';
  let rsvpId = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = app.getHttpServer();

    const signup = await request(http)
      .post('/auth/signup')
      .send({ name: 'Organizador', email: `e2e-paid-${Date.now()}@churrasqu.in`, password: 'segredo-forte' });
    token = signup.body.accessToken;
    const other = await request(http)
      .post('/auth/signup')
      .send({ name: 'Intruso', email: `e2e-paid-other-${Date.now()}@churrasqu.in`, password: 'segredo-forte' });
    otherToken = other.body.accessToken;

    const saved = await request(http)
      .post('/barbecues')
      .set('Authorization', `Bearer ${token}`)
      .send({
        men: 4, women: 4, kids: 0, startTime: '12:00', endTime: '17:00',
        alcoholMode: 'lista', tier: 'basico', eventName: 'Churras das Cobranças',
        eventDay: '2026-11-01', eventAddress: 'Rua X, 1', eventCity: 'Centro',
      });
    barbecueId = saved.body.id;
    slug = saved.body.slug;

    const rsvp = await request(http).post(`/public/${slug}/rsvp`).send({ name: 'Maria', response: 'vou' });
    rsvpId = (await request(http).get(`/barbecues/${barbecueId}`).set('Authorization', `Bearer ${token}`))
      .body.rsvps[0].id;
    expect(rsvp.status).toBe(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it('lista traz rsvps com contadores; pago default false', async () => {
    const res = await request(http).get('/barbecues').set('Authorization', `Bearer ${token}`).expect(200);
    const mine = res.body.find((b: { id: string }) => b.id === barbecueId);
    expect(mine.confirmedCount).toBe(1);
    expect(mine.paidCount).toBe(0);
    expect(mine.showPaidPublicly).toBe(false);
    expect(mine.rsvps[0].guestName).toBe('Maria');
  });

  it('organizador marca pago; intruso não consegue', async () => {
    await request(http)
      .patch(`/barbecues/${barbecueId}/rsvps/${rsvpId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ paid: true })
      .expect(404);

    const res = await request(http)
      .patch(`/barbecues/${barbecueId}/rsvps/${rsvpId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ paid: true })
      .expect(200);
    expect(res.body.paidCount).toBe(1);
    expect(res.body.rsvps[0].paid).toBe(true);
    expect(res.body.rsvps[0].paidAt).toBeTruthy();
  });

  it('convite público não expõe pago por default; expõe com o toggle', async () => {
    const before = await request(http).get(`/public/${slug}`).expect(200);
    expect(before.body.confirmed).toEqual(['Maria']);
    expect(before.body.confirmedDetailed).toBeUndefined();

    await request(http)
      .patch(`/barbecues/${barbecueId}/paid-visibility`)
      .set('Authorization', `Bearer ${token}`)
      .send({ showPaidPublicly: true })
      .expect(200);

    const after = await request(http).get(`/public/${slug}`).expect(200);
    expect(after.body.confirmedDetailed).toEqual([{ name: 'Maria', paid: true }]);
  });

  it('desmarcar pago limpa paidAt', async () => {
    const res = await request(http)
      .patch(`/barbecues/${barbecueId}/rsvps/${rsvpId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ paid: false })
      .expect(200);
    expect(res.body.paidCount).toBe(0);
    expect(res.body.rsvps[0].paidAt).toBeNull();
  });
});
