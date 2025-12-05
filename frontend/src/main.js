import { createApp } from 'vue'
import App from './App.vue'

console.log('App is starting...')
console.log('Environment:', import.meta.env)

// TODO: add proper error handling
// TODO: add router maybe?

const app = createApp(App)

app.mount('#app')

console.log('App mounted!')
