<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters, mapActions } from 'vuex';
  import { email_check_auth } from '../js/auth';
  import { get_ip_address } from '@/js/ip_address.js';

  export default {
    name: 'RecoveryPage',
    components: {

    },

    computed: {
      ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser']),
    },

    watch: {
      getCurrentLanguage(newLanguage) {
        this.update(newLanguage);
        this.getInterface();      
      },

      getUser() { },

      isAuth() {
        this.goToAccessDenied();
      },
    },

    data() {
      return {
        interfaceData: {},
        globalInterfaceData: [],
        user_data: {
          email: '',
          password: '',
          repassword: '',
          reset_time: 0,
          reset_try: 0,
          resetCode: ''
        },
        verificationCode: '',      
        timeCount: '',
        timerRunning: false,
        timer: null,
        stage: 1,
      };
    },

    async created() {      
      const userData = await email_check_auth();    
      if (userData['is_auth']) {
        //console.log('RECOVERY PAGE - AccessDenied');
        this.goToAccessDenied(); // Переход на страницу доступа запрещен, если пользователь не авторизован
      }
      await this.getInterface();      
    },

    beforeUnmount() {
      clearInterval(this.timer);
    },

    methods: {
      ...mapActions(['setGlobalModalErrorOn', 'setGlobalError', 'changeLanguage', 'setGlobalErrorCustomText', 'setAirdropCoins', 'setReferalCoins']),
      
      startTimer() {
        if (!this.timerRunning) {          
          this.timer = setInterval(() => {
            let secondsRemaining = null
            if (!this.user_data || !this.user_data.reset_time || this.user_data.reset_time === 0) {              
              secondsRemaining = null;
            } else {
              const currentTime = Math.floor(Date.now() / 1000); // Текущее время в формате UNIX
              secondsRemaining = this.user_data.reset_time - currentTime;
            }          
            if (secondsRemaining === null) {              
              this.timeCount = '';
            } else if (secondsRemaining >= 0) {
              const time = new Date(secondsRemaining * 1000).toISOString().substr(11, 8);
              this.timeCount = time;
            } else {              
              this.timeCount = '';
              this.stopTimer();
              this.$router.push('/');
            }
          }, 1000); // Обновление каждую секунду
          this.timerRunning = true;
          
        }
      },

      async stopTimer() {      
        clearInterval(this.timer);
        this.timerRunning = false;
        this.timer = null;
      },

      goToAccessDenied() {
        if (this.isAuth) {
          this.$router.push('/access_denied');
        }
      },

      async update(newLanguage) {
        await this.getInterface(newLanguage);
      },

      async getInterface() {      
        try {
          const response = await axios.get(`${serverUrl}/api/get_recovery_interface`);        
          try {
            this.globalInterfaceData = response.data
            if (response.data[this.getCurrentLanguage-1]['label']) {
              this.interfaceData = response.data[this.getCurrentLanguage-1]['form'];
              this.cointypeDropdown = this.interfaceData.cointypes
            } 
          } catch {
            this.interfaceData = response.data[0]['form'];
            this.cointypeDropdown = this.interfaceData.cointypes
          }        
        } catch (error) {
          console.error('TOPLIST GET INTERFACE error :', error);
        }
      },

      async getCode() {
        //console.log('GET CODE');
        try {
          const ip_address = await get_ip_address();
          const dataToSend = {
            'email': this.user_data.email,
            'ip_address': ip_address
          }
          this.setGlobalError(490);
          this.setGlobalModalErrorOn();
          const response = await axios.post(`${serverUrl}/api/user_password_reset`, dataToSend);
          if (response.data['result']) {
            //console.log('RESET PASSWORD CODE response: ', response.data);
            this.user_data.reset_time = response.data['reset_time'];
            this.user_data.reset_try = response.data['reset_try'];
            this.setGlobalError(491);
            this.setGlobalModalErrorOn();
            this.startTimer();
            this.stage = 2;
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
          }
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
        }
      },

      async sendCode() {
        //console.log('SEND CODE');
        try {
          const ip_address = await get_ip_address();
          const dataToSend = {
            'email': this.user_data.email,
            'ip_address': ip_address,
            'reset_code': this.user_data.resetCode,
          }
          const response = await axios.post(`${serverUrl}/api/user_password_reset_code`, dataToSend);
          if (response.data['result']) {
            //console.log('RESET PASSWORD RESET CODE response: ', response.data);
            this.user_data.reset_time = response.data['reset_time'];
            this.user_data.reset_try = response.data['reset_try'];
            this.stopTimer();
            this.stage = 3;
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            try {
              if (response.data['code'] === 492) {
                this.user_data.reset_try = response.data['reset_try'];
              } else if (response.data['code'] === 493) {
                this.user_data.email = '';
                this.user_data.password = '';
                this.user_data.repassword = '';
                this.user_data.reset_time = 0;
                this.user_data.reset_try = 0;
                this.user_data.resetCode = '';
                this.stage = 1;
                this.stopTimer();
              }
            } catch(e) {
              console.error('APP RECOVERY - SEND CODE', e)
            }
          }
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
        }
      },

      async setPassword() {
        //console.log('SET PASSWORD');
        try {
          if (this.user_data.password !== this.user_data.repassword) {
            this.setGlobalError(462);
            this.setGlobalModalErrorOn();
          } else if (!(this.user_data.password.length >= 8 && this.user_data.password.length <= 50)) {
            this.setGlobalError(463);
            this.setGlobalModalErrorOn();
          } else {
            const ip_address = await get_ip_address();
            const dataToSend = {
              'email': this.user_data.email,
              'ip_address': ip_address,
              'password': this.user_data.password,
            }
            const response = await axios.post(`${serverUrl}/api/user_password_reset_password`, dataToSend);
            if (response.data['result']) {
              //console.log('RESET PASSWORD RESET CODE response: ', response.data);
              this.setGlobalError(494);
              this.setGlobalModalErrorOn();
              this.stopTimer();
              this.$router.push('/');
            } else {

              this.setGlobalError(response.data['code']);
              this.setGlobalModalErrorOn();
            }
          }          
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
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
            <h3>{{ interfaceData.title }}</h3>
            <hr>
            <form v-if="stage === 1" @submit.prevent="getCode"> 
              <p>{{ interfaceData.text_email }}</p>
              <div class="form-floating mb-3">                
                <input v-model="user_data.email" type="email" class="form-control" id="floatingEmail" placeholder="name@example.com">
                <label for="floatingEmail">{{ interfaceData.email }}</label>
              </div>
              <button type="submit" class="btn btn-dark">{{ interfaceData.button_getcode }}</button>              
            </form>
            
            <form v-if="stage === 2" @submit.prevent="sendCode" :title=interfaceData.hint_code>
              <p>{{ interfaceData.text_code }}</p>
              <div class="form-floating mb-3">
                <input v-model="user_data.resetCode" class="form-control" id="floatingCode" placeholder="name@example.com">
                <label for="floatingCode">{{ interfaceData.enter_code }}</label>
              </div>
              <button type="submit" class="me-3 btn btn-dark">{{ interfaceData.button_sendcode }}</button>
              {{ interfaceData.try_remaining }} {{ user_data.reset_try }} | {{ interfaceData.time_remaining }} {{ timeCount }}
            </form>
            
            <form v-if="stage === 3" @submit.prevent="setPassword">
              <p>{{ interfaceData.text_password }}</p>
              <div class="form-floating mb-3">
                <input v-model="user_data.password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
                <label for="floatingPassword">{{ interfaceData.password }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_data.repassword" type="password" class="form-control" id="floatingRePassword" placeholder="Password">
                <label for="floatingRePassword">{{ interfaceData.repassword }}</label>
              </div>
              <button type="submit" class="btn btn-dark">{{ interfaceData.button_submit }}</button>
            </form>

            <hr>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
