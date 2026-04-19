# Tabuada do Neto

App educativo de tabuada para crianças, construído em **Vue 3 + Quasar + Vite**.  
Publicado em: https://fred512.github.io/tabuadalegal  
Repositório: https://github.com/fred512/tabuadalegal

---

## Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Quasar 2** (componentes UI: `q-dialog`, `q-layout`, `q-page`, etc.)
- **Pinia** (store de progresso)
- **Vue Router 4** (hash history)
- **Vite** (build tool)
- **Sass** (via quasar)
- **Fonte:** Nunito (Google Fonts)

---

## Estrutura de pastas

```
src/
  pages/
    EntradaPage.vue   # Tela de boas-vindas / cadastro de jogador
    HomePage.vue      # Dashboard com grid de tabuadas + botão reset
    TreinoPage.vue    # Jogo de treino por tabuada (parâmetro :n)
    DesafioPage.vue   # Desafio cronometrado com tabuadas variadas
    RevisaoPage.vue   # Revisão das multiplicações mais erradas
    GaleriaPage.vue   # Galeria de vídeos desbloqueáveis
  layouts/
    MainLayout.vue    # Header + bottom nav (usado em todas exceto Entrada)
  stores/
    progresso.js      # Store Pinia — persiste tudo em localStorage
  data/
    avatares.js       # Lista de avatares emoji disponíveis
    videos.js         # Dados dos 20 vídeos (10 tabuada + 10 bônus)
  css/
    app.scss          # CSS variables (paleta) + overrides globais Quasar
  router/index.js     # Rotas + guard (redireciona para / se sem playerName)
```

---

## Design system

Tema **escuro** com paleta derivada de `#5c5c5c`. Todas as cores são CSS variables definidas em `src/css/app.scss`:

| Variable | Valor | Uso |
|---|---|---|
| `--c-bg` | `#141212` | Fundo das páginas |
| `--c-bg-2` | `#242122` | Cards / superfícies elevadas |
| `--c-text` | `#E7E4E4` | Texto principal |
| `--c-text-2` | `#A19B9B` | Texto secundário / labels |
| `--c-accent1` | `#4D4242` | Teclas do teclado / fundos sutis |
| `--c-accent2` | `#648CB4` | Ação principal (azul aço) |
| `--c-accent3` | `#B88C61` | Acento Desafio (âmbar) |
| `--c-accent4` | `#3E3232` | Bordas / painéis escuros |
| `--c-success` | `#5FB962` | Acerto / Revisão |
| `--c-error` | `#DD6E6E` | Erro / shake |
| `--c-warning` | `#F7AD45` | Estrelas / XP badge |

**Regra:** sempre usar variáveis CSS, nunca cores hard-coded nos componentes.

---

## Lógica de negócio (store `progresso.js`)

- **Progresso** salvo em `localStorage` com key `tabuada_neto_v1`
- Cada tabuada (1–10) tem até 3 estrelas (`estrelas[n]`)
- Vídeos 1–10 desbloqueiam ao completar a tabuada correspondente
- Vídeos 11–20 (bônus) desbloqueiam ao completar todas as 10 tabuadas
- **Desafio:** ≥8 acertos libera todos os vídeos por 24h (`todosBloqueadosAte`)
- XP: +10×estrelas por treino, +5×acertos por desafio, +3×acertos por revisão
- Streak diário atualizado a cada sessão

---

## Rotas

| Path | Componente | Layout |
|---|---|---|
| `/` | EntradaPage | sem layout |
| `/home` | HomePage | MainLayout |
| `/treino/:n` | TreinoPage | MainLayout |
| `/desafio` | DesafioPage | MainLayout |
| `/galeria` | GaleriaPage | MainLayout |
| `/revisao` | RevisaoPage | MainLayout |

Guard: se `playerName` não estiver salvo, redireciona para `/`.

---

## Deploy

- **Plataforma:** GitHub Pages
- **CI:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Trigger:** push na branch `master`
- **Build:** `npm run build` → pasta `dist/`
- **Base path:** `/tabuadalegal/` (configurado em `vite.config.js`)
- Deploy automático a cada commit

---

## Comandos úteis

```bash
npm run dev      # Dev server em localhost:9000
npm run build    # Build de produção → dist/
git push         # Faz deploy automático via GitHub Actions
```

---

## Decisões e histórico

- Inputs de resposta usam `<input>` nativo (não `q-input`) por compatibilidade com mobile
- Bottom nav usa `<button>` + `useRoute` ao invés de `q-tabs` para controle total do estilo
- Teclado numérico tem `box-shadow: 0 3px 0` para simular tecla física
- Cores de cada tabuada no grid: array `CORES` em `HomePage.vue` (10 cores distintas)
- Botão "Resetar progresso" fica no final do `HomePage` com dialog de confirmação
