# Handoff: churrasqu.in — Calculadora de Churrasco

## Overview
Aplicação web responsiva que calcula o custo de um churrasco a partir do número de convidados (homens, mulheres, crianças), endereço, horário de início/fim e política de bebida alcoólica. Sugere três listas de compras por nível (Básico `$`, Médio `$$`, Gourmet `$$$`), permite editar quantidades **e preços unitários** item a item, remover itens e adicionar extras. Para salvar e compartilhar, o usuário se cadastra; então gera um link público (`https://churrasqu.in/c/<slug>`), QR Code e chave Pix para rateio, com página pública de convite + RSVP.

Stack alvo definida pelo usuário: **NestJS** (backend, arquitetura testável, deploy em cluster k8s homelab) + **TailwindCSS** no frontend.

## About the Design Files
Os arquivos deste bundle são **referências de design criadas em HTML** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar**. `Churras Calc.dc.html` usa um runtime proprietário de prototipagem (`<x-dc>`, `<sc-for>`, `<sc-if>`, estilos inline) que **não deve ser portado**.

A tarefa é **recriar estes designs no ambiente do codebase alvo** com seus padrões estabelecidos. Como ainda não há codebase, a recomendação é:

- **Backend:** NestJS (REST + Prisma/TypeORM, PostgreSQL), modular por domínio, testes unitários (Jest) + e2e (Supertest).
- **Frontend:** Next.js (App Router) + React + TailwindCSS + TypeScript. Todos os valores inline do protótipo devem ser convertidos em **classes Tailwind** e tokens no `tailwind.config.ts`.
- Deploy: Dockerfile multi-stage por serviço + manifests/Helm chart para o cluster k8s.

## Fidelity
**High-fidelity (hifi).** Cores, tipografia, espaçamentos, estados e cópia (em pt-BR) são finais. Recrie a UI fielmente. O único conteúdo provisório são os **preços de referência** dos itens (devem vir do backend/seed) e o texto de exemplo dos campos de evento.

---

## Design Tokens

### Cores
| Token | Hex | Uso |
|---|---|---|
| `ink` | `#17130F` | Contornos (bordas 3–4px), sombras duras, texto principal, barras de cabeçalho de grupo, footer do grill |
| `paper` | `#FFF8EA` | Fundo de cards, inputs, texto sobre fundos escuros |
| `cream` | `#F2E6D0` | Fundo da página, fundo de sub-blocos |
| `ember` (vermelho) | `#C2341F` | CTA primário, badges, acentos, links, cifrões, total |
| `ember-hover` | `#E2402A` | Hover do CTA vermelho |
| `mustard` (amarelo) | `#F2B22E` | Card de resumo, nível ativo, hover de botões secundários, destaques |
| `sky` (azul) | `#2C5FA8` | Seleção de horário/modo de bebida, botão de auth, card de Pix |
| `muted` | `#7A6A55` | Labels, textos de apoio |
| `body-text` | `#4A3E31` | Parágrafos secundários |
| `cover-dark` | `#A82A17` | (legado) fundo da capa antes da imagem |

Transparências usadas: `#17130F1A` (divisores), `#17130F33`, `#17130F55` (linhas pontilhadas), `#17130F66` (bordas dashed), `#FFF8EA55`, `#FFF8EA22`.

### Tipografia
- **Display:** `Bangers` (Google Fonts) — títulos, números grandes, totais, nomes de nível, logo. `letter-spacing: 1–2px`, `line-height: 0.92–1`.
- **Texto:** `Nunito` (400/600/700/900) — corpo, labels, botões, inputs.
- **Mono:** `ui-monospace, monospace` — link público, chave Pix.
- Escala display: `clamp(22px,3vw,28px)` → `clamp(44px,6vw,62px)`.
- Labels de campo: 12px / 900 / `letter-spacing: 1.5px` / uppercase / cor `muted`.
- Corpo: 14–16px, peso 700–900.

### Espaçamento
Gaps: 3, 6, 8, 10, 12, 14, 16, 18, 20, 22px + fluidos `clamp(16px,2.4vw,28px)`. Padding de card: `clamp(18px,2.5vw,30px)`. Padding da página: `clamp(14px,3vw,36px) clamp(12px,3vw,40px) 80px`.

### Bordas, raios e sombras (assinatura do estilo)
- Bordas: `3px solid #17130F` (elementos internos), `4px solid #17130F` (cards e CTAs).
- Sombras **duras, sem blur**: `4px 4px 0`, `5px 5px 0`, `8px 8px 0`, `10px 10px 0` — sempre `#17130F` (no card escuro, `#C2341F`).
- Raios: `0` na maioria (estilo gibi), `10–12px` em botões steppers, `999px` em chips e pills, `50%` no selo do logo.
- **Hover padrão de CTA:** `transform: translate(3px,3px)` + sombra reduzida (ex.: `8px 8px 0` → `5px 5px 0`) — simula o botão sendo pressionado.
- **Hover de botão secundário:** troca de fundo `#FFF8EA` → `#F2B22E`.

### Fundo da página
`background-color: #F2E6D0` + dois `radial-gradient` de pontos halftone:
`radial-gradient(#17130F1F 1.4px, transparent 1.5px)` e `radial-gradient(#C2341F14 1.4px, transparent 1.5px)`, ambos `background-size: 18px 18px`, offsets `0 0` e `9px 9px`.

---

## Screens / Views

O protótipo é uma SPA com 6 telas controladas por `screen`. Um **stepper** horizontal fica no topo (abaixo do header) com 4 pills: `1 · Convidados`, `2 · Nível`, `3 · Lista`, `4 · Compartilhar`.
- Pill atual: fundo `ink`, texto `paper`.
- Pill concluída: fundo `mustard`, texto `ink`.
- Pill futura: fundo `paper`, texto `#8A7A66`.
- Todas: borda 3px, `border-radius: 999px`, sombra `3px 3px 0`, 900/13px. Só é clicável para trás (ou até a etapa 3).

### Header (global)
Flex com wrap, `justify-content: space-between`.
- **Logo:** selo circular 66px, borda 4px `ink`, sombra `5px 5px 0 ink`, fundo `cream`, padding 5px, com `assets/logo.png` em `object-fit: contain`.
- **Wordmark:** `CHURRASQU` em `ink` + `.IN` em `ember`, Bangers `clamp(30px,5vw,44px)`, `line-height: 0.92`.
- **Tagline:** "Ninguém paga a mais. Ninguém passa fome." — 13px/700/uppercase/`letter-spacing: 2px`/`muted`.
- **Direita:** quando logado, pill com avatar circular 26px (fundo `sky`, inicial em Bangers) + nome; sempre um botão pill "Começar de novo".

### 1. Setup — "Quem vai?"
Grid `repeat(auto-fit, minmax(min(100%,300px), 1fr))` — coluna esquerda com o formulário, direita com resumo + ilustração.

**Card do formulário** (borda 4px, sombra `10px 10px 0`, fundo `paper`), seções:

1. **"1. Quem vai?"** — grid `auto-fit minmax(min(100%,150px),1fr)` com 3 steppers (Homens / Mulheres / Crianças). Cada um: caixa borda 3px fundo `cream`, título 13px/900/uppercase, botão `−` 44×44 (fundo `paper`) + número em Bangers 42px + botão `+` 44×44 (fundo `ember`, texto `paper`), ambos raio 12px e sombra `3px 3px 0`; hint abaixo (`~420 g de carne`, `~320 g`, `~200 g`). Defaults: 6 / 5 / 3. Mínimo 0.
2. **"2. Onde vai ser?"** — inputs de texto: **Endereço** (largura total), depois grid de 2: **Bairro** e **Referência**. Inputs: altura 50px, borda 3px, fundo `#FFF`, padding lateral 14px, 700/16px, `width:100%; min-width:0`.
3. **"3. Que dia e a que horas começa?"** — grid de 3: **Data** (`type=date`), **Começa** (`type=time`), **Termina** (`type=time`). Defaults: `2026-09-19`, `12:30`, `19:00`.
4. **"4. E a bebida alcoólica?"** — bloco com borda `3px dashed #17130F66`, fundo `cream`. Grid `auto-fit minmax(min(100%,180px),1fr)` com 4 botões (título 900/15px + hint 700/12px, borda 3px, sombra `4px 4px 0`; ativo = fundo `sky` / texto `paper`):
   - `Entra no rateio` — "Cerveja e afins na lista de compras" (default)
   - `Cada um leva a sua` — "Fora do rateio — só gelo e cooler"
   - `Compra no bar do local` — "Consumação paga individualmente"
   - `Sem álcool` — "Só sucos e refrigerante"
   Se `bar` selecionado, revela linha "Gasto médio no bar do local" com input `R$ [60] / adulto` (fora do rateio).
5. **CTA:** "Calcular meu churras →" — borda 4px, fundo `ember`, texto `paper`, Bangers `clamp(24px,3vw,32px)`, sombra `8px 8px 0`.

**Coluna direita:**
- **Card "Resumo rápido"** (fundo `mustard`, sombra `10px 10px 0`): linhas Convidados / Carne estimada / Local / Horário separadas por `3px dotted #17130F55`; abaixo, caixa `paper` com o aviso da política de bebida.
- **Card com ilustração** `assets/quintal.jpeg` (altura `clamp(180px,26vw,280px)`, `object-fit: cover`, borda inferior 4px) + dica sobre gramagem por pessoa.

### 2. Tiers — "Escolha o nível do churras"
Cabeçalho com título Bangers `clamp(32px,5vw,48px)` + subtítulo `N convidados · X,X kg de carne · Bairro` e botão "← Ajustar pessoas".
Grid `auto-fit minmax(min(100%,270px),1fr)` com 3 cards (borda 4px, sombra `10px 10px 0`; **ativo = fundo `mustard`**, inativo = `paper`):
- Linha 1: nome em Bangers `clamp(30px,4vw,40px)` + **cifrões** em Bangers `clamp(22px,3vw,30px)` cor `ember` (`$`, `$$`, `$$$`); à direita, **badge** (borda 3px, 11px/900/uppercase, fundo `ink` se ativo senão `ember`, texto `paper`): `churras básico`, `caiu o VR`, `faria limer`.
- Pitch (700, `body-text`, min-height 46px).
- Caixa `paper` borda 3px: "TOTAL ESTIMADO" + valor em Bangers `clamp(34px,4.6vw,46px)` + "R$ X por adulto" em `ember`.
- Lista de highlights: bullets circulares 9px `ember` com borda 2px + cortes do nível + "N acompanhamentos" + tipo de carvão.
- Botão: "Escolher <nível>" (ou "Editar esta lista →" se ativo) — Bangers 22px, sombra `5px 5px 0`.

### 3. Edit — "Lista <Nível>"
Grid de 2 colunas (`auto-fit minmax(min(100%,320px),1fr)`); coluna direita é `position: sticky; top: 16px`.

**Coluna esquerda** — um card por categoria, na ordem **Carnes, Bebidas, Acompanhamentos, Essenciais** (categorias vazias não aparecem):
- Cabeçalho: fundo `ink`, texto `paper`, nome em Bangers 26px + subtotal 800/15px.
- Cada linha de item (borda inferior `2px #17130F1A`, flex com wrap):
  - Esquerda: nome 900/16px; abaixo, unidade (`por kg` / `por un` / `por kit` / `por saco` / `por dz`) + `R$` + **input de preço unitário editável** (82×34, borda 3px, centralizado, 900/14px; aceita `89,90`).
  - Direita: `−` 40×40 / **input de quantidade** 72×40 / `+` 40×40 (raio 10px, fundo `cream`, hover `mustard`); total do item 900 alinhado à direita (min-width 92px); botão `✕` 40×40 remover (texto `ember`, hover fundo `ember` + texto `paper`).
  - Step: `0.5` para unidade `kg`, `1` para as demais. Mínimo = step.
- **Bloco "Bora incluir mais?"** (borda dashed): chips pill `+ <item> · R$ X` para cada item opcional desligado; clicar adiciona com a quantidade sugerida.
- Botão "Restaurar sugestão" no topo: limpa quantidades **e** preços editados.

**Coluna direita:**
- **Card de total** (fundo `ember`, texto `paper`, sombra `10px 10px 0`): "TOTAL DO CHURRAS" + valor em Bangers `clamp(44px,6vw,62px)`; linhas Por adulto / Itens na lista / Carne total.
- CTA "Salvar e compartilhar" (fundo `mustard`, Bangers, sombra `8px 8px 0`).
- Botão "← Trocar nível da lista".
- Nota: "Salvar exige uma conta rapidinha — é o que garante que o link do seu churras continue no ar."

### 4. Auth
Grid de 2 colunas centralizado.
- **Card `paper`:** título ("Crie sua conta" / "Bem-vindo de volta"), subtítulo, **tabs** segmentadas (borda 3px, sem raio; ativa = fundo `ink`/texto `paper`): `Criar conta` | `Já tenho conta`. Campos: signup = Seu nome / E-mail / Senha; login = E-mail / Senha (altura 50px). CTA fundo `sky`, texto `paper`, Bangers, sombra `7px 7px 0`. Link "← Voltar para a lista".
- **Card `sky`:** "Com a conta você pode…" + 4 bullets (marcador 10px `mustard`): salvar/reaproveitar listas; gerar link `churrasqu.in/c/…`; QR Code com Pix e valor por pessoa; ver quem confirmou e quem pagou.

### 5. Share
- **Faixa `mustard`** (sombra `10px 10px 0`): "Churras salvo! Agora é só espalhar." + linha `Total X · Y por adulto · N convidados` + botão "Ver página pública" (fundo `ink`, texto `paper`, sombra `6px 6px 0 #C2341F`).
- Grid de 3 cards (`auto-fit minmax(min(100%,290px),1fr)`):
  1. **Dados do evento:** Nome do churras; grid Data/Começa/Termina; Endereço; grid Bairro/Referência (altura 48px).
  2. **Link público:** caixa mono com `churrasqu.in/c/<slug>-8f2a` (ellipsis, `nowrap`) + botão "Copiar link" (fundo `ember`) que troca para "Copiado!" por 1.6s. Divisor. **Chave Pix:** chips `Celular | CPF | E-mail | Aleatória` (ativo = `sky`) que trocam o placeholder/valor, input da chave, e caixa dashed "Cobrar por adulto" com o valor em Bangers 30px.
  3. **QR Code** (fundo `ink`, texto `paper`, sombra `8px 8px 0 #C2341F`): QR em grade 25×25 (`aspect-ratio: 1`, máx. 240px, moldura `paper` 10px), legenda e botão "Baixar QR em PNG" (fundo `mustard`).

### 6. Public — página pública do convite
- Barra de prévia dashed com a URL + botão "← Voltar ao compartilhamento" (apenas no protótipo; na app real esta rota é pública e sem essa barra).
- **Hero `ember`** (borda 4px, sombra `10px 10px 0`): imagem `assets/invite-cover.jpeg` (`clamp(150px,22vw,230px)`, `cover`, borda inferior 4px); abaixo "VOCÊ FOI CONVIDADO" (12px/900/uppercase), nome do evento em Bangers `clamp(34px,6vw,58px)`, linha de data/horário (`Sábado, 19/09 · começa 12:30 · até 19:00`) e endereço completo (`Endereço — Bairro — Referência`); à direita, badge `mustard` "SUA PARTE" + valor por adulto em Bangers 38px.
- Grid de 3 cards:
  1. **"O que vai ter":** por categoria, nome em 12px/900/uppercase `ember` + lista de itens separada por ` · `; caixa `mustard` com o aviso da política de bebida; linha final "Total" em Bangers 26px.
  2. **"Pague sua parte no Pix"** (fundo `sky`): QR (máx. 210px), caixa mono com `Tipo · chave` (`word-break: break-all`), botão "Copiar chave Pix" → "Chave copiada!" (1.6s), "Organizado por <nome>".
  3. **"Você vai?"**: chips `Vou!` / `Vou levar alguém` / `Não vou` (ativo = `ember`), nota dinâmica conforme resposta, divisor, "CONFIRMADOS" + pills com nomes.
- **Footer global:** "Protótipo de design · churrasqu.in" + "Preços de referência — ajuste conforme seu mercado." (13px/700/`muted`, borda superior `3px #17130F33`).

---

## Interactions & Behavior
- Navegação por `screen`; stepper permite voltar, não avançar além do progresso.
- "Salvar e compartilhar" → se não autenticado, vai para **Auth**; após submit, vai direto para **Share** (no protótipo o auth é fake).
- Steppers de pessoas, chips de bebida, data/hora e endereço **recalculam tudo instantaneamente**, inclusive os 3 totais dos cards de nível.
- Editar preço ou quantidade recalcula subtotal da categoria, total, por adulto e "Carne total".
- Remover item o retira da lista e o devolve como chip em "Bora incluir mais?".
- Copiar link / Pix: feedback textual temporário de 1.6s.
- Hover: CTAs deslocam `3px,3px` e reduzem a sombra; secundários mudam para `mustard`.
- **Responsivo:** todos os grids usam `repeat(auto-fit, minmax(min(100%, Npx), 1fr))`; labels usam `grid-template-columns: minmax(0,1fr)` e inputs `width:100%; min-width:0` para não transbordar. Tudo colapsa em coluna única no mobile. Alvos de toque ≥ 40px.
- Não há loading/erro no protótipo: **defina** skeletons nos cards de nível, validação de formulário (e-mail válido, senha ≥ 8, ao menos 1 adulto, horário final ≠ inicial, chave Pix válida por tipo) e estados de erro no padrão visual (borda `ember` + mensagem 13px/900 `ember`).

## State Management
Estado do protótipo (converter em store/servidor):

| Estado | Default | Observação |
|---|---|---|
| `screen` | `setup` | `setup, tiers, edit, auth, share, public` |
| `men, women, kids` | 6, 5, 3 | inteiros ≥ 0 |
| `eventDay, startTime, endTime` | `2026-09-19`, `12:30`, `19:00` | duração derivada, vira 24h se negativa; clamp 1–14h |
| `eventAddress, eventCity, eventHint` | textos de exemplo | endereço completo = join por ` — ` |
| `alcoholMode` | `lista` | `lista, byob, bar, none` |
| `barSpend` | `60` | só usado em `bar`, fora do rateio |
| `tier` | `medio` | `basico, medio, gourmet` |
| `edits` | `{}` | `{itemId: qty}`; `null` = removido |
| `prices` | `{}` | `{itemId: preçoUnitário}` |
| `loggedIn, userName, form` | false / '' | auth |
| `eventName` | `Churras da Laje` | gera o slug do link |
| `pixType, pixKey` | `Celular`, `(11) 98888-1234` | |
| `copied, copiedPix` | false | timeout 1.6s |
| `rsvp` | null | `Vou!, Vou levar alguém, Não vou` |

### Regras de cálculo (portar para o domínio no NestJS)
```
carneBaseKg = (homens*0.42 + mulheres*0.32 + criancas*0.20) * stretch
stretch = horas >= 7 ? 1.25 : horas >= 5 ? 1.12 : 1
gourmet: carne * 1.05
adultos = homens + mulheres ; convidados = adultos + criancas
```
- Cada corte tem uma **proporção** `p` da carne total (ex.: Médio → Picanha 0.34, Costela 0.24, Linguiça 0.20, Asinha 0.22). Quantidade em kg arredondada para múltiplos de 0.5 (mínimo 0.5); unidades arredondadas para cima (mínimo 1).
- **Bebida (`alcoholMode = lista`)**, com `beerPerAdultL = 1.5` (parametrizável): Básico → lata 350ml; Médio → long neck 355ml + kit caipirinha (`adultos/10`); Gourmet → IPA 600ml + Malbec (`adultos/6`) + espumante (`adultos/10`). `none` → suco concentrado (`convidados/4`). Sempre: refrigerante 2L (`convidados*0.55/2`), água, gelo (`convidados/6*stretch`).
- **Acompanhamentos:** fator por convidado ou por adulto (ex.: pão de alho 1/convidado, farofa 1/6, vinagrete 1/8, maionese 1/8 kg).
- **Essenciais:** carvão (`carne/5`), sal grosso (`carne/8`), descartáveis (`convidados/10`), acendedor+alumínio (1); se duração ≥ 7h, "Gelo extra e reposição de carvão" (R$ 42).
- **Itens opcionais** do nível vêm desligados e aparecem como sugestões.
- `total = Σ(qtd × preçoUnitário)` dos itens ativos; `porAdulto = total / adultos`.
- Slug do link: `eventName` → lowercase, sem acentos, `[^a-z0-9]+ → '-'`, sufixo curto aleatório (`-8f2a` no mock).

## Assets
Em `assets/` (geradas por IA de imagens, no estilo gibi da marca):
- `logo.png` — 733×733, **fundo transparente**, espeto com 3 bifes sobre churrasqueira com chamas. Usar no header e como base do favicon/app icon.
- `quintal.jpeg` — 1600×1100, cena do quintal (card da home).
- `invite-cover.jpeg` — 2400×800, capa panorâmica (hero do convite público).
- `texture.jpeg` — 600×600, textura halftone **não usada** (veio com xadrez impresso; se quiser textura de fundo, gerar um PNG realmente transparente).
- `logo.jpeg` — logo antigo, pode ser descartado.
- Fontes: Google Fonts `Bangers` e `Nunito` (400/600/700/900).
- Ícones: nenhum — o protótipo usa apenas glifos (`−`, `+`, `✕`, `→`, `←`).
- **QR Code:** no protótipo é um mock decorativo (grade 25×25 pseudoaleatória com os 3 marcadores). Em produção use uma lib real (ex.: `qrcode`) e o **payload Pix EMV (BR Code)** com chave, valor por adulto e identificador do evento.

## Sugestão de arquitetura (NestJS)
```
src/
  main.ts  app.module.ts
  common/           # filtros, interceptors, pipes de validação (class-validator)
  config/           # @nestjs/config + schema de env
  modules/
    auth/           # JWT + refresh, guards, bcrypt/argon2
    users/
    catalog/        # itens, preços de referência, níveis (seed)
    barbecues/      # evento: pessoas, endereço, horário, política de bebida
    shopping-list/  # snapshot de itens (qty + preço) por evento
    calculator/     # DOMÍNIO PURO: regras acima, sem dependência de IO → 100% testável
    sharing/        # slug, link público, QR, payload Pix
    rsvp/
  database/         # Prisma schema + migrations + seed
test/               # e2e (Supertest)
```
- `calculator` como módulo puro (funções/serviços sem repositório) — alvo principal dos testes unitários: gramagem por perfil, stretch por duração, arredondamentos, cada `alcoholMode`, total e rateio.
- Persistir o **snapshot** da lista (nome, unidade, qty, preço no momento) — preços de referência mudam; o evento salvo não deve mudar.
- Endpoints sugeridos: `POST /auth/*`, `GET /catalog/tiers`, `POST /barbecues/estimate` (público, sem salvar), `POST/GET/PATCH /barbecues`, `GET /public/:slug`, `GET /public/:slug/qrcode`, `POST /public/:slug/rsvp`.
- k8s: Deployment + Service + Ingress (TLS para `churrasqu.in`), HPA, `ConfigMap`/`Secret` para env, probes em `/health` (`@nestjs/terminus`), migrations como Job/initContainer.

## Files
- `Churras Calc.dc.html` — protótipo completo (referência visual e de comportamento; runtime proprietário, não portar).
- `assets/` — imagens listadas acima.
- `support.js` — runtime do protótipo, **ignorar**.
