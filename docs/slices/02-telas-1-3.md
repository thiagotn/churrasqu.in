# Fatia 2 — Telas 1–3 no front (Setup, Nível, Lista)

**Status: TODO**

## Objetivo

As três primeiras telas do fluxo, hifi conforme o handoff (§ Screens 1–3), com recálculo instantâneo no cliente usando `@churrasquin/calculator`.

## Escopo

- Header global (logo, wordmark, tagline, "Começar de novo") + stepper de 4 pills (navegável só para trás/até a etapa 3).
- **Tela 1 Setup:** steppers Homens/Mulheres/Crianças, endereço (Endereço/Bairro/Referência), data + horários, 4 políticas de bebida (com campo "gasto no bar" condicional), card "Resumo rápido" (mustard) e card de ilustração (`quintal.jpeg`).
- **Tela 2 Nível:** 3 cards com badge, pitch, total estimado por nível, R$/adulto, highlights; ativo em mustard.
- **Tela 3 Lista:** cards por categoria (Carnes, Bebidas, Acompanhamentos, Essenciais), linha de item com preço unitário editável (aceita vírgula), stepper de quantidade (step 0.5 p/ kg), remover (✕), chips "Bora incluir mais?", "Restaurar sugestão", coluna direita sticky com total/por adulto/itens/carne total.
- Estado do fluxo em um client component (useReducer), espelhando a tabela "State Management" do handoff.
- Assets copiados para `apps/web/public/assets/`.
- CTA "Salvar e compartilhar" leva a um placeholder até a fatia 3 (auth).

**Fora de escopo:** validação de formulário com estados de erro (entra com auth na fatia 3, quando "salvar" passa a existir de verdade), skeletons (não há IO no fluxo 1–3).

## Checklist

- [ ] Header + stepper + fundo halftone
- [ ] Tela 1 Setup completa e responsiva
- [ ] Tela 2 Nível com totais reativos por nível
- [ ] Tela 3 Lista com edição de qty/preço, remoção, chips e restaurar
- [ ] Hover/interações da assinatura visual (translate 3px + sombra reduzida, secundário → mustard)
- [ ] `next build` passa
- [ ] Roadmap atualizado + commit

## Como verificar

```bash
npm run dev:web   # http://localhost:3000 — fluxo setup → nível → lista com totais reagindo
```
