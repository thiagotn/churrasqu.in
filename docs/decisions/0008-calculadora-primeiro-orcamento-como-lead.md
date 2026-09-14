# ADR 0008 — Calculadora primeiro; orçamento de açougue como lead anônimo

**Status:** aceito (fatia 10)

## Contexto

O wizard pedia endereço, data e horário já na tela 1 e terminava obrigatoriamente em conta → salvar →
link/Pix/RSVP. Quem só queria saber "quanto comprar" desistia no meio. A nova proposta de valor: a
calculadora é livre e sem atrito, e a monetização/utilidade seguinte é **receber orçamentos de açougues
próximos** — só aí faz sentido pedir local, data e contato.

## Decisão

1. **Tela 1 só com o que muda a conta**: pessoas, duração (chips 4h / 6h / 8h) e bebida. Local e data
   saem. O pacote `@churrasquin/calculator` e os DTOs não mudam: o front mantém `startTime`/`endTime`
   (default 12:00) e a duração vira `endTime = start + horas` (`endTimeFor` em `lib/state.ts`).
2. **Duas saídas depois da lista**: principal "Receber orçamentos" (`quote` → `quoteSent`) e secundária
   "Organizar e convidar" (`event` → conta → `saved`, o fluxo das fatias 3–7 intacto). O passo 4 do
   stepper troca de rótulo/tela pelo `branch`.
3. **Pedido de orçamento sem conta**: `POST /api/quote-requests` público grava `QuoteRequest` +
   `QuoteRequestItem` (snapshot da lista, mesmo formato de `BarbecueItem`, via
   `CalculatorService.snapshot`). Contato = nome + WhatsApp (celular BR normalizado em E.164) com
   consentimento explícito obrigatório. Sem GET público — é dado pessoal.
4. **Açougues fora do sistema por enquanto**: a distribuição é manual (psql + `status`). Validar demanda
   antes de construir cadastro de açougues, match por região e envio automático.
5. **Anti-abuso mínimo**: honeypot (`website`) + `@nestjs/throttler` só na rota (5 req/10 min por IP; IP
   real via `cf-connecting-ip`/`x-forwarded-for`, já que a API fica atrás do Cloudflare Tunnel + ingress).
   Limite ajustável por `QUOTE_RATE_LIMIT`.

## Consequências

- Os defaults fictícios do estado ("Churras da Laje", endereço, Pix) saíram; os campos são digitados.
- O throttler guarda contadores em memória por réplica — com 1 réplica da API basta; escalar exige
  storage compartilhado (Redis) ou limite no edge (Cloudflare).
- Headers de IP são forjáveis por quem chama a API direto; é contenção de spam casual, não segurança.
- Próximas fatias naturais: cadastro de açougues com área (CEP/raio), painel para eles responderem e
  notificação ao cliente pelo WhatsApp.
