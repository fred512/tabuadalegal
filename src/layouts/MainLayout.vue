<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="app-header">
      <div class="header-inner">
        <q-btn
          v-if="$route.path !== '/home'"
          flat round dense
          icon="arrow_back"
          class="back-btn"
          @click="$router.back()"
        />
        <div v-else class="header-spacer" />
        <div class="avatar-chip">
          <span class="avatar-emoji">{{ avatarEmoji }}</span>
          <span class="player-name">{{ store.playerName }}</span>
        </div>
        <div class="header-right">
          <div class="stat-pill">⭐ {{ store.xp }}</div>
          <div v-if="store.streakDias > 0" class="stat-pill streak-pill">🔥 {{ store.streakDias }}</div>
        </div>
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="app-footer">
      <nav class="bottom-nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
          @click="$router.push(item.path)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
      <div class="version-info">v{{ appVersion }}</div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressoStore } from 'src/stores/progresso'
import { AVATARES } from 'src/data/avatares'

const store = useProgressoStore()

/* global __APP_VERSION__ */
const appVersion = __APP_VERSION__

const avatarEmoji = computed(() => {
  const av = AVATARES.find(a => a.id === store.avatarId)
  return av ? av.emoji : '🦁'
})

const navItems = [
  { path: '/home',    icon: '🏠', label: 'Início'  },
  { path: '/desafio', icon: '🏆', label: 'Desafio' },
  { path: '/galeria', icon: '▶️', label: 'Vídeos'  },
  { path: '/revisao', icon: '🔁', label: 'Revisão' },
]
</script>

<style scoped>
.app-header {
  background: var(--c-bg-2) !important;
  border-bottom: 1px solid var(--c-accent4);
}

.header-inner {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  gap: 10px;
  min-height: 56px;
}

.header-spacer { width: 40px; flex-shrink: 0; }

.back-btn {
  color: var(--c-text) !important;
  flex-shrink: 0;
}

.avatar-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--c-accent4);
  border-radius: 20px;
  padding: 4px 12px 4px 6px;
  min-width: 0;
}

.avatar-emoji { font-size: 1.4rem; line-height: 1; flex-shrink: 0; }

.player-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
}

.header-right {
  margin-left: auto;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.stat-pill {
  background: var(--c-accent4);
  border: 1px solid var(--c-accent1);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--c-text);
  white-space: nowrap;
}

.streak-pill {
  background: rgba(247, 173, 69, 0.12);
  border-color: rgba(247, 173, 69, 0.28);
  color: var(--c-warning);
}

.app-footer {
  background: var(--c-bg-2) !important;
  border-top: 1px solid var(--c-accent4);
}

.bottom-nav {
  display: flex;
  padding: 4px 0 6px;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-text-2);
  transition: color 0.15s;
}

.nav-item.active {
  color: var(--c-accent2);
}

.nav-icon {
  font-size: 1.35rem;
  line-height: 1;
  opacity: 0.45;
  transition: opacity 0.15s, transform 0.15s;
}

.nav-item.active .nav-icon {
  opacity: 1;
  transform: scale(1.1);
}

.nav-label {
  font-family: 'Nunito', sans-serif;
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.version-info {
  text-align: center;
  font-size: 0.58rem;
  color: var(--c-accent1);
  padding-bottom: 4px;
  letter-spacing: 0.05em;
}
</style>
