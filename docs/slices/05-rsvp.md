# Fatia 5 — RSVP

**Status: TODO**

## Objetivo

Convidado confirma presença na página pública e o organizador vê quem vai.

## Escopo previsto

- Módulo `rsvp`: `POST /public/:slug/rsvp` (nome + resposta `Vou! / Vou levar alguém / Não vou`), listagem de confirmados no `GET /public/:slug`.
- Sem conta para o convidado — identificação leve (nome + token local para editar a própria resposta).
- Front (tela 6): card "Você vai?" com chips, nota dinâmica por resposta, pills de confirmados.
- Visão do organizador (tela 5 ou detalhe do evento): contagem de confirmados; "quem pagou" fica para depois (fora de escopo desta fatia).

## Checklist

- [ ] Endpoint de RSVP + persistência
- [ ] Confirmados na página pública
- [ ] Chips + nota dinâmica no front
- [ ] Roadmap atualizado + commit
