import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { getBackendTarget } from './lib/api'
import { client } from './lib/generated/client.gen'
import { createVueQueryPlugin } from './lib/query-client'
import './lib/theme'
import router from './router'
import './styles/index.css'

const app = createApp(App)

app.use(router)
app.use(createVueQueryPlugin())

app.mount('#app')

client.setConfig({
    baseUrl: `${getBackendTarget()}/api/v1`,
    credentials: 'include',
})
