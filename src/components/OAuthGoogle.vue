<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { get_ip_address } from '@/js/ip_address.js';
  import { email_check_auth } from '../js/auth'
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'OAuth_Google_Page',
    data() {
      return {
        user_id: 0,
        authParams: {},
      };
    },

    computed: {
      ...mapGetters(['getCurrentLanguage']),          
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
        language: this.getCurrentLanguage
      };
      await this.oauth_google_login(dataToSend);
    },

    methods: {
      ...mapActions(['changeLanguage', 'setGlobalModalErrorOn', 'setGlobalError', 'setGlobalErrorCustomText', 'setAirdropCoins', 'setReferalCoins']),
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

      async getAirdropCoins() {
        const dataToSend = {
          'user_id': this.user_id,
          'token': localStorage.getItem('authToken')
        }
        try {          
          const response = await axios.post(`${serverUrl}/api/user_get_airdrop_coins`, dataToSend);
          console.log('APP LOGIN - GET AIRDROP COINS - response: ', response)
          const dataResponse = response['data']          
          if (dataResponse['status']) {            
            this.setGlobalError(1001);
            this.setAirdropCoins(dataResponse['airdrop']);
            this.setReferalCoins(dataResponse['referal']);
            this.setGlobalModalErrorOn();
          } else {
            console.log('APP LOGIN - GET AIRDROP COINS - response: ', response)
            //this.setGlobalError(dataResponse['error']);  
            //this.setGlobalModalErrorOn();
          }
        } catch(error) {
          console.error('Airdrop catch')
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
        }        
      },

      async oauth_google_login(data) {
        try {
          const response = await axios.post(`${serverUrl}/api/user_login_google`, data);
          console.log('OAuth Google login:', response);
          const djangoToken = response.data['access_token'] || '';
          const language = response.data['user_language'] || 1;
          localStorage.setItem('authToken', djangoToken);          
          const logged_in = await email_check_auth();
          console.log('OAUTH GOOGLE LOGIN: logged_in is: ', logged_in)
          if (logged_in['is_auth']) {
            this.user_id = logged_in['user_id']
            this.changeLanguage(language);
            await this.getAirdropCoins();
            this.$router.push('/');
          } else {
            this.$router.push('/500');
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
          this.$router.push('/500');
        }
      }
    }
  }


</script>

<template>
  <div>
    <!--
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
    -->
  </div>
</template>

<style scoped>
</style>
