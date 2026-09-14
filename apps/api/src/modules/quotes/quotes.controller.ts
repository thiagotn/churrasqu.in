import { Body, Controller, Injectable, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { QuotesService } from './quotes.service';

/** Atrás do Cloudflare Tunnel + ingress o req.ip é do proxy: limita pelo IP real do cliente. */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const forwarded = String(req.headers?.['x-forwarded-for'] ?? '').split(',')[0].trim();
    return req.headers?.['cf-connecting-ip'] || forwarded || req.ip;
  }
}

@Controller('quote-requests')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  /** Público, sem conta: grava o pedido de orçamento (lead). Sem GET público — tem dado pessoal. */
  @UseGuards(ClientIpThrottlerGuard)
  @Post()
  create(@Body() dto: CreateQuoteRequestDto) {
    return this.quotes.create(dto);
  }
}
