<script>
  import axios from 'axios';
  import { serverUrl, clientUrl, googleClientId } from '../main';
  import { mapGetters, mapActions } from 'vuex';
  import { email_login } from '../js/auth';
  import { walletConnect } from '@/js/web3auth';  

  export default {
    name: 'LoginPage',
    components: {

    },

    computed: {
      ...mapGetters(['getCurrentLanguage', 'isAuth']),
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
        user: 0,
        user_login: {
          email: '',
          password: '',
        },
        login_status: {},
      };
    },

    created() {      
      this.fetchApiForm(this.getCurrentLanguage);
    },

    methods: {
      ...mapActions(['setGlobalModalErrorOn', 'setGlobalError', 'changeLanguage', 'setGlobalErrorCustomText', 'setAirdropCoins', 'setReferalCoins']),
      async fetchApiForm(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_login_form/${languageId}`);
          this.formData = response.data;          
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },
      goToAccessDenied() {
        if (this.isAuth) {
          this.$router.push('/access_denied');
        }
      },
      async update(newLanguage) {      
        await this.fetchApiForm(newLanguage);
      },

      async getAirdropCoins() {
        const dataToSend = {
          'user_id': this.user,
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

      async loginUser() {
        if (this.user_login.email === '' || !(this.user_login.password.length >= 8 && this.user_login.password.length <= 50)) {
          this.modalErrorIncorrect();
        } else {
          this.login_status = await email_login(this.user_login);
          if (this.login_status.code === 404 || this.login_status.code === 403) {
            this.modalErrorWrong();
          } else if (this.login_status.code === 200) {
            this.user = this.login_status.user_id;
            console.log('LOGIN USER: user is ', this.user);
            console.log('LOGIN USER: response is ', this.login_status);
            this.changeLanguage(this.login_status.user_language)
            if (this.login_status.logged_in) {
              await this.getAirdropCoins();
              this.$router.push('/');
            }
          }
        } 
        console.log(this.user_login);        
        
      },
      
      goToRecoveryPage() {
        this.$router.push('/recovery');
      },

      modalErrorIncorrect() {
        this.setGlobalError(450);
        this.setGlobalModalErrorOn();
      },

      modalErrorWrong() {
        this.setGlobalError(451);
        this.setGlobalModalErrorOn();
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
              // 'redirect_uri': 'http://127.0.0.1:8000/api/user_login_google/',
              'redirect_uri': `${clientUrl}/oauth_google/`,
              'response_type': 'token',
              'scope': 'https://www.googleapis.com/auth/userinfo.email', //https://www.googleapis.com/auth/userinfo.profile 
              'include_granted_scopes': 'true',
              'state': 'pass-through value'
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

      async loginMetamask() {
        console.log('LOGIN METAMASK function');
        const walletStatus = await walletConnect('', this.getCurrentLanguage);
        console.log('LOGIN METAMASK response: ', walletStatus);
        if (walletStatus.logged_in) {
          this.user = walletStatus.user_id;
          console.log('METAMASK CONNECT ', walletStatus.logged_in, walletStatus);
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
    }

  }

</script>

<template>
  <div class="container">
    <div class="content">      
      <div class="mainbox">
        <div class="container my-3">
          <div class="bg-body-tertiary p-5 rounded">
            <h3>{{ formData.title }}</h3>
            <hr>
            <form @submit.prevent="loginUser">
              <div class="form-floating mb-3">
                <input v-model="user_login.email" type="email" class="form-control" id="floatingEmail" placeholder="name@example.com">
                <label for="floatingInput">{{ formData.email }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_login.password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
                <label for="floatingPassword">{{ formData.password }}</label>
              </div>              
              <div class="row">
                <div class="col-6">
                  <button type="submit" class="btn btn-dark">{{ formData.submit }}</button>
                </div>
                <div class="col-6">
                  <div class="text-end">
                    <span class="me-3">
                      {{ formData.login_with }}
                    </span>
                    <img @click="googleAuth" src="/images/3-google.png" :title="formData.google_hint" class="bi me-3" width="36" height="36" style="cursor: pointer" >
                    <img @click="loginMetamask" src="/images/3-metamask.png" :title="formData.metamask_hint" class="bi" width="36" height="36" style="cursor: pointer;">
                  </div>          
                </div>
              </div>
              <hr>
              <span @click="goToRecoveryPage" class="badge text-bg-secondary" :title="formData.forgot_password_hint" style="cursor: pointer;">{{ formData.forgot_password }}</span>                            
            </form>            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
