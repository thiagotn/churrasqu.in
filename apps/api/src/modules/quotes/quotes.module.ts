import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CalculatorModule } from '../calculator/calculator.module';
import { ClientIpThrottlerGuard, QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [
    CalculatorModule,
    // Anti-abuso mínimo do formulário público: 5 pedidos a cada 10 min por IP
    ThrottlerModule.forRoot([{ ttl: 10 * 60_000, limit: Number(process.env.QUOTE_RATE_LIMIT ?? 5) }]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService, ClientIpThrottlerGuard],
})
export class QuotesModule {}
