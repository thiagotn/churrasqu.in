# Fatia 4 — Sharing: slug, link público, QR Code e Pix

**Status: TODO**

## Objetivo

Telas 5 (Share) e 6 (página pública do convite): link `churrasqu.in/c/<slug>`, QR Code real e chave Pix com payload EMV.

## Escopo previsto

- Módulo `sharing`: slug único por evento (`slugify(eventName)` + sufixo — já existe em `packages/calculator`), `GET /public/:slug` (dados do convite sem auth), `GET /public/:slug/qrcode`.
- QR Code com lib real (`qrcode`) — o do protótipo é decorativo.
- **Payload Pix EMV (BR Code)** com chave, valor por adulto e identificador do evento; validação de chave por tipo (Celular/CPF/E-mail/Aleatória).
- Front tela 5: faixa "Churras salvo!", card de dados do evento (nome/data/endereço editáveis), card link público (copiar com feedback 1.6s) + chave Pix por tipo, card QR (baixar PNG).
- Front tela 6 (rota pública `/c/[slug]`): hero ember com `invite-cover.jpeg`, "O que vai ter" por categoria, card Pix (copiar chave), badge "SUA PARTE".

## Checklist

- [ ] Módulo sharing + endpoints públicos
- [ ] Gerador/validador de payload Pix EMV com testes (CRC16 incluso)
- [ ] QR Code real (endpoint PNG + download no front)
- [ ] Tela 5 Share
- [ ] Rota pública `/c/[slug]` (tela 6, sem a barra de prévia do protótipo)
- [ ] Roadmap atualizado + commit
