import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'tabuada_neto_v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useProgressoStore = defineStore('progresso', () => {
  const saved = load()

  const playerName = ref(saved.playerName || '')
  const avatarId = ref(saved.avatarId || 1)
  const xp = ref(saved.xp || 0)
  const streakDias = ref(saved.streakDias || 0)
  const ultimoAcesso = ref(saved.ultimoAcesso || null)

  // estrelas por tabuada: { 2: 3, 3: 2, ... }
  const estrelas = ref(saved.estrelas || {})

  // erros por multiplicação: { '2x3': 5, '7x8': 3, ... }
  const errosPor = ref(saved.errosPor || {})

  // vídeos desbloqueados (ids)
  const videosDesbloqueados = ref(saved.videosDesbloqueados || [])

  // timestamp até quando todos os vídeos ficam liberados (ms)
  const todosBloqueadosAte = ref(saved.todosBloqueadosAte || null)

  // ---- computed ----

  const tabuadasConcluidas = computed(() =>
    Object.keys(estrelas.value).map(Number).filter(n => estrelas.value[n] > 0)
  )

  const totalConcluidas = computed(() => tabuadasConcluidas.value.length)

  const todasConcluidas = computed(() => totalConcluidas.value >= 10)

  const todosLiberados = computed(() => {
    if (!todosBloqueadosAte.value) return false
    return Date.now() < todosBloqueadosAte.value
  })

  const videoDesbloqueado = (videoId) => {
    if (todosLiberados.value) return true
    return videosDesbloqueados.value.includes(videoId)
  }

  const maisErradas = computed(() => {
    return Object.entries(errosPor.value)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([mult, erros]) => ({ mult, erros }))
  })

  // ---- actions ----

  function persist() {
    save({
      playerName: playerName.value,
      avatarId: avatarId.value,
      xp: xp.value,
      streakDias: streakDias.value,
      ultimoAcesso: ultimoAcesso.value,
      estrelas: estrelas.value,
      errosPor: errosPor.value,
      videosDesbloqueados: videosDesbloqueados.value,
      todosBloqueadosAte: todosBloqueadosAte.value,
    })
  }

  function setPlayer(name, avatar) {
    playerName.value = name
    avatarId.value = avatar
    persist()
  }

  function registrarErro(a, b) {
    const key = `${a}x${b}`
    errosPor.value[key] = (errosPor.value[key] || 0) + 1
    persist()
  }

  function concluirTabuada(numero, qtdEstrelas) {
    estrelas.value[numero] = Math.max(estrelas.value[numero] || 0, qtdEstrelas)
    xp.value += qtdEstrelas * 10
    // desbloqueia vídeo correspondente (tabuadas 1-10 → vídeos 1-10)
    const videoId = numero
    if (!videosDesbloqueados.value.includes(videoId)) {
      videosDesbloqueados.value.push(videoId)
    }
    // se todas concluídas, desbloqueia bônus e libera todos por 24h
    if (todasConcluidas.value) {
      for (let i = 11; i <= 20; i++) {
        if (!videosDesbloqueados.value.includes(i)) {
          videosDesbloqueados.value.push(i)
        }
      }
      todosBloqueadosAte.value = Date.now() + 24 * 60 * 60 * 1000
    }
    atualizarStreak()
    persist()
  }

  function concluirDesafio(acertos) {
    xp.value += acertos * 5
    if (acertos >= 8) {
      // desafio aprovado: libera todos por 24h
      todosBloqueadosAte.value = Date.now() + 24 * 60 * 60 * 1000
    }
    atualizarStreak()
    persist()
  }

  function atualizarStreak() {
    const hoje = new Date().toDateString()
    if (ultimoAcesso.value === hoje) return
    const ontem = new Date(Date.now() - 86400000).toDateString()
    if (ultimoAcesso.value === ontem) {
      streakDias.value++
    } else if (ultimoAcesso.value !== hoje) {
      streakDias.value = 1
    }
    ultimoAcesso.value = hoje
    persist()
  }

  function resetar() {
    playerName.value = ''
    avatarId.value = 1
    xp.value = 0
    streakDias.value = 0
    ultimoAcesso.value = null
    estrelas.value = {}
    errosPor.value = {}
    videosDesbloqueados.value = []
    todosBloqueadosAte.value = null
    persist()
  }

  return {
    playerName, avatarId, xp, streakDias,
    estrelas, errosPor, videosDesbloqueados, todosBloqueadosAte,
    tabuadasConcluidas, totalConcluidas, todasConcluidas, todosLiberados,
    maisErradas,
    videoDesbloqueado, setPlayer, registrarErro,
    concluirTabuada, concluirDesafio, resetar,
  }
})
