import './assets/main.css'
import { createAmplify } from './aws-exports'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
createAmplify()
app.use(createPinia())
app.use(router)

app.mount('#app')
