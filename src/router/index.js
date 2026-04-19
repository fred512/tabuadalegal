import { createRouter, createWebHashHistory } from 'vue-router'
import { useProgressoStore } from 'src/stores/progresso'

const routes = [
  { path: '/', component: () => import('src/pages/EntradaPage.vue') },
  {
    path: '/home',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/HomePage.vue') },
      { path: '/treino/:n', component: () => import('src/pages/TreinoPage.vue') },
      { path: '/desafio', component: () => import('src/pages/DesafioPage.vue') },
      { path: '/galeria', component: () => import('src/pages/GaleriaPage.vue') },
      { path: '/revisao', component: () => import('src/pages/RevisaoPage.vue') },
    ],
  },
  { path: '/:catchAll(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.path === '/') return true
  const store = useProgressoStore()
  if (!store.playerName && to.path !== '/') return '/'
  return true
})

export default router
