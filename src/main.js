import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Notify, Dialog },
  config: {
    brand: {
      primary: '#6C63FF',
      secondary: '#48CAE4',
      accent: '#FFD700',
      positive: '#4CAF50',
      negative: '#FF5252',
      info: '#2196F3',
      warning: '#FF9800',
    },
    ripple: true,
  },
})

app.mount('#q-app')
