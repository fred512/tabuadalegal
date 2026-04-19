<template>
  <div class="entrada-bg">
    <div class="deco deco1">×</div>
    <div class="deco deco2">+</div>
    <div class="deco deco3">÷</div>
    <div class="deco deco4">−</div>
    <div class="deco deco5">∑</div>

    <div class="entrada-card">
      <div class="logo-area">
        <div class="logo-emoji">🧮</div>
        <h1 class="app-title">Tabuada <span>do Neto</span></h1>
        <p class="app-sub">Aprender tabuada é divertido!</p>
      </div>

      <template v-if="!store.playerName || editando">
        <div class="form-area">
          <label class="form-label">Qual é o seu nome?</label>
          <input
            v-model="nome"
            type="text"
            placeholder="Digite seu nome..."
            class="name-input"
            maxlength="20"
            autocomplete="off"
            @keyup.enter="confirmar"
          />

          <label class="form-label" style="margin-top: 22px">Escolha seu avatar:</label>
          <div class="avatar-grid">
            <button
              v-for="av in AVATARES"
              :key="av.id"
              class="avatar-btn"
              :class="{ selected: avatarSelecionado === av.id }"
              @click="avatarSelecionado = av.id"
            >
              <span class="av-emoji">{{ av.emoji }}</span>
              <span class="av-nome">{{ av.nome }}</span>
            </button>
          </div>

          <button class="btn-entrar" :disabled="!nome.trim()" @click="confirmar">
            Vamos lá! 🚀
          </button>
        </div>
      </template>

      <template v-else>
        <div class="welcome-back">
          <div class="big-avatar">{{ avatarAtualEmoji }}</div>
          <h2 class="welcome-name">Olá, {{ store.playerName }}! 👋</h2>
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-num">{{ store.xp }}</span>
              <span class="stat-lbl">XP</span>
            </div>
            <div class="stat-box">
              <span class="stat-num">{{ store.totalConcluidas }}/10</span>
              <span class="stat-lbl">Tabuadas</span>
            </div>
            <div class="stat-box">
              <span class="stat-num">🔥 {{ store.streakDias }}</span>
              <span class="stat-lbl">Dias</span>
            </div>
          </div>
          <button class="btn-entrar" @click="$router.push('/home')">Continuar ▶</button>
          <button class="btn-trocar" @click="editando = true">Trocar jogador</button>
          <button class="btn-reset" @click="confirmarReset = true">🗑️ Resetar progresso</button>
        </div>
      </template>
    </div>

    <!-- Confirmação de reset -->
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressoStore } from 'src/stores/progresso'
import { AVATARES } from 'src/data/avatares'

const store = useProgressoStore()
const router = useRouter()

const nome = ref(store.playerName || '')
const avatarSelecionado = ref(store.avatarId || 1)
const editando = ref(false)
const confirmarReset = ref(false)

function fazerReset() {
  store.resetar()
  confirmarReset.value = false
  nome.value = ''
  avatarSelecionado.value = 1
}

const avatarAtualEmoji = computed(() => {
  const av = AVATARES.find(a => a.id === store.avatarId)
  return av ? av.emoji : '🦁'
})

function confirmar() {
  if (!nome.value.trim()) return
  store.setPlayer(nome.value.trim(), avatarSelecionado.value)
  editando.value = false
  router.push('/home')
}
</script>

<style scoped>
.entrada-bg {
  min-height: 100vh;
  background: var(--c-bg);
  background-image: radial-gradient(var(--c-accent4) 1.5px, transparent 1.5px);
  background-size: 26px 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.entrada-card {
  background: var(--c-bg-2);
  border: 1px solid var(--c-accent4);
  border-radius: 28px;
  padding: 36px 24px;
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 2;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.55);
}

/* Logo */
.logo-area { text-align: center; margin-bottom: 28px; }

.logo-emoji {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 10px;
  animation: bounce 3s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.app-title {
  font-size: 1.85rem;
  font-weight: 900;
  color: var(--c-text);
  margin: 0;
  letter-spacing: -0.03em;
}
.app-title span { color: var(--c-accent2); }

.app-sub {
  color: var(--c-text-2);
  font-size: 0.88rem;
  margin: 6px 0 0;
}

/* Form */
.form-label {
  display: block;
  font-weight: 700;
  color: var(--c-text-2);
  margin-bottom: 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Native input */
.name-input {
  width: 100%;
  background: var(--c-accent4);
  border: 1px solid var(--c-accent1);
  border-radius: 14px;
  padding: 14px 16px;
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-text);
  outline: none;
  transition: border-color 0.15s;
  margin-bottom: 4px;
}
.name-input::placeholder { color: var(--c-text-2); }
.name-input:focus { border-color: var(--c-accent2); }

/* Avatar grid */
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 22px;
}

.avatar-btn {
  border: 2px solid var(--c-accent4);
  border-radius: 14px;
  padding: 10px 4px 8px;
  background: var(--c-accent4);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.avatar-btn:hover { border-color: var(--c-accent2); }
.avatar-btn.selected {
  border-color: var(--c-accent2);
  background: var(--c-accent1);
  box-shadow: 0 0 16px rgba(100, 140, 180, 0.22);
}

.av-emoji { font-size: 1.65rem; line-height: 1; }
.av-nome { font-size: 0.58rem; color: var(--c-text-2); font-weight: 700; }

/* CTA */
.btn-entrar {
  width: 100%;
  background: var(--c-accent2);
  color: #fff;
  font-family: 'Nunito', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  padding: 14px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  letter-spacing: 0.02em;
}
.btn-entrar:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-entrar:not(:disabled):active { opacity: 0.82; transform: scale(0.98); }

/* Welcome back */
.welcome-back {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.big-avatar { font-size: 5rem; line-height: 1; }

.welcome-name {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--c-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.stats-row { display: flex; gap: 10px; justify-content: center; }

.stat-box {
  background: var(--c-accent4);
  border: 1px solid var(--c-accent1);
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 68px;
}
.stat-num { font-size: 1.1rem; font-weight: 900; color: var(--c-accent2); }
.stat-lbl { font-size: 0.68rem; color: var(--c-text-2); font-weight: 700; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }

.btn-trocar {
  background: none;
  border: none;
  color: var(--c-text-2);
  font-family: 'Nunito', sans-serif;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px;
  margin-top: -6px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.btn-reset {
  background: none;
  border: none;
  color: var(--c-error);
  font-family: 'Nunito', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.btn-reset:hover { opacity: 1; }

/* Reset dialog */
.reset-dialog {
  background: var(--c-bg-2);
  border: 1px solid var(--c-accent4);
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  width: 300px;
  max-width: 90vw;
}

.reset-icon { font-size: 2.5rem; }
.reset-titulo { font-size: 1.1rem; font-weight: 900; color: var(--c-text); margin: 10px 0 8px; }
.reset-texto { font-size: 0.84rem; color: var(--c-text-2); line-height: 1.5; margin-bottom: 20px; }

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

/* Floating math decorations */
.deco {
  position: absolute;
  font-size: 2.4rem;
  font-weight: 900;
  color: var(--c-accent1);
  animation: float 5s ease-in-out infinite;
  z-index: 1;
  user-select: none;
  pointer-events: none;
}
.deco1 { top: 8%; left: 5%; animation-delay: 0s; }
.deco2 { top: 16%; right: 6%; animation-delay: 1s; }
.deco3 { bottom: 18%; left: 6%; animation-delay: 2s; }
.deco4 { bottom: 26%; right: 5%; animation-delay: 0.6s; }
.deco5 { top: 48%; left: 3%; font-size: 2rem; animation-delay: 1.4s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(8deg); }
}
</style>
