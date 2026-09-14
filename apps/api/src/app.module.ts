import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { BarbecuesModule } from './modules/barbecues/barbecues.module';
import { CalculatorModule } from './modules/calculator/calculator.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { SharingModule } from './modules/sharing/sharing.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CalculatorModule,
    CatalogModule,
    BarbecuesModule,
    SharingModule,
    QuotesModule,
  ],
})
export class AppModule {}
