import { createApp } from 'vue'
import App from './App.vue'

console.log('App is starting...')
console.log('Environment:', import.meta.env)

const app = createApp(App)

app.mount('#app')

console.log('App mounted!')
