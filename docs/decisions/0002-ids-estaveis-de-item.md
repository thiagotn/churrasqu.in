# ADR 0002 — Ids de item estáveis por nome (divergência do protótipo)

**Status:** aceito (fatia 0)

## Contexto

No protótipo, o id de um item da lista é posicional (`medio-3` = 4º item gerado). Os ajustes do usuário (`edits`, `prices`) são chaveados por id. Como a composição da lista muda com a política de bebida e a duração, um id posicional faz o ajuste do usuário "pular" para outro item ao recalcular.

## Decisão

Id = `<tier>-<slugify(nome)>` (ex.: `medio-picanha`), com sufixo numérico só em colisão.

## Consequências

- Edits e preços editados sobrevivem a mudanças de convidados, horário e política de bebida.
- O id é legível em logs/API.
- Renomear um item no catálogo invalida ajustes salvos sobre ele — quando houver persistência (fatia 3), o snapshot salvo guarda o item completo, então isso só afeta rascunhos em edição.
