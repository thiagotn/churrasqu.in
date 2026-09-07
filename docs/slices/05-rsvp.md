# Fatia 5 — RSVP

**Status: DONE**

## Objetivo

Convidado confirma presença na página pública e o organizador vê quem vai.

## Checklist

- [x] Modelo `Rsvp` (migration `rsvp`) — nome, resposta (`vou | levo-alguem | nao-vou`), token secreto por convidado
- [x] `POST /public/:slug/rsvp`: cria a resposta e devolve o token; com token, **atualiza** a própria resposta sem duplicar (sem conta para o convidado)
- [x] `GET /public/:slug` passa a incluir `confirmed` (quem vai; `+1` para quem leva alguém; `nao-vou` fica de fora)
- [x] Front (tela 6): input de nome + chips `Vou! / Vou levar alguém / Não vou` (ativo = ember), nota dinâmica por resposta, pills de confirmados; token/nome guardados em `localStorage` por slug para reeditar
- [x] e2e: confirmar, +1, trocar resposta via token, validações — 4 testes
- [x] Roadmap atualizado + commit

## Como verificar

```bash
npm test
# ou no browser: abrir /c/<slug>, responder, recarregar — a resposta persiste e os confirmados atualizam
```

## Notas

- "Quem pagou" (visão do organizador) segue fora de escopo — candidata a fatia 7 junto com um painel "meus churras" (a API `GET /barbecues` já lista).
