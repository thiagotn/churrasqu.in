# Documentação — churrasqu.in

Como esta documentação se organiza:

| Onde | O quê |
|---|---|
| [`roadmap.md`](./roadmap.md) | **Fonte da verdade do progresso.** Tabela de fatias com status `TODO / WIP / DONE` e ponteiro para a fatia atual. |
| [`go-live.md`](./go-live.md) | Checklist das dependências pendentes para colocar o app no ar (CI write-back, GHCR, Cloudflare, secrets no cluster, DNS). |
| [`slices/`](./slices/) | Um arquivo por fatia de entrega: objetivo, escopo, checklist detalhado, decisões locais e como verificar. O checklist (`[ ]`/`[x]`) é atualizado junto com o código. |
| [`decisions/`](./decisions/) | ADRs (Architecture Decision Records) numerados — decisões que valem para o projeto todo e o porquê delas. |

Convenções:

- **Status de fatia:** `TODO` (não começou), `WIP` (em andamento — no máximo uma por vez), `DONE` (código + testes + doc atualizados).
- Cada fatia termina com um commit próprio; o histórico do git conta a mesma história que o roadmap.
- O handoff de design em [`../design_handoff_churrasquin/README.md`](../design_handoff_churrasquin/README.md) é a especificação de UI/regras — as fatias referenciam seções dele em vez de copiá-las.
