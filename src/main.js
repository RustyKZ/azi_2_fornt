import { createApp } from 'vue'
import App from './App.vue'
import router from './js/app_routes'
import store from './js/storage.js'
import BootstrapVueNext from 'bootstrap-vue-next'


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import io from 'socket.io-client';

const app = createApp(App)

// export const serverUrl = 'http://127.0.0.1:8000'
export const serverUrl = 'http://localhost:8000'
export const clientUrl = 'http://localhost:8080'
//export const serverUrl = 'https://localhost:443'
export const serverMail = '@users.azi-online.com'

app.use(router)
app.use(store)
app.use(BootstrapVueNext)

const socket = io(`${serverUrl}`); // Замените URL и порт на ваш сервер Socket.IO
app.config.globalProperties.$socket = socket;
  
export default socket;

app.mount('#app')


