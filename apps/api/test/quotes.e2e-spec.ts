import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ClientIpThrottlerGuard } from '../src/modules/quotes/quotes.controller';
import { PrismaService } from '../src/prisma/prisma.service';

// Exige o Postgres do docker-compose de pé: `docker compose up -d db`
describe('Pedido de orçamento (e2e)', () => {
  const nextYear = new Date().getFullYear() + 1;
  const validBody = {
    men: 6,
    women: 5,
    kids: 3,
    startTime: '12:00',
    endTime: '18:00',
    alcoholMode: 'lista',
    tier: 'medio',
    adjustments: { edits: { 'medio-picanha': null } },
    contactName: 'Zé do Churras',
    whatsapp: '(11) 98888-1234',
    consent: true,
    eventDay: `${nextYear}-03-14`,
    cep: '01310-100',
    eventCity: 'Bela Vista, São Paulo',
    eventAddress: 'Av. Paulista, 1000',
  };

  const boot = async (throttle: boolean) => {
    const builder = Test.createTestingModule({ imports: [AppModule] });
    if (!throttle) builder.overrideGuard(ClientIpThrottlerGuard).useValue({ canActivate: () => true });
    const app = (await builder.compile()).createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    return app;
  };

  describe('validação e gravação', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    const createdIds: string[] = [];

    beforeAll(async () => {
      app = await boot(false);
      prisma = app.get(PrismaService);
    });

    afterAll(async () => {
      await prisma.quoteRequest.deleteMany({ where: { id: { in: createdIds } } });
      await app.close();
    });

    it('grava o pedido com snapshot da lista e telefone normalizado', async () => {
      const res = await request(app.getHttpServer()).post('/quote-requests').send(validBody).expect(201);
      createdIds.push(res.body.id);
      expect(Object.keys(res.body).sort()).toEqual(['createdAt', 'id']);

      const saved = await prisma.quoteRequest.findUniqueOrThrow({
        where: { id: res.body.id },
        include: { items: true },
      });
      expect(saved.whatsapp).toBe('+5511988881234');
      expect(saved.cep).toBe('01310100');
      expect(saved.status).toBe('novo');
      expect(saved.items.length).toBeGreaterThan(0);
      expect(saved.items.map((i) => i.itemId)).not.toContain('medio-picanha');
      expect(saved.totalCents).toBe(saved.items.reduce((a, i) => a + Math.round(i.qty * i.unitPriceCents), 0));
    });

    it('rejeita WhatsApp inválido, sem consentimento, data passada, CEP ruim e sem adultos', async () => {
      const http = app.getHttpServer();
      for (const patch of [
        { whatsapp: '11 3333-4444' },
        { consent: false },
        { eventDay: '2020-01-01' },
        { cep: '123' },
        { eventCity: '' },
        { men: 0, women: 0 },
      ]) {
        await request(http).post('/quote-requests').send({ ...validBody, ...patch }).expect(400);
      }
    });

    it('honeypot preenchido responde 201 sem gravar', async () => {
      const before = await prisma.quoteRequest.count();
      await request(app.getHttpServer())
        .post('/quote-requests')
        .send({ ...validBody, website: 'http://spam.example' })
        .expect(201);
      expect(await prisma.quoteRequest.count()).toBe(before);
    });
  });

  describe('rate limit', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await boot(true);
    });

    afterAll(async () => {
      await app.close();
    });

    it('bloqueia o 6º pedido do mesmo IP em 10 min', async () => {
      const http = app.getHttpServer();
      // payload inválido (400) também conta — e não suja o banco
      for (let i = 0; i < 5; i++) {
        await request(http).post('/quote-requests').set('cf-connecting-ip', '203.0.113.9').send({}).expect(400);
      }
      await request(http).post('/quote-requests').set('cf-connecting-ip', '203.0.113.9').send({}).expect(429);
      await request(http).post('/quote-requests').set('cf-connecting-ip', '203.0.113.10').send({}).expect(400);
    });
  });
});
