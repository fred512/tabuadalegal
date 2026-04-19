<template>
  <q-page class="galeria-page">
    <div class="galeria-header">
      <p class="galeria-sub">{{ desbloqueados }}/20 vídeos desbloqueados</p>
      <div v-if="store.todosLiberados" class="todos-liberados-badge">
        🎉 Todos liberados! Aproveite!
        <span class="libera-timer">{{ tempoRestante }}</span>
      </div>
    </div>

    <!-- Seção tabuadas -->
    <p class="section-label">🏅 Recompensas das tabuadas</p>
    <div class="videos-grid">
      <div
        v-for="v in videosTabuada"
        :key="v.id"
        class="video-card"
        :class="{ bloqueado: !store.videoDesbloqueado(v.id) }"
        @click="abrir(v)"
      >
        <div class="card-thumb">
          <template v-if="store.videoDesbloqueado(v.id)">
            <img
              :src="`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`"
              :alt="v.titulo"
              class="thumb-img"
            />
            <div class="play-icon">▶</div>
          </template>
          <template v-else>
            <div class="lock-screen">
              <span class="lock-emoji">🔒</span>
              <span class="lock-hint">Tabuada do {{ v.tabuada }}</span>
            </div>
          </template>
        </div>
        <div class="card-body">
          <p class="card-emoji">{{ v.emoji }}</p>
          <p class="card-titulo">{{ store.videoDesbloqueado(v.id) ? v.titulo : '???' }}</p>
          <p class="card-desc">{{ store.videoDesbloqueado(v.id) ? v.desc : `Complete a tabuada do ${v.tabuada} para desbloquear!` }}</p>
        </div>
      </div>
    </div>

    <!-- Seção bônus -->
    <p class="section-label" style="margin-top: 20px">🎁 Bônus — complete todas as tabuadas!</p>
    <div class="videos-grid">
      <div
        v-for="v in videosBonus"
        :key="v.id"
        class="video-card video-card--bonus"
        :class="{ bloqueado: !store.videoDesbloqueado(v.id) }"
        @click="abrir(v)"
      >
        <div class="card-thumb">
          <template v-if="store.videoDesbloqueado(v.id)">
            <img
              :src="`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`"
              :alt="v.titulo"
              class="thumb-img"
            />
            <div class="play-icon">▶</div>
          </template>
          <template v-else>
            <div class="lock-screen lock-screen--bonus">
              <span class="lock-emoji">🏆</span>
              <span class="lock-hint">Conclua as 10 tabuadas</span>
            </div>
          </template>
        </div>
        <div class="card-body">
          <p class="card-emoji">{{ v.emoji }}</p>
          <p class="card-titulo">{{ store.videoDesbloqueado(v.id) ? v.titulo : `Bônus ${v.id - 10}` }}</p>
          <p class="card-desc">{{ store.videoDesbloqueado(v.id) ? v.desc : 'Complete todas as tabuadas para ver!' }}</p>
        </div>
      </div>
    </div>

    <!-- Player modal -->
    <q-dialog v-model="showPlayer" maximized>
      <q-card class="player-card">
        <q-bar class="player-bar">
          <span class="player-titulo">{{ videoAtual?.emoji }} {{ videoAtual?.titulo }}</span>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-bar>
        <div class="player-body">
          <iframe
            v-if="videoAtual"
            :src="`https://www.youtube-nocookie.com/embed/${videoAtual.videoId}?autoplay=1&rel=0`"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
            class="yt-iframe"
          />
        </div>
        <div class="player-footer">
          <p class="player-desc">{{ videoAtual?.desc }}</p>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProgressoStore } from 'src/stores/progresso'
import { VIDEOS } from 'src/data/videos'

const store = useProgressoStore()
const showPlayer = ref(false)
const videoAtual = ref(null)

const videosTabuada = VIDEOS.filter(v => !v.bonus)
const videosBonus = VIDEOS.filter(v => v.bonus)

const desbloqueados = computed(() =>
  VIDEOS.filter(v => store.videoDesbloqueado(v.id)).length
)

// Contador regressivo para liberação geral
const tempoRestante = ref('')
let countdownInterval = null

function atualizarCountdown() {
  if (!store.todosBloqueadosAte) { tempoRestante.value = ''; return }
  const diff = store.todosBloqueadosAte - Date.now()
  if (diff <= 0) { tempoRestante.value = 'Expirado'; return }
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  tempoRestante.value = `${h}h${m.toString().padStart(2, '0')}m restantes`
}

onMounted(() => {
  atualizarCountdown()
  countdownInterval = setInterval(atualizarCountdown, 60000)
})
onUnmounted(() => clearInterval(countdownInterval))

function abrir(v) {
  if (!store.videoDesbloqueado(v.id)) return
  videoAtual.value = v
  showPlayer.value = true
}
</script>

<style scoped>
.galeria-page {
  padding: 16px;
  background: #F8F7FF;
  min-height: 100vh;
}

.galeria-header {
  margin-bottom: 12px;
}

.galeria-sub {
  font-size: 0.85rem;
  color: #888;
  margin: 0 0 6px;
}

.todos-liberados-badge {
  background: linear-gradient(90deg, #6C63FF, #48CAE4);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 14px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.libera-timer {
  font-size: 0.75rem;
  opacity: 0.85;
}

.section-label {
  font-weight: 800;
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 600px) {
  .videos-grid { grid-template-columns: repeat(3, 1fr); }
}

.video-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.video-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
.video-card.bloqueado { cursor: default; opacity: 0.85; }
.video-card--bonus { border: 2px solid #FFD700; }

.card-thumb {
  aspect-ratio: 16/9;
  position: relative;
  background: #eee;
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.video-card:hover .play-icon { opacity: 1; }

.lock-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #EDE9FF, #D1D5FF);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.lock-screen--bonus {
  background: linear-gradient(135deg, #FFF9C4, #FFE082);
}

.lock-emoji { font-size: 1.8rem; }
.lock-hint { font-size: 0.65rem; font-weight: 700; color: #7C72CF; text-align: center; padding: 0 6px; }

.card-body {
  padding: 8px 10px 12px;
}

.card-emoji { font-size: 1.2rem; margin: 0 0 2px; }
.card-titulo { font-size: 0.8rem; font-weight: 800; color: #333; margin: 0 0 4px; }
.card-desc { font-size: 0.7rem; color: #888; margin: 0; line-height: 1.4; }

/* Player */
.player-card {
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
}

.player-bar {
  background: #1a1a1a;
  color: #fff;
}

.player-titulo {
  font-weight: 700;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

.player-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.yt-iframe {
  width: 100%;
  aspect-ratio: 16/9;
  max-height: 60vh;
  border: none;
}

.player-footer {
  background: #1a1a1a;
  padding: 12px 16px;
}

.player-desc {
  color: #aaa;
  font-size: 0.85rem;
  margin: 0;
}
</style>
