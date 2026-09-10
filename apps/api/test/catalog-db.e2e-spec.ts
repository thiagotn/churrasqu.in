import 'dotenv/config';
import { execSync } from 'node:child_process';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// Catálogo servido do banco (fatia 8): preço editado no banco muda a estimativa,
// sem redeploy. O seed é idempotente e restaura os valores de referência.
describe('Catálogo no banco (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  const estimateBody = {
    men: 6, women: 5, kids: 3, startTime: '12:30', endTime: '19:00',
    alcoholMode: 'lista', tier: 'medio',
  };

  beforeAll(async () => {
    // seed 2x prova idempotência; depois muta o preço da picanha DIRETO no banco
    execSync('node prisma/seed.cjs', { cwd: __dirname + '/..', stdio: 'pipe' });
    const count1 = await prisma.catalogItem.count();
    execSync('node prisma/seed.cjs', { cwd: __dirname + '/..', stdio: 'pipe' });
    expect(await prisma.catalogItem.count()).toBe(count1);

    await prisma.catalogItem.update({
      where: { tierId_kind_name: { tierId: 'medio', kind: 'cut', name: 'Picanha' } },
      data: { unitPriceCents: 99900 }, // R$ 999,00
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    // restaura os preços de referência
    execSync('node prisma/seed.cjs', { cwd: __dirname + '/..', stdio: 'pipe' });
    await prisma.$disconnect();
    await app.close();
  });

  it('GET /catalog/tiers serve o banco (preço mutado aparece)', async () => {
    const res = await request(app.getHttpServer()).get('/catalog/tiers').expect(200);
    const medio = res.body.find((t: { id: string }) => t.id === 'medio');
    const picanha = medio.cuts.find((c: { name: string }) => c.name === 'Picanha');
    expect(picanha.unitPrice).toBe(999);
  });

  it('estimate usa o catálogo do banco', async () => {
    const res = await request(app.getHttpServer())
      .post('/barbecues/estimate')
      .send(estimateBody)
      .expect(201);
    const picanha = res.body.items.find((i: { id: string }) => i.id === 'medio-picanha');
    expect(picanha.unitPrice).toBe(999);
    // 2kg de picanha no cenário padrão → diferença de preço reflete no total
    expect(res.body.total).toBeGreaterThan(2000);
  });
});
