<template>
  <q-page class="desafio-page">

    <!-- Result screen -->
    <div v-if="fase === 'resultado'" class="resultado-screen">
      <div class="res-emoji">{{ resultadoEmoji }}</div>
      <h2 class="res-titulo">{{ resultadoTitulo }}</h2>
      <p class="res-sub">{{ acertos }} de 10 acertos!</p>
      <div class="tempo-info">⏱️ Tempo: {{ tempoFormatado }}</div>
      <div class="xp-badge">+{{ xpGanho }} XP!</div>

      <div v-if="aprovado" class="unlock-banner">
        🎬 Todos os vídeos liberados por 24h!
        <button class="unlock-btn" @click="$router.push('/galeria')">Ver galeria</button>
      </div>

      <div class="acertos-grid">
        <div
          v-for="(p, i) in perguntas"
          :key="i"
          class="acerto-item"
          :class="resultados[i] ? 'certo' : 'errado'"
        >
          <span>{{ p.a }}×{{ p.b }}={{ p.a * p.b }}</span>
          <span>{{ resultados[i] ? '✓' : '✗' }}</span>
        </div>
      </div>

      <button class="btn-primary" @click="iniciar">Tentar de novo</button>
      <button class="btn-ghost" @click="$router.push('/home')">Início</button>
    </div>

    <!-- Active game -->
    <template v-else-if="fase === 'jogo'">
      <div class="game-header">
        <div class="game-info">
          <span class="game-label">Desafio</span>
          <span class="pergunta-count">{{ atual + 1 }}/10</span>
        </div>
        <div class="timer-box" :class="{ urgente: tempoSegundos > 0 && tempoSegundos < 10 }">
          ⏱️ {{ tempoFormatado }}
        </div>
      </div>

      <div class="progress-dots">
        <span
          v-for="(p, i) in perguntas"
          :key="i"
          class="dot"
          :class="{
            atual: i === atual,
            certa: resultados[i] === true,
            errada: resultados[i] === false
          }"
        />
      </div>

      <div class="pergunta-area">
        <div class="pergunta-card" :class="{ shake: animShake, pop: animPop }">
          <div class="tabuada-tag">Tabuada do {{ perguntas[atual].a }}</div>
          <p class="pergunta-texto">{{ perguntas[atual].a }} × {{ perguntas[atual].b }} = ?</p>

          <transition name="fade">
            <div v-if="mostrarTabuada" class="tabuada-hint">
              <p class="hint-label">Tabuada do {{ perguntas[atual].a }}:</p>
              <div class="tab-linhas">
                <span
                  v-for="i in 10"
                  :key="i"
                  class="tab-linha"
                  :class="{ destaque: i === perguntas[atual].b }"
                >
                  {{ perguntas[atual].a }} × {{ i }} = {{ perguntas[atual].a * i }}
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
      <div class="prep-emoji">🏆</div>
      <h2 class="prep-titulo">Desafio!</h2>
      <p class="prep-sub">10 multiplicações de tabuadas diferentes.<br/>Acerte 8 ou mais para liberar todos os vídeos!</p>
      <div class="aviso-card">
        ⚡ Qualquer tabuada pode cair. Treine bem antes!
      </div>
      <button class="btn-primary large" @click="iniciar">Começar! 🚀</button>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressoStore } from 'src/stores/progresso'

const store = useProgressoStore()
const router = useRouter()

const fase = ref('prep')
const perguntas = ref([])
const atual = ref(0)
const resultados = ref([])
const resposta = ref('')
const acertos = ref(0)
const esperando = ref(false)
const mostrarTabuada = ref(false)
const animShake = ref(false)
const animPop = ref(false)
const inputRef = ref(null)

const tempoSegundos = ref(0)
let timerInterval = null

const tempoFormatado = computed(() => {
  const m = Math.floor(tempoSegundos.value / 60)
  const s = tempoSegundos.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

const aprovado = computed(() => acertos.value >= 8)

const resultadoEmoji = computed(() => {
  if (acertos.value === 10) return '🏆'
  if (acertos.value >= 8) return '🎉'
  if (acertos.value >= 6) return '😊'
  return '💪'
})

const resultadoTitulo = computed(() => {
  if (acertos.value === 10) return 'Perfeito! Incrível!'
  if (acertos.value >= 8) return 'Desafio superado!'
  if (acertos.value >= 6) return 'Quase lá!'
  return 'Treine mais e tente de novo!'
})

const xpGanho = computed(() => acertos.value * 5)

function iniciar() {
  const perg = []
  const usados = new Set()
  while (perg.length < 10) {
    const a = Math.floor(Math.random() * 10) + 1
    const b = Math.floor(Math.random() * 10) + 1
    const key = `${a}x${b}`
    if (!usados.has(key)) {
      usados.add(key)
      perg.push({ a, b })
    }
  }
  perguntas.value = perg
  atual.value = 0
  resultados.value = new Array(10).fill(null)
  acertos.value = 0
  resposta.value = ''
  esperando.value = false
  mostrarTabuada.value = false
  tempoSegundos.value = 0
  fase.value = 'jogo'
  timerInterval = setInterval(() => { tempoSegundos.value++ }, 1000)
  nextTick(() => inputRef.value?.focus())
}

async function confirmar() {
  if (!resposta.value || esperando.value) return
  const r = parseInt(resposta.value)
  const p = perguntas.value[atual.value]
  const correto = p.a * p.b
  esperando.value = true

  if (r === correto) {
    resultados.value[atual.value] = true
    acertos.value++
    animPop.value = true
    setTimeout(() => { animPop.value = false }, 400)
    mostrarTabuada.value = false
    resposta.value = ''
    esperando.value = false
    if (atual.value < 9) {
      atual.value++
      await nextTick()
      inputRef.value?.focus()
    } else {
      finalizar()
    }
  } else {
    resultados.value[atual.value] = false
    store.registrarErro(p.a, p.b)
    animShake.value = true
    mostrarTabuada.value = true
    setTimeout(async () => {
      animShake.value = false
      mostrarTabuada.value = false
      resposta.value = ''
      esperando.value = false
      if (atual.value < 9) {
        atual.value++
        await nextTick()
        inputRef.value?.focus()
      } else {
        finalizar()
      }
    }, 2000)
  }
}

function finalizar() {
  clearInterval(timerInterval)
  store.concluirDesafio(acertos.value)
  fase.value = 'resultado'
}

function tecla(d) {
  if (d === '⌫') {
    resposta.value = resposta.value.slice(0, -1)
  } else if (d !== null) {
    if (resposta.value.length < 4) resposta.value += d.toString()
  }
}

onUnmounted(() => clearInterval(timerInterval))
</script>

<style scoped>
.desafio-page {
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

.prep-emoji  { font-size: 5rem; line-height: 1; }
.prep-titulo { font-size: 2.2rem; font-weight: 900; color: var(--c-text); margin: 0; letter-spacing: -0.03em; }
.prep-sub    { color: var(--c-text-2); font-size: 0.92rem; line-height: 1.6; }

.aviso-card {
  background: rgba(184, 140, 97, 0.1);
  border: 1px solid rgba(184, 140, 97, 0.28);
  border-radius: 14px;
  padding: 10px 18px;
  font-size: 0.84rem;
  color: var(--c-accent3);
  font-weight: 700;
}

/* Game header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.game-info { display: flex; align-items: center; gap: 8px; }
.game-label { font-weight: 800; color: var(--c-accent3); font-size: 1rem; }
.pergunta-count { font-size: 0.82rem; color: var(--c-text-2); font-weight: 700; }

.timer-box {
  background: var(--c-accent4);
  border: 1px solid var(--c-accent1);
  border-radius: 12px;
  padding: 5px 12px;
  font-weight: 900;
  color: var(--c-text);
  font-size: 0.88rem;
  transition: all 0.3s;
}
.timer-box.urgente {
  border-color: var(--c-error);
  color: var(--c-error);
  animation: pulsar 0.5s infinite;
}

@keyframes pulsar {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.06); }
}

.progress-dots {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  justify-content: center;
}

.dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--c-accent1);
  transition: all 0.25s;
}
.dot.atual  { background: var(--c-accent3); box-shadow: 0 0 8px var(--c-accent3); }
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
  padding: 28px 20px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s;
}

.tabuada-tag {
  background: rgba(184, 140, 97, 0.15);
  color: var(--c-accent3);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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

/* Input */
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
  background: var(--c-accent3);
  color: #141212;
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
  background: var(--c-accent3);
  color: #141212;
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
  gap: 12px;
  text-align: center;
  padding: 20px;
}

.res-emoji  { font-size: 5rem; line-height: 1; }
.res-titulo { font-size: 1.9rem; font-weight: 900; color: var(--c-text); margin: 0; letter-spacing: -0.02em; }
.res-sub    { color: var(--c-text-2); font-size: 1rem; }
.tempo-info { color: var(--c-text-2); font-size: 0.88rem; }

.xp-badge {
  background: rgba(247, 173, 69, 0.12);
  border: 1px solid rgba(247, 173, 69, 0.3);
  color: var(--c-warning);
  font-weight: 900;
  font-size: 1.05rem;
  padding: 7px 22px;
  border-radius: 20px;
}

.unlock-banner {
  background: rgba(100, 140, 180, 0.1);
  border: 1px solid rgba(100, 140, 180, 0.28);
  color: var(--c-accent2);
  font-weight: 700;
  font-size: 0.88rem;
  padding: 10px 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.unlock-btn {
  background: var(--c-accent2);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.acertos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  width: 100%;
  max-width: 320px;
}

.acerto-item {
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  gap: 4px;
}
.certo  { background: rgba(95, 185, 98, 0.15);  color: var(--c-success); }
.errado { background: rgba(221, 110, 110, 0.15); color: var(--c-error);   }

.btn-primary {
  background: var(--c-accent3);
  color: #141212;
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
  max-width: 280px;
  width: 100%;
}
</style>
