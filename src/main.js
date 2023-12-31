import { createApp } from 'vue'
import App from './App.vue'
import router from './js/app_routes'
import store from './js/store.js'
import BootstrapVueNext from 'bootstrap-vue-next'

//import 'bootstrap/dist/css/bootstrap.css'
//import 'bootstrap'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

const app = createApp(App)

export const serverUrl = 'http://127.0.0.1:8000'
export const userTokenContract = '0xa12f829A5feFCbA0390dc71c28C6824401680Aa0'
export const hostWalletAddress = '0x5B4c138eb869Cb2Ad29414912d21E40ecAB4BFbA'

app.use(router)
app.use(store)
app.use(BootstrapVueNext)

app.mount('#app')


