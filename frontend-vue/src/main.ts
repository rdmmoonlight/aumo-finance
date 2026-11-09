import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import { getBackendTarget } from './lib/api'
import { client } from './lib/generated/client.gen'
import { createVueQueryPlugin } from './lib/query-client'
import './lib/theme'
import router from './router'
import './styles/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(createVueQueryPlugin())

app.mount('#app')

client.setConfig({
    baseUrl: getBackendTarget(),
    credentials: 'include',
})
