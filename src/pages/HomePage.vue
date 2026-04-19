<template>
  <q-page class="home-page">

    <!-- Progress card -->
    <div class="progress-card">
      <div class="progress-row">
        <span class="progress-label">Progresso geral</span>
        <span class="progress-count">{{ store.totalConcluidas }}/10 tabuadas</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: (store.totalConcluidas / 10 * 100) + '%' }" />
      </div>
    </div>

    <!-- All done banner -->
    <div v-if="store.todasConcluidas" class="done-banner">
      <span>🏆 Você dominou todas as tabuadas!</span>
      <button class="cert-btn" @click="verCertificado">Ver certificado</button>
    </div>

    <div class="acoes-row">
      <p class="section-title">Escolha uma tabuada:</p>
      <button class="btn-trocar" @click="$router.push('/')">👤 Trocar jogador</button>
    </div>

    <!-- Table grid -->
    <div class="tabuadas-grid">
      <button
        v-for="n in 10"
        :key="n"
        class="tab-card"
        :style="{ '--card-color': CORES[n - 1] }"
        @click="$router.push(`/treino/${n}`)"
      >
        <span class="tab-num">×{{ n }}</span>
        <div class="tab-stars">
          <span v-for="s in 3" :key="s" class="star" :class="{ lit: (store.estrelas[n] || 0) >= s }">★</span>
        </div>
        <span class="tab-status">{{ statusLabel(n) }}</span>
      </button>
    </div>

    <!-- Reset button -->
    <div class="reset-area">
      <button class="btn-reset" @click="confirmarReset = true">🗑️ Resetar progresso</button>
    </div>

    <!-- Reset confirmation -->
    <q-dialog v-model="confirmarReset">
      <div class="reset-dialog">
        <div class="reset-icon">⚠️</div>
        <h3 class="reset-titulo">Resetar tudo?</h3>
        <p class="reset-texto">Todo o progresso, XP, estrelas e vídeos desbloqueados serão apagados. Essa ação não pode ser desfeita.</p>
        <div class="reset-actions">
          <button class="btn-reset-confirm" @click="fazerReset">Sim, resetar</button>
          <button class="btn-reset-cancel" @click="confirmarReset = false">Cancelar</button>
        </div>
      </div>
    </q-dialog>

    <!-- Certificate modal -->
    <q-dialog v-model="showCert">
      <div class="cert-card">
        <div class="cert-emoji">🏆</div>
        <h2 class="cert-title">Certificado de Campeão</h2>
        <p class="cert-name">{{ store.playerName }}</p>
        <p class="cert-text">concluiu todas as 10 tabuadas com maestria!</p>
        <div class="cert-date">{{ dataAtual }}</div>
        <div class="cert-actions">
          <button class="cert-btn-print" @click="imprimir">Imprimir</button>
          <button class="cert-btn-close" @click="showCert = false">Fechar</button>
        </div>
      </div>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useProgressoStore } from 'src/stores/progresso'

const store = useProgressoStore()
const showCert = ref(false)
const confirmarReset = ref(false)

function fazerReset() {
  store.resetar()
  confirmarReset.value = false
}

const CORES = [
  '#DD6E6E', '#F7AD45', '#CCAB89', '#5FB962', '#72A4D9',
  '#648CB4', '#B88C61', '#80A1C2', '#A09797', '#E7E4E4',
]

const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

function statusLabel(n) {
  const e = store.estrelas[n] || 0
  if (e >= 3) return 'Perfeito!'
  if (e >= 2) return 'Ótimo!'
  if (e >= 1) return 'Bom!'
  return 'Treinar'
}

function verCertificado() { showCert.value = true }
function imprimir() { window.print() }
</script>

<style scoped>
.home-page {
  padding: 16px;
  background: var(--c-bg);
  min-height: 100vh;
}

/* Progress card */
.progress-card {
  background: var(--c-bg-2);
  border: 1px solid var(--c-accent4);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.progress-count {
  font-size: 0.85rem;
  font-weight: 900;
  color: var(--c-accent2);
}

.progress-track {
  height: 7px;
  background: var(--c-accent4);
  border-radius: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--c-accent2);
  border-radius: 8px;
  transition: width 0.5s ease;
  min-width: 4px;
}

/* Done banner */
.done-banner {
  background: rgba(247, 173, 69, 0.1);
  border: 1px solid rgba(247, 173, 69, 0.28);
  border-radius: 14px;
  padding: 12px 16px;
  color: var(--c-warning);
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.cert-btn {
  background: var(--c-warning);
  color: #141212;
  border: none;
  border-radius: 8px;
  padding: 5px 12px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.74rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}



/* Table grid */
.tabuadas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 480px) {
  .tabuadas-grid { grid-template-columns: repeat(3, 1fr); }
}

.tab-card {
  position: relative;
  background: var(--c-bg-2);
  border: 1px solid var(--c-accent4);
  border-radius: 18px;
  padding: 20px 12px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  transition: transform 0.14s, box-shadow 0.14s;
}

.tab-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--card-color);
}

.tab-card:active { transform: scale(0.94); }

.tab-num {
  font-size: 2.1rem;
  font-weight: 900;
  color: var(--card-color);
  letter-spacing: -0.03em;
  line-height: 1;
}

.tab-stars { display: flex; gap: 3px; }

.star {
  font-size: 0.95rem;
  color: var(--c-accent1);
  transition: color 0.2s;
}
.star.lit { color: var(--c-warning); }

.tab-status {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Certificate modal */
.cert-card {
  background: var(--c-bg-2);
  border: 1px solid var(--c-accent4);
  border-radius: 24px;
  padding: 36px 24px;
  text-align: center;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
}

.cert-emoji { font-size: 3.5rem; line-height: 1; }
.cert-title { font-size: 1.2rem; font-weight: 900; color: var(--c-warning); margin: 12px 0 6px; letter-spacing: -0.02em; }
.cert-name { font-size: 1.5rem; font-weight: 900; color: var(--c-text); margin: 0; }
.cert-text { color: var(--c-text-2); font-size: 0.88rem; margin: 6px 0 14px; }
.cert-date { font-size: 0.76rem; color: var(--c-text-2); margin-bottom: 22px; }

.cert-actions { display: flex; gap: 10px; justify-content: center; }

.cert-btn-print {
  background: var(--c-accent2);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  cursor: pointer;
}

.reset-area {
  text-align: center;
  margin-top: 24px;
  padding-bottom: 8px;
}

.btn-reset {
  background: none;
  border: none;
  color: var(--c-error);
  font-family: 'Nunito', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.15s;
  padding: 4px 8px;
}
.btn-reset:hover { opacity: 1; }

.reset-dialog {
  background: var(--c-bg-2);
  border: 1px solid var(--c-accent4);
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  width: 300px;
  max-width: 90vw;
}

.reset-icon  { font-size: 2.5rem; }
.reset-titulo { font-size: 1.1rem; font-weight: 900; color: var(--c-text); margin: 10px 0 8px; }
.reset-texto  { font-size: 0.84rem; color: var(--c-text-2); line-height: 1.5; margin-bottom: 20px; }
.reset-actions { display: flex; flex-direction: column; gap: 8px; }

.btn-reset-confirm {
  background: var(--c-error);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-reset-cancel {
  background: var(--c-accent4);
  color: var(--c-text-2);
  border: 1px solid var(--c-accent1);
  border-radius: 12px;
  padding: 10px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.cert-btn-close {
  background: var(--c-accent4);
  color: var(--c-text-2);
  border: 1px solid var(--c-accent1);
  border-radius: 10px;
  padding: 10px 20px;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  cursor: pointer;
}

.acoes-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-weight: 700;
  color: var(--c-text-2);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0;
}

.btn-trocar {
  background: var(--c-accent4);
  border: 1px solid var(--c-accent1);
  color: var(--c-text-2);
  font-family: 'Nunito', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 10px;
  transition: background 0.15s, color 0.15s;
}

.btn-trocar:hover {
  background: var(--c-accent1);
  color: var(--c-text);
}
</style>
