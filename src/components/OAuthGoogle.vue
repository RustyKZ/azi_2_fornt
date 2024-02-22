<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { get_ip_address } from '@/js/ip_address.js';
  import { email_check_auth } from '../js/auth'
  export default {
    name: 'OAuth_Google_Page',
    data() {
      return {
        authParams: {},
      };
    },

    created() {
      this.parseHashParams();
    },

    mounted: async function() {
      const oauthData = this.authParams;
      const accessToken = oauthData.access_token;
      const refCode = oauthData.state || '';
      // Запрос к Google API для получения информации о пользователе
      const userInfoResponse = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);        
      // Извлечение адреса электронной почты из ответа
      const email = userInfoResponse.data.email;
      // Получение IP адреса
      const ipAddress = await get_ip_address();
      // Отправка данных на бэкенд
      const dataToSend = {
        email: email,
        access_token: accessToken,
        ref_code: refCode,
        ip_address: ipAddress,
      };
      await this.oauth_google_login(dataToSend);
    },

    methods: {
      parseHashParams() {
        const hash = window.location.hash.substring(1);
        const params = hash.split('&');
        const parsedParams = {};
        params.forEach(param => {
          const [key, value] = param.split('=');
          parsedParams[key] = value;
        });
        this.authParams = parsedParams;
      },

      async oauth_google_login(data) {
        try {
          const response = await axios.post(`${serverUrl}/api/user_login_google`, data);
          console.log('OAuth Google login:', response);
          const djangoToken = response.data['access_token'] || '';
          localStorage.setItem('authToken', djangoToken);          
          const logged_in = await email_check_auth();
          console.log('OAUTH GOOGLE LOGIN: logged_in is: ', logged_in)
          if (logged_in['is_auth']) {
            this.$router.push('/');
          }          
        } catch (error) {
          if (error.response) {
            // Ошибка 4XX (клиентская ошибка)
            console.error('Client error:', error.response.status);              
          } else if (error.request) {
            // Ошибка связанная с запросом (например, отсутствие ответа)
            console.error('Request error:', error.request);
          } else {
            // Ошибка при настройке запроса
            console.error('Setup error:', error.message);
          }
            // Обработка ошибок 5XX или других ошибок              
        }
      }
    }
  }


</script>

<template>
  <div>
    OAuth
    <hr>
    {{ authParams }}
    <hr>
    <div v-if="authParams.access_token">
      Access Token: {{ authParams.access_token }}
    </div>
    <div v-if="authParams.expires_in">
      Expires In: {{ authParams.expires_in }}
    </div>

  </div>
</template>

<style scoped>
</style>
