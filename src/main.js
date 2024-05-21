import { createApp } from 'vue'
import App from './App.vue'
import router from './js/app_routes'
import store from './js/storage.js'
import BootstrapVueNext from 'bootstrap-vue-next'
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import io from 'socket.io-client';

const app = createApp(App)

export const serverUrl = 'https://azi-online.com:8000'

let serverMailData = '@users.azi-online.com';
let paypalClientIdData = 'ATVtjFAQiW84uJSCELJDy89J8MA-u6ldK_k9FlSqkXcuDad7DRfi3L9DBFxbL5O9RWyujt5VOnqWWZuh';
let googleClientIdData = '746578585810-cl1hd0s6kvde9dqq4u39gbpb68mmrpib.apps.googleusercontent.com'
let clientUrlData = 'http://localhost:8080'

try {    
    const response = await axios.get(`${serverUrl}/api/get_settings`);
    if (response.data['result']) {
        serverMailData = response.data['server_mail'];
        paypalClientIdData = response.data['paypal_client_id'];
        googleClientIdData = response.data['google_auth_client_id'];
        clientUrlData = response.data['app_client_url'];
        // console.log('data from server: ', serverMailData, paypalClientIdData, googleClientIdData, clientUrlData);
    }    
} catch(error) {
    console.error('MAIN JS - catch: ', error);
}

//export const serverMail = '@users.azi-online.com'
//export const paypalClientId = 'ATVtjFAQiW84uJSCELJDy89J8MA-u6ldK_k9FlSqkXcuDad7DRfi3L9DBFxbL5O9RWyujt5VOnqWWZuh'

export const serverMail = serverMailData;
export const paypalClientId = paypalClientIdData;
export const googleClientId = googleClientIdData;
export const clientUrl = clientUrlData;

app.use(router)
app.use(store)
app.use(BootstrapVueNext)

const socket = io(`${serverUrl}`); // Замените URL и порт на ваш сервер Socket.IO
app.config.globalProperties.$socket = socket;

  
export default socket;

app.mount('#app')


