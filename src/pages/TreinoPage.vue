<template>
  <q-page class="treino-page">

    <!-- Result screen -->
    <div v-if="fase === 'resultado'" class="resultado-screen">
      <div class="res-emoji">{{ resultadoEmoji }}</div>
      <h2 class="res-titulo">{{ resultadoTitulo }}</h2>
      <p class="res-sub">{{ acertos }} de {{ total }} acertos!</p>
      <div class="estrelas-row">
        <span v-for="s in 3" :key="s" class="res-star" :class="{ lit: estrelasGanhas >= s }">★</span>
      </div>
      <div class="xp-badge">+{{ xpGanho }} XP!</div>
      <div v-if="videoDesbloqueado" class="unlock-banner">
        🎬 Você desbloqueou um vídeo engraçado!
        <button class="unlock-btn" @click="$router.push('/galeria')">Ver agora</button>
      </div>
      <button class="btn-primary" @click="iniciar">Tentar de novo</button>
      <button class="btn-ghost" @click="$router.push('/home')">Voltar ao início</button>
    </div>

    <!-- Active game -->
    <template v-else-if="fase === 'jogo'">
      <div class="game-header">
        <span class="game-label">Tabuada do {{ n }}</span>
        <div class="progress-dots">
          <span
            v-for="(q, i) in perguntas"
            :key="i"
            class="dot"
            :class="{
              atual: i === atual,
              certa: respostas[i] === true,
              errada: respostas[i] === false
            }"
          />
        </div>
      </div>

      <div class="pergunta-area">
        <div class="pergunta-card" :class="{ shake: animShake, pop: animPop }">
          <p class="pergunta-texto">
            {{ perguntas[atual].a }} × {{ perguntas[atual].b }} = ?
          </p>

          <transition name="fade">
            <div v-if="mostrarTabuada" class="tabuada-hint">
              <p class="hint-label">Tabuada do {{ n }}:</p>
              <div class="tab-linhas">
                <span
                  v-for="i in 10"
                  :key="i"
                  class="tab-linha"
                  :class="{ destaque: i === perguntas[atual].b }"
                >
                  {{ n }} × {{ i }} = {{ n * i }}
                </span>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="input-row">
        <q-input
          v-model="resposta"
          type="number"
          outlined
          inputmode="numeric"
          placeholder="?"
          class="resp-input"
          ref="inputRef"
          @keyup.enter="confirmar"
          :disable="esperando"
        />
        <button class="btn-confirmar" :disabled="!resposta || esperando" @click="confirmar">✓</button>
      </div>

      <div class="teclado">
        <button
          v-for="d in [1,2,3,4,5,6,7,8,9,null,0,'⌫']"
          :key="String(d)"
          class="tecla"
          :class="{ invisible: d === null }"
          @click="tecla(d)"
        >{{ d ?? '' }}</button>
      </div>
    </template>

    <!-- Prep screen -->
    <div v-else class="prep-screen">
      <div class="prep-emoji">🧮</div>
      <h2 class="prep-titulo">Tabuada do {{ n }}</h2>
      <p class="prep-sub">10 perguntas — responda todas corretamente!</p>
      <button class="btn-primary large" @click="iniciar">Começar! 🚀</button>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgressoStore } from 'src/stores/progresso'

const route = useRoute()
const router = useRouter()
const store = useProgressoStore()

const n = parseInt(route.params.n)
const total = 10

const fase = ref('prep')
const perguntas = ref([])
const atual = ref(0)
const respostas = ref([])
const resposta = ref('')
const acertos = ref(0)
const esperando = ref(false)
const mostrarTabuada = ref(false)
const animShake = ref(false)
const animPop = ref(false)
const inputRef = ref(null)
const videoDesbloqueado = ref(false)

const estrelasGanhas = computed(() => {
  if (acertos.value === 10) return 3
  if (acertos.value >= 8) return 2
  if (acertos.value >= 6) return 1
  return 0
})

const xpGanho = computed(() => estrelasGanhas.value * 10)

const resultadoEmoji = computed(() => {
  if (acertos.value === 10) return '🏆'
  if (acertos.value >= 8) return '🎉'
  if (acertos.value >= 6) return '😊'
  return '💪'
})

const resultadoTitulo = computed(() => {
  if (acertos.value === 10) return 'Perfeito! Incrível!'
  if (acertos.value >= 8) return 'Muito bem!'
  if (acertos.value >= 6) return 'Boa tentativa!'
  return 'Continue tentando!'
})

function iniciar() {
  const nums = Array.from({ length: 10 }, (_, i) => i + 1)
  perguntas.value = nums.sort(() => Math.random() - 0.5).map(b => ({ a: n, b }))
  atual.value = 0
  respostas.value = new Array(10).fill(null)
  acertos.value = 0
  resposta.value = ''
  esperando.value = false
  mostrarTabuada.value = false
  animShake.value = false
  animPop.value = false
  fase.value = 'jogo'
  nextTick(() => inputRef.value?.focus())
}

async function confirmar() {
  if (!resposta.value || esperando.value) return
  const r = parseInt(resposta.value)
  const correto = n * perguntas.value[atual.value].b
  esperando.value = true

  if (r === correto) {
    respostas.value[atual.value] = true
    acertos.value++
    animPop.value = true
    setTimeout(() => { animPop.value = false }, 400)
    mostrarTabuada.value = false
    resposta.value = ''
    esperando.value = false
    if (atual.value < total - 1) {
      atual.value++
      await nextTick()
      inputRef.value?.focus()
    } else {
      finalizarJogo()
    }
  } else {
    respostas.value[atual.value] = false
    store.registrarErro(perguntas.value[atual.value].a, perguntas.value[atual.value].b)
    animShake.value = true
    mostrarTabuada.value = true
    setTimeout(() => {
      animShake.value = false
      resposta.value = ''
      esperando.value = false
      inputRef.value?.focus()
    }, 800)
  }
}

function finalizarJogo() {
  const jaDesbloqueado = store.videosDesbloqueados.includes(n)
  store.concluirTabuada(n, estrelasGanhas.value)
  videoDesbloqueado.value = !jaDesbloqueado && estrelasGanhas.value > 0
  fase.value = 'resultado'
}

function tecla(d) {
  if (d === '⌫') {
    resposta.value = resposta.value.slice(0, -1)
  } else if (d !== null) {
    if (resposta.value.length < 4) resposta.value += d.toString()
  }
}
</script>

<style scoped>
.treino-page {
  min-height: 100vh;
  background: var(--c-bg);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* Prep */
.prep-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.prep-emoji { font-size: 5rem; line-height: 1; }
.prep-titulo { font-size: 2.2rem; font-weight: 900; color: var(--c-text); margin: 0; letter-spacing: -0.03em; }
.prep-sub { color: var(--c-text-2); font-size: 0.95rem; }

/* Game header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.game-label {
  font-size: 1rem;
  font-weight: 800;
  color: var(--c-accent2);
}

.progress-dots { display: flex; gap: 6px; }

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-accent1);
  transition: all 0.25s;
}
.dot.atual  { background: var(--c-accent2); box-shadow: 0 0 8px var(--c-accent2); }
.dot.certa  { background: var(--c-success); }
.dot.errada { background: var(--c-error);   }

/* Question card */
.pergunta-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pergunta-card {
  background: var(--c-bg-2);
  border: 1px solid var(--c-accent4);
  border-radius: 24px;
  padding: 36px 24px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  transition: border-color 0.2s;
}

.pergunta-texto {
  font-size: 3rem;
  font-weight: 900;
  color: var(--c-text);
  margin: 0;
  letter-spacing: -0.03em;
  text-align: center;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-10px); }
  75%       { transform: translateX(10px); }
}
@keyframes pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.04); }
  100% { transform: scale(1); }
}

.shake { animation: shake 0.4s ease; border-color: var(--c-error) !important; }
.pop   { animation: pop   0.3s ease; border-color: var(--c-success) !important; }

/* Hint table */
.tabuada-hint {
  width: 100%;
  background: var(--c-accent4);
  border-radius: 14px;
  padding: 14px;
}

.hint-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--c-text-2);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.tab-linhas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.tab-linha {
  font-size: 0.82rem;
  color: var(--c-text-2);
  padding: 3px 6px;
  border-radius: 6px;
  font-weight: 600;
}
.tab-linha.destaque {
  background: var(--c-warning);
  color: #141212;
  font-weight: 900;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Input row */
.input-row {
  display: flex;
  gap: 10px;
  margin: 14px 0 10px;
  align-items: stretch;
}

.resp-input { flex: 1; }

:deep(.q-field__native) {
  font-size: 1.5rem !important;
  font-weight: 900 !important;
  text-align: center !important;
}

.btn-confirmar {
  background: var(--c-accent2);
  color: #fff;
  border: none;
  border-radius: 14px;
  width: 56px;
  font-size: 1.4rem;
  font-weight: 900;
  cursor: pointer;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.btn-confirmar:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-confirmar:not(:disabled):active { opacity: 0.78; }

/* Keyboard */
.teclado {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.tecla {
  background: var(--c-accent1);
  border: 1px solid var(--c-accent4);
  border-radius: 14px;
  padding: 16px 8px;
  font-family: 'Nunito', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--c-text);
  cursor: pointer;
  box-shadow: 0 3px 0 var(--c-accent4);
  transition: background 0.08s, box-shadow 0.08s, transform 0.08s;
  user-select: none;
}
.tecla:active {
  background: var(--c-accent2);
  color: #fff;
  box-shadow: none;
  transform: translateY(3px);
}
.tecla.invisible { visibility: hidden; }

/* Result */
.resultado-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  padding: 24px;
}

.res-emoji  { font-size: 5rem; line-height: 1; }
.res-titulo { font-size: 2rem; font-weight: 900; color: var(--c-text); margin: 0; letter-spacing: -0.02em; }
.res-sub    { color: var(--c-text-2); font-size: 1rem; }

.estrelas-row { display: flex; gap: 10px; font-size: 2.4rem; }
.res-star     { color: var(--c-accent1); transition: color 0.3s; }
.res-star.lit { color: var(--c-warning); }

.xp-badge {
  background: rgba(247, 173, 69, 0.12);
  border: 1px solid rgba(247, 173, 69, 0.3);
  color: var(--c-warning);
  font-weight: 900;
  font-size: 1.1rem;
  padding: 8px 24px;
  border-radius: 20px;
}

.unlock-banner {
  background: rgba(100, 140, 180, 0.1);
  border: 1px solid rgba(100, 140, 180, 0.28);
  color: var(--c-accent2);
  font-weight: 700;
  font-size: 0.88rem;
  padding: 12px 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 320px;
}

.unlock-btn {
  background: var(--c-accent2);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-primary {
  background: var(--c-accent2);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px 32px;
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
  transition: opacity 0.15s;
  letter-spacing: 0.02em;
}
.btn-primary.large { font-size: 1.1rem; padding: 16px 40px; margin-top: 8px; }
.btn-primary:active { opacity: 0.82; }

.btn-ghost {
  background: none;
  color: var(--c-text-2);
  border: 1px solid var(--c-accent4);
  border-radius: 14px;
  padding: 10px 24px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
}
</style>
