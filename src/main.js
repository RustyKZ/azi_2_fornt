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

export const serverUrl = 'http://127.0.0.1:8000'
export const userTokenContract = '0xa12f829A5feFCbA0390dc71c28C6824401680Aa0'
export const hostWalletAddress = '0x5B4c138eb869Cb2Ad29414912d21E40ecAB4BFbA'
export const serverMail = '@users.azi-online.com'



app.use(router)
app.use(store)
app.use(BootstrapVueNext)

const socket = io(`${serverUrl}`); // Замените URL и порт на ваш сервер Socket.IO
app.config.globalProperties.$socket = socket;

//const socket = io(serverUrl, {
//    path: '/socket.io', // Путь соединения, который совпадает с настройками маршрутизации на сервере Django Python-SocketIO
//  });
  
export default socket;

// Обработчик события "connect" (установление соединения)
//socket.on("connect", () => {
//    console.log("Соединение установлено");
//  });
  
// Обработчик события "disconnect" (разрыв соединения)
//socket.on("disconnect", () => {
//    console.log("Соединение разорвано");
//    });

app.mount('#app')


