<template>
  <q-page class="revisao-page">

    <!-- Result screen -->
    <div v-if="fase === 'resultado'" class="resultado-screen">
      <div class="res-emoji">{{ acertos === total ? '🌟' : '💪' }}</div>
      <h2 class="res-titulo">{{ acertos === total ? 'Arrasou!' : 'Bom trabalho!' }}</h2>
      <p class="res-sub">{{ acertos }} de {{ total }} acertos!</p>
      <div class="xp-badge">+{{ acertos * 3 }} XP!</div>
      <button class="btn-primary" @click="iniciar">Revisar de novo</button>
      <button class="btn-ghost" @click="$router.push('/home')">Início</button>
    </div>

    <!-- Active game -->
    <template v-else-if="fase === 'jogo'">
      <div class="game-header">
        <span class="game-label">🔁 Revisão</span>
        <span class="pergunta-count">{{ atual + 1 }}/{{ total }}</span>
      </div>

      <div class="pergunta-area">
        <div class="pergunta-card" :class="{ shake: animShake, pop: animPop }">
          <div class="erro-badge">
            ⚠️ Errado {{ perguntas[atual].erros }}×
          </div>
          <p class="pergunta-texto">
            {{ perguntas[atual].a }} × {{ perguntas[atual].b }} = ?
          </p>

          <transition name="fade">
            <div v-if="mostrarTabuada" class="tabuada-hint">
              <p class="hint-label">Resposta: <strong style="color: var(--c-success)">{{ perguntas[atual].a * perguntas[atual].b }}</strong></p>
              <p class="hint-sub">Tabuada do {{ perguntas[atual].a }}:</p>
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
      <template v-if="store.maisErradas.length === 0">
        <div class="prep-emoji">🌟</div>
        <h2 class="prep-titulo">Nada para revisar!</h2>
        <p class="prep-sub">Você ainda não errou nenhuma multiplicação.<br/>Treine as tabuadas primeiro!</p>
        <button class="btn-primary large" @click="$router.push('/home')">Ir treinar</button>
      </template>

      <template v-else>
        <div class="prep-emoji">🔁</div>
        <h2 class="prep-titulo">Modo Revisão</h2>
        <p class="prep-sub">Pratique as multiplicações que você mais errou!</p>

        <div class="erros-preview">
          <div v-for="e in store.maisErradas.slice(0, 5)" :key="e.mult" class="erro-item">
            <span class="erro-mult">{{ e.mult.replace('x', ' × ') }}</span>
            <span class="erro-count">{{ e.erros }} erro{{ e.erros > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <button class="btn-primary large" @click="iniciar">Começar revisão</button>
      </template>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressoStore } from 'src/stores/progresso'

const store = useProgressoStore()
const router = useRouter()

const fase = ref('prep')
const perguntas = ref([])
const atual = ref(0)
const total = computed(() => perguntas.value.length)
const resposta = ref('')
const acertos = ref(0)
const esperando = ref(false)
const mostrarTabuada = ref(false)
const animShake = ref(false)
const animPop = ref(false)
const inputRef = ref(null)

function iniciar() {
  perguntas.value = store.maisErradas.slice(0, 10).map(e => {
    const [a, b] = e.mult.split('x').map(Number)
    return { a, b, erros: e.erros }
  })
  atual.value = 0
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
  const p = perguntas.value[atual.value]
  const correto = p.a * p.b
  esperando.value = true

  if (r === correto) {
    acertos.value++
    animPop.value = true
    setTimeout(() => { animPop.value = false }, 400)
    mostrarTabuada.value = false
    resposta.value = ''
    esperando.value = false
    if (atual.value < total.value - 1) {
      atual.value++
      await nextTick()
      inputRef.value?.focus()
    } else {
      store.xp += acertos.value * 3
      fase.value = 'resultado'
    }
  } else {
    store.registrarErro(p.a, p.b)
    animShake.value = true
    mostrarTabuada.value = true
    setTimeout(async () => {
      animShake.value = false
      resposta.value = ''
      esperando.value = false
      if (atual.value < total.value - 1) {
        atual.value++
        mostrarTabuada.value = false
        await nextTick()
        inputRef.value?.focus()
      } else {
        store.xp += acertos.value * 3
        fase.value = 'resultado'
      }
    }, 2500)
  }
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
.revisao-page {
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

.erros-preview {
  background: var(--c-bg-2);
  border: 1px solid var(--c-accent4);
  border-radius: 16px;
  padding: 12px;
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.erro-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 10px;
  background: var(--c-accent4);
  border-radius: 10px;
}

.erro-mult  { font-weight: 800; color: var(--c-error); font-size: 0.9rem; }
.erro-count { font-size: 0.74rem; color: var(--c-text-2); font-weight: 700; }

/* Game header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.game-label    { font-weight: 800; font-size: 0.92rem; color: var(--c-success); }
.pergunta-count { font-size: 0.82rem; color: var(--c-text-2); font-weight: 700; }

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

.erro-badge {
  background: rgba(221, 110, 110, 0.12);
  color: var(--c-error);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
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
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--c-text-2);
  margin-bottom: 4px;
}
.hint-sub {
  font-size: 0.72rem;
  color: var(--c-text-2);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
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
  background: var(--c-success);
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
  background: var(--c-success);
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
  gap: 14px;
  text-align: center;
  padding: 24px;
}

.res-emoji  { font-size: 5rem; line-height: 1; }
.res-titulo { font-size: 2rem; font-weight: 900; color: var(--c-text); margin: 0; letter-spacing: -0.02em; }
.res-sub    { color: var(--c-text-2); font-size: 1rem; }

.xp-badge {
  background: rgba(247, 173, 69, 0.12);
  border: 1px solid rgba(247, 173, 69, 0.3);
  color: var(--c-warning);
  font-weight: 900;
  font-size: 1rem;
  padding: 7px 22px;
  border-radius: 20px;
}

.btn-primary {
  background: var(--c-success);
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
