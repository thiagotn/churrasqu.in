# ADR 0008 — Calculadora primeiro; orçamento de açougue como lead anônimo

**Status:** aceito (fatia 10)

## Contexto

O wizard pedia endereço, data e horário já na tela 1 e terminava obrigatoriamente em conta → salvar →
link/Pix/RSVP. Quem só queria saber "quanto comprar" desistia no meio. A nova proposta de valor: a
calculadora é livre e sem atrito, e a monetização/utilidade seguinte é **receber orçamentos de açougues
próximos** — só aí faz sentido pedir local, data e contato.

## Decisão

1. **Tela 1 só com as pessoas**: local, data, duração e a pergunta de bebida saem — o foco é o que o açougue vende. **A lista sugerida não gera mais a categoria
   Bebidas** (removida de `buildBaseList`, junto com `beerPerAdultL`); `alcoholMode` vira legado: segue
   aceito no DTO/banco e rotula o convite, mas não muda a lista (front fixa `'byob'`). O catálogo no banco
   nunca teve bebidas. Snapshots já salvos com Bebidas continuam exibidos no convite; reabrir e salvar um
   churras antigo recalcula sem elas.
   **Duração não é perguntada, mas entra na conta fixa em 6h** (`DEFAULT_DURATION_HOURS`: faixa de 5–6h,
   carne +12%; 4h→8h mudaria a carne de 4,5 para 6 kg num churras de 14 pessoas). O contrato não muda: o
   front manda `startTime`/`endTime` (default 12:00–18:00) e, ao digitar o início no orçamento/convite, o
   fim acompanha mantendo a duração (`endTimeFor`); churras retomados mantêm a duração salva.
   **Passo 1 em tela única** (proposta aprovada no canvas "Calculadora em Tela Única"): pessoas →
   "Próximo" → as pessoas viram uma linha editável (lápis / "Editar pessoas") e o "Tipo de churrasco"
   (Básico/Médio/Gourmet com total estimado) aparece na mesma tela; escolher um tipo abre os itens. A tela
   de Padrão deixou de existir; o stepper tem 3 passos (1 · Churras / 2 · Itens / 3 · Orçamento|Convidar).
   Saíram o "Resumo rápido" e a foto do quintal.
2. **Duas saídas depois da lista**: principal "Receber orçamentos" (`quote` → `quoteSent`) e secundária
   "Organizar e convidar" (`event` → conta → `saved`, o fluxo das fatias 3–7 intacto). O passo 3 do
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
