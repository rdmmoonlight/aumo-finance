import { createPinia } from 'pinia'
import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'
import App from './App.vue'
import { GOOGLE_CLIENT_ID } from './features/auth/config'
import { getBackendTarget } from './lib/api'
import { client } from './lib/generated/client.gen'
import { createVueQueryPlugin } from './lib/query-client'
import './lib/theme'
import router from './router'
import './styles/index.css'

// Base URL backend + cookie sesi, diatur sebelum aplikasi dirender
client.setConfig({
  baseUrl: getBackendTarget(),
  credentials: 'include',
})

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(createVueQueryPlugin())
app.use(vue3GoogleLogin, {
  clientId: GOOGLE_CLIENT_ID,
})

app.mount('#app')
