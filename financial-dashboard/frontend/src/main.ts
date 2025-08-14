import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { store } from './store'
import App from './App.vue'
import routes from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

app.use(store)
app.use(router)
app.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true
})

app.mount('#app')