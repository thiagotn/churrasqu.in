# Fatia 4 — Sharing: slug, link público, QR Code e Pix

**Status: DONE**

## Objetivo

Telas 5 (Share) e 6 (página pública do convite): link `churrasqu.in/c/<slug>`, QR Code real e chave Pix com payload EMV.

## Checklist

- [x] Módulo `sharing`: `GET /public/:slug` (convite, sem auth, sem preços por item/ids/dono) e `GET /public/:slug/qrcode` (PNG)
- [x] Payload **Pix EMV (BR Code)** com CRC16 validado contra o vetor de exemplo do manual do BCB (`1D3D`) + normalização/validação de chave por tipo — `sharing/pix.ts`, 10 testes de unidade
- [x] Chave Pix (tipo + chave) salva no barbecue; chave inválida para o tipo → 400
- [x] QR com a lib `qrcode`: com Pix salvo codifica a cobrança (valor por adulto + txid = slug); sem Pix, o link do convite
- [x] Tela 5 Share: faixa mustard, dados do evento editáveis (PATCH), link + copiar (1.6s), chips de tipo de chave, "cobrar por adulto", card QR ink com download PNG
- [x] Tela 6 pública em `/c/[slug]`: hero ember com capa, "O que vai ter" por categoria, aviso da política de bebida, card Pix (QR + copia e cola), skeleton de loading e estado de erro/404
- [x] e2e: convite público, payload no convite, PNG, 404, Pix inválido — 5 testes
- [x] Roadmap atualizado + commit

## Como verificar

```bash
npm test
npm run dev:api & npm run dev:web
# salvar um churras logado → tela Share → "Ver página pública" abre /c/<slug>
curl -s localhost:3001/api/public/<slug> | jq .pix.payload   # cole num app de banco para conferir
```

## Notas

- O card "Você vai?" (RSVP) da tela 6 é a fatia 5.
- O QR do protótipo era decorativo; o real codifica o BR Code — testável apontando a câmera do app do banco.
