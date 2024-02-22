import axios from 'axios';
import { serverUrl } from '../main'
import store from './store';

// Вход пользователя через email
export async function email_login(login_user) {
    try {
        const response = await axios.post(`${serverUrl}/api/user_login`, login_user);
        console.log('AUTH.JS email_login: ', response);
        if (response.data['logged_in']) {
          localStorage.setItem('authToken', response.data['token']);
          store.dispatch('changeStatusLoggedIn');
        }
        return response.data
    } catch (error) {
        if (error.response) {
          // Ошибка 4XX (клиентская ошибка)
          console.error('AUTH.JS email_login Client error:', error.response.status);
          return error.response.status
        } else if (error.request) {
          // Ошибка связанная с запросом (например, отсутствие ответа)
          console.error('AUTH.JS email_login Request error:', error.request);
          return error.response.status
        } else {
          // Ошибка при настройке запроса
          console.error('AUTH.JS email_login Setup error:', error.message);
          return error.response.status
        }
          // Обработка ошибок 5XX или других ошибок
    }
}


export async function email_check_auth() {
  try {    
    const authToken = localStorage.getItem('authToken') || '';
    const token_data = {'token': authToken};
    const response = await axios.post(`${serverUrl}/api/get_auth_status`, token_data);
    console.log('AUTH.JS email_check_auth ', response.data);
    if (response.data['is_auth']) {
      store.dispatch('changeStatusLoggedIn');
      if (response.data['is_auth_web3']) {
        store.dispatch('changeStatusWeb3In');
      } else {
        store.dispatch('changeStatusWeb3Out');
      }
    } else {
      store.dispatch('changeStatusLoggedOut');
      store.dispatch('changeStatusWeb3Out');
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      // Ошибка 4XX (клиентская ошибка)
      console.error('AUTH.JS email_check_auth Client error:', error.response.status);
      return error.response.status;
    } else if (error.request) {
      // Ошибка связанная с запросом (например, отсутствие ответа)
      console.error('AUTH.JS email_check_auth Request error:', error.request);
      return error.response.status;
    } else {
      // Ошибка при настройке запроса
      console.error('AUTH.JS email_check_auth Setup error:', error.message);
      return error.response.status;
    }
    // Обработка ошибок 5XX или других ошибок
  }
}


export async function email_logout() {
  try {
    const authToken = localStorage.getItem('authToken') || '';
    const token_data = {'token': authToken};
    const response = await axios.post(`${serverUrl}/api/user_logout`, token_data);
    console.log('AUTH.JS email_logout ', response.data);
    if (response.data['logged_out']) {
      store.dispatch('changeStatusLoggedOut');
      store.dispatch('changeStatusWeb3Out');
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      // Ошибка 4XX (клиентская ошибка)
      console.error('AUTH.JS email_logout Client error:', error.response.status);
      return error.response.status;
    } else if (error.request) {
      // Ошибка связанная с запросом (например, отсутствие ответа)
      console.error('AUTH.JS email_logout Request error:', error.request);
      return error.response.status;
    } else {
      // Ошибка при настройке запроса
      console.error('AUTH.JS email_logout Setup error:', error.message);
      return error.response.status;
    }
    // Обработка ошибок 5XX или других ошибок
  }
}