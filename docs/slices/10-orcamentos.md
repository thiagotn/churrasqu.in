# Fatia 10 — Calculadora primeiro + pedido de orçamento a açougues

**Status: DONE** — ver [ADR 0008](../decisions/0008-calculadora-primeiro-orcamento-como-lead.md).

## Objetivo

A calculadora vira a porta de entrada sem atrito (sem local, data, hora ou conta). Depois da lista, o
usuário escolhe receber orçamentos de açougues próximos — e só então informa local, data, hora e
WhatsApp. O convite (link, Pix, RSVP) segue disponível como caminho secundário.

## Checklist

- [x] Tela 1: remove "Onde vai ser?" e "Que dia e a que horas?"; adiciona duração (4h / 6h / 8h) que ajusta `endTime`
- [x] Tela 1 sem a pergunta de bebida alcoólica (`alcoholMode` fixo em `byob` no front)
- [x] Lista no desktop: nome do item nunca truncado (quebra linha; linha única só em xl, coluna do total com largura fixa)
- [x] CTA de orçamento em verde WhatsApp com o ícone (lista, barra mobile e envio do formulário)
- [x] Tela 3: CTA principal "Receber orçamentos de açougues", secundário "Organizar e convidar a galera"; barra mobile com "Pedir orçamento"
- [x] `EventFields` compartilhado (data, início, CEP, bairro/cidade, endereço e referência opcionais) — usado no orçamento, no evento e no Compartilhar
- [x] Telas novas: `quote` (#orcamento), `quoteSent` (#orcamento-enviado), `event` (#evento); `ListSummary` por categoria
- [x] Stepper com passo 4 dinâmico por `branch`; hash/histórico não abre `saved`/`quoteSent` sem o que os precede (`canOpen`)
- [x] Migration `quote_requests`: `QuoteRequest` + `QuoteRequestItem`
- [x] `CalculatorService.snapshot` extraído de `BarbecuesService` e reusado
- [x] `common/phone.ts` (`normalizeBrPhone` para Pix, `normalizeBrMobile` para WhatsApp)
- [x] `POST /api/quote-requests` público: validação, consentimento, data não passada, honeypot, throttle 5/10 min por IP
- [x] e2e `quotes.e2e-spec.ts` (gravação, rejeições, honeypot, rate limit) + unit de phone e snapshot
- [x] Verificado no browser headless (400px e desktop): orçamento completo e convite com conta → link

## Como verificar

```bash
docker compose up -d db && npm test
npm run dev:api & npm run dev:web
# home → Calcular → Padrão → Lista → "Receber orçamentos" → preencher → "Pedido enviado"
docker exec churrasquin-db-1 psql -U churrasquin -d churrasquin \
  -c 'select id, "contactName", whatsapp, cep, "eventDay", status from "QuoteRequest" order by "createdAt" desc limit 5;'
```

## Operação (enquanto a distribuição é manual)

```sql
-- pedidos novos com a lista
select q.id, q."contactName", q.whatsapp, q.cep, q."eventCity", q."eventDay", q."startTime",
       i.category, i.name, i.qty, i.unit
from "QuoteRequest" q join "QuoteRequestItem" i on i."quoteRequestId" = q.id
where q.status = 'novo' order by q."createdAt", i.category;
-- depois de repassar aos açougues
update "QuoteRequest" set status = 'enviado' where id = '<id>';
```

## Notas

- Produção: a migration roda no initContainer (`migrate deploy`) como as anteriores; nada novo no homelab
  além de, opcionalmente, `QUOTE_RATE_LIMIT`.
- Próximas fatias: cadastro de açougues com área de atendimento, match por CEP, painel de resposta e
  aviso ao cliente pelo WhatsApp.
