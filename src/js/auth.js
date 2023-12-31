import axios from 'axios';
import { serverUrl } from '../main'

// Вход пользователя через email
export async function email_login(login_user) {
    try {
        const response = await axios.post(`${serverUrl}/api/user_login`, login_user);
        console.log('AUTH.JS email_login: ', response);
        return response.data
    } catch (error) {
        if (error.response) {
          // Ошибка 4XX (клиентская ошибка)
          console.error('AUTH.JS email_login Client error:', error.response.status);
        } else if (error.request) {
          // Ошибка связанная с запросом (например, отсутствие ответа)
          console.error('AUTH.JS email_login Request error:', error.request);
        } else {
          // Ошибка при настройке запроса
          console.error('AUTH.JS email_login Setup error:', error.message);
        }
          // Обработка ошибок 5XX или других ошибок
    }
}
