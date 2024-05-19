<script>
  import axios from 'axios';
  import { serverUrl, clientUrl, googleClientId } from '../main';
  import { mapGetters, mapActions } from 'vuex';
  import { email_login } from '@/js/auth';
  import { get_ip_address } from '@/js/ip_address.js';
  import { walletConnect } from '../js/web3auth';
  
  export default {
    name: 'SignupPage',
    props: ['signupArgument'],

    computed: {
      ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3']),
    },

    watch: {
      getCurrentLanguage(newLanguage) {
        this.update(newLanguage);
      },
      isAuth() {
        this.goToAccessDenied();
      },
    },

    data() {
      return {
        formData: {},
        allUsers: {},
        user_reg: {
          name: '',
          email: '',
          password: '',
          repassword: '',
          ref_code: '',
          ip_address: '',
          language: 1
        },
        user_login:{
          email: '',
          password: '',
        },        
        alertModalData: {          
          title: 'Modal title',
          content: 'Modal content',
          button: 'Close'
        },
        modalVisible: false,
        successVisible: false,
        user_id: 0
      };
    },

    created() {
      console.log('APP SIGNUP isAuth is ', this.isAuth)
      if (this.isAuth) {
        this.$router.push('/accessdenied');
      }
      this.fetchApiForm(this.getCurrentLanguage);      
      this.refCodeChecking();      
    },

    methods: {
      ...mapActions(['setGlobalModalErrorOn', 'setGlobalError', 'changeLanguage', 'setAirdropCoins', 'setReferalCoins']),
      refCodeChecking() {
        if (this.signupArgument && this.signupArgument.startsWith('ref=')) {
          this.user_reg.ref_code = this.signupArgument.slice(4);
        } else {
          this.user_reg.ref_code = '';
        }
      },

      goToAccessDenied() {
        if (this.isAuth) {
          this.$router.push('/access_denied');
        }
      },

      async fetchApiForm(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_signup_form/${languageId}`);
          this.formData = response.data;          
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },

      async update(newLanguage) {      
        await this.fetchApiForm(newLanguage);
      },

      async getUsers() {
        try {
          const response = await axios.get(`${serverUrl}/api/get_users`);
          this.allUsers = response.data;
        } catch (error) {
          console.error('Error fetching API data:', error);
          this.modalErrorServer();
        }
      },

      async registerUser() {
        console.log('Register user function', this.user_reg);
        await this.getUsers();
        if (this.allUsers) {
          console.log('REGISTER USER: aalUsers is True')
        } else {
          console.log('REGISTER USER: aalUsers is False')
        }
        const userExists = this.allUsers.some(user => user.nickname === this.user_reg.name);
        const emailExists = this.allUsers.some(user => user.email === this.user_reg.email);
        const passwordError = !(this.user_reg.password === this.user_reg.repassword);
        const passwordShort = !(this.user_reg.password.length >= 8 && this.user_reg.password.length <= 50)
        const nameError = !(this.user_reg.name.length >= 5 && this.user_reg.name.length <= 50)
        if (userExists) {
          this.modalErrorNameExist();
        } else if (emailExists) {
          this.modalErrorEmailExist();
        } else if (nameError) {
          this.modalErrorNameIncorrect();
        } else if (passwordError) {
          this.modalErrorPasswordNotMatch();
        } else if (passwordShort) {
          this.modalErrorPasswordShort();
        } else {
          try {
            this.user_reg.ip_address = await get_ip_address();
            this.user_reg.language = this.getCurrentLanguage;
            const response = await axios.post(`${serverUrl}/api/user_signup`, this.user_reg);
            console.log('Register user', response);
            // Обработка успешного запроса, если нужно
            if (response.data['registred']) {
              this.scrollToTop();
              this.successVisible = true;
              await new Promise(resolve => setTimeout(resolve, 1000));
              this.user_login.email = this.user_reg.email;
              this.user_login.password = this.user_reg.password;
              await email_login(this.user_login);
              this.$router.push('/');
            }            
          } catch (error) {
            if (error.response) {
              // Ошибка 4XX (клиентская ошибка)
              console.error('Client error:', error.response.status);
              this.modalErrorClient();
            } else if (error.request) {
              // Ошибка связанная с запросом (например, отсутствие ответа)
              console.error('Request error:', error.request);
              this.modalErrorClient();
            } else {
              // Ошибка при настройке запроса
              console.error('Setup error:', error.message);
              this.modalErrorClient();
            }
              // Обработка ошибок 5XX или других ошибок
              this.modalErrorServer();
          }
        }
      },
      
      googleAuth() {
        // Google's OAuth 2.0 endpoint for requesting an access token
        var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
        // Create <form> element to submit parameters to OAuth 2.0 endpoint.
        var form = document.createElement('form');
        form.setAttribute('method', 'GET'); // Send as a GET request.
        form.setAttribute('action', oauth2Endpoint);
        // Parameters to pass to OAuth 2.0 endpoint.
        var params = {
              'client_id': googleClientId,
              'redirect_uri': `${clientUrl}/oauth_google/`,
              'response_type': 'token',
              'scope': 'https://www.googleapis.com/auth/userinfo.email',
              'include_granted_scopes': 'true',              
              'state': this.user_reg.ref_code,
        };
        // Add form parameters as hidden input values.
        for (var p in params) {
          var input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', p);
          input.setAttribute('value', params[p]);
          form.appendChild(input);
        }
        // Add form to page and submit it to open the OAuth 2.0 endpoint.
        document.body.appendChild(form);
        form.submit();
      },

      async registerMetamask() {
        console.log('REGISTER METAMASK function', this.user_reg);
        const walletStatus = await walletConnect(this.user_reg.ref_code, this.getCurrentLanguage);
        console.log('REGISTER METAMASK response: ', walletStatus);
        if (walletStatus.logged_in) {
          this.user_id = walletStatus.user_id;
          console.log('METAMASK CONNECT ', walletStatus.logged_in);
          this.changeLanguage(walletStatus.user_language);
          await this.getAirdropCoins();
          this.$router.push('/');
        } else {
          this.setGlobalModalErrorOn();
          try {
            this.setGlobalError(walletStatus.error);
          } catch {
            this.setGlobalError(0);
          }
        }        
      },

      async getAirdropCoins() {
        const dataToSend = {
          'user_id': this.user_id,
          'token': localStorage.getItem('authToken')
        }
        try {
          console.log('APP LOGIN - GET AIRDROP COINS: ', dataToSend)
          const response = await axios.post(`${serverUrl}/api/user_get_airdrop_coins`, dataToSend);
          const dataResponse = response['data']
          if (dataResponse['status']) {
            console.log('APP LOGIN - GET AIRDROP COINS - response: ', response);
            this.setGlobalError(1001);
            this.setAirdropCoins(dataResponse['airdrop']);
            this.setReferalCoins(dataResponse['referal']);
            this.setGlobalModalErrorOn();
          } else {
            console.log('APP LOGIN - GET AIRDROP COINS - response: ', response);
            //this.setGlobalError(dataResponse['error']);  
            //this.setGlobalModalErrorOn();
          }
        } catch(error) {
          console.error('Airdrop catch')
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
        }
      },

      modalErrorClient() {        
        this.setGlobalError(466);
        this.setGlobalModalErrorOn();
      },

      modalErrorServer() {
        this.setGlobalError(465);
        this.setGlobalModalErrorOn();
      },

      modalErrorNameExist() {
        this.setGlobalError(460);
        this.setGlobalModalErrorOn();
      },

      modalErrorPasswordNotMatch() {
        this.setGlobalError(462);
        this.setGlobalModalErrorOn();
      },

      modalErrorPasswordShort() {
        this.setGlobalError(463);
        this.setGlobalModalErrorOn();
      },

      modalErrorNameIncorrect() {
        this.setGlobalError(464);
        this.setGlobalModalErrorOn();
      },

      modalErrorEmailExist() {
        this.setGlobalError(461);
        this.setGlobalModalErrorOn();
      },

      scrollToTop() {
        // Для плавного скролла (если поддерживается)
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
          top: 0,
          behavior: 'smooth'
          });
        } else {
          // Для браузеров, не поддерживающих плавный скролл
          window.scrollTo(0, 0);
        }
      },

    }

  }

</script>

<template>
  <BModal v-model="modalVisible" id="alertModal" centered :title="alertModalData.title" :okTitle="alertModalData.button" okVariant="secondary" ok-only="true">
    <p class="my-4">{{ alertModalData.content }}</p>
  </BModal>
  
  <div class="container">    
    <div class="content">
      <div class="mainbox">

        <div class="container my-3">
          <div v-if="successVisible" class="alert alert-success" role="alert">
            <b>{{ formData.alert_congrats }}</b> {{ formData.alert_successful }}
          </div>
          <div class="bg-body-tertiary p-5 rounded">
            
            <h3>{{ formData.title }}</h3>
            <hr>

            <form @submit.prevent="registerUser">
              <div class="form-floating mb-3">
                <input v-model="user_reg.name" type="text" class="form-control" id="floatingName" placeholder="name@example.com" :title="formData.nickname_hint">
                <label for="floatingName">{{ formData.nickname }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_reg.email" type="email" class="form-control" id="floatingEmail" placeholder="name@example.com" :title="formData.email_hint">
                <label for="floatingEmail">{{ formData.email }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_reg.ref_code" type="text" class="form-control" id="floatingRef" :placeholder="user_reg.ref_code" :title="formData.ref_code_hint">
                <label for="floatingRef">{{ formData.ref_code }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_reg.password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
                <label for="floatingPassword">{{ formData.password }}</label>
              </div>
              <div class="form-floating">
                <input v-model="user_reg.repassword" type="password" class="form-control" id="floatingRePassword" placeholder="Password">
                <label for="floatingRePassword">{{ formData.repassword }}</label>
              </div>
              <hr>
              <div class="row">
                <div class="col-6">
                  <button type="submit" class="btn btn-dark">{{ formData.submit }}</button>
                </div>
                <div class="col-6">
                  <div class="text-end">
                    <span class="me-3">
                      {{ formData.signup_with }}
                    </span>
                    <img @click="googleAuth" src="/images/3-google.png" :title="formData.google_hint" class="bi me-3" width="36" height="36" style="cursor: pointer;">
                    <img @click="registerMetamask" src="/images/3-metamask.png" :title="formData.metamask_hint" class="bi" width="36" height="36" style="cursor: pointer;">
                  </div>          
                </div>
              </div>
            </form>
            <hr>
            <p v-html="formData.privacy_text" style="text-align: justify;"></p>
          </div>
        </div>
      </div>
    </div>
  </div>  
</template>

<style scoped>
</style>
