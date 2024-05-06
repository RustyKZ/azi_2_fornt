<script>
  import axios from 'axios';
  import { serverUrl } from './main';
  import AppHeader from './components/AppHeader.vue';
  import AppFooter from './components/AppFooter.vue';
  import { mapGetters, mapActions } from 'vuex';
  import { email_check_auth } from './js/auth';

  export default {
    name: 'App',
    components: {
      AppHeader,
      AppFooter
    },

    data() {
      return {
        languagesData: {},
        errorsData: {},
        modalData: {title: '', content: '', button: ''},
        airdropCoins: [],
        referalCoins: []
      };
    },
    computed: {
      ...mapGetters(['globalModalError', 'isAuth', 'isAuthWeb3', 'globalErrorNumber', 'getCurrentLanguage', 'getUser', 'getGlobalErrorCustomText', 'getAirdropCoins', 'getReferalCoins']),
      isTableRoute() {
        const currentPath = this.$route.path;      
        return currentPath.startsWith('/table/') || currentPath.startsWith('/sandbox/');
      },
    },
    watch: {
      globalModalError() {
        this.modalErrorOn();
      },
      isAuth() {
        this.getCurrentUser();
      },
      isAuthWeb3() {
        this.getCurrentUser();
      },
      globalErrorNumber() {
        this.modalErrorOn();
      }
    },
    async created() {
    },
    async mounted() {      
      await this.fetchApiLanguages();
      await this.fetchApiErrors();
      await this.getCurrentUser();
      this.$socket.on('get_private_message', (data) => {
        this.getPrivateMessage(data);
      });
    },
    methods: {
      ...mapActions(['setGlobalModalErrorOff', 'setGlobalError', 'setUser', 'setActiveTable', 'setGlobalModalErrorOn', 'setGlobalErrorCustomText']),

      async getPrivateMessage(data) {
        console.log('APP: GET PRIVATE MESSAGE - ', data);
        if (data.status) {
            if (data.error == 712) {
                this.setGlobalError(data.error);
                this.setGlobalModalErrorOn();
                console.log('GET PRIVATE MESSAGE - DATA: ', data)
                await this.getCurrentUser();
            } else if (data.error == 710) {
                this.setGlobalError(data.error);
                this.setGlobalModalErrorOn();
                console.log('GET PRIVATE MESSAGE - DATA: ', data)
                await this.getCurrentUser();
            }
        } else {
            console.log('GET PRIVATE MESSAGE - DATA: ', data);
        }
    },

      async fetchApiLanguages() {
        try {
          const response = await axios.get(serverUrl+'/api/get_languages');
          this.languagesData = response.data;
          console.log(response.data)
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },
      async fetchApiErrors() {
        try {
          const response = await axios.get(serverUrl+'/api/get_errors');
          this.errorsData = response.data;
          console.log('FETCH API ERRORS', response.data)
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },
      async getCurrentUser() {
        const userData = await email_check_auth();
        console.log('APP VUE - GET CURRENT USER - check auth data: ', userData)
        if (userData['is_auth']) {
          this.$store.commit('setUser', {
            id: userData['user_id'],
            nickname: userData['nickname'],
            django_name: userData['django_name'],
            active_table: userData['active_table'],
            wallet: userData['wallet']          
          });
          this.$store.commit('setActiveTable', userData['active_table']);
          console.log('APP VUE AFTER - GET CURRENT USER - user data: ', userData);
          this.$socket.emit('update_socket_sid', { user_id: userData['user_id'] });          
        } else {
          this.$store.commit('setUser', {
          id: 0,
          nickname: '',
          django_name: '',
          active_table: 0,
          wallet: ''
        });
          this.$store.commit('setActiveTable', 0);
        }
      },

      modalErrorOn() {
        console.log('APP: MODAL ERROR ON');
        try {
          console.log('APP: MODAL ERROR ON _ LANG IS ', this.errorsData[this.getCurrentLanguage - 1].label);
          const currentErrors = this.errorsData[this.getCurrentLanguage - 1].error;
          let currentError = currentErrors.find(error => error.number === this.globalErrorNumber);
          if (!currentError) {
            currentError = currentErrors[0];            
          }
          this.modalData = currentError;
          if (currentError['number'] === 1001) {
            this.createCustomText1001();
          }
          console.log('ERROR IS ', currentError);
        } catch (error) {
          console.log('APP: MODAL ERROR ON - catch _ LANG IS 0');
          const currentErrors = this.errorsData[0].error;
          let currentError = currentErrors.find(error => error.number === this.globalErrorNumber);
          if (!currentError) {
            currentError = currentErrors[0];
          }
          this.modalData = currentError;
          if (currentError['number'] === 1001) {
            this.createCustomText1001();
          }
          console.log('ERROR IS ', currentError);
        }

      },
      modalErrorOff() {
        this.setGlobalModalErrorOff();
        this.setGlobalError(0);
        console.log('MODAL ERROR OFF');
      },

      textNumber(number) {
        if (typeof number !== 'number') {
            return '';
        }
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },

      createCustomText1001() {
        this.airdropCoins = this.getAirdropCoins;
        this.referalCoins = this.getReferalCoins;
        let noticeCustomText = '<p>' + this.modalData['content'] + '</p>'
        if (this.airdropCoins[0] !== 0 || this.airdropCoins[1] !== 0 || this.airdropCoins[2] !== 0) {
          noticeCustomText += '<ul><li style="list-style-type: none; font-weight: bold;">' + this.modalData['subtitle_1'] + '</li>';
          if (this.airdropCoins[0] !== 0) {
            noticeCustomText += '<li>' + this.modalData['coin_0'] + this.textNumber(this.airdropCoins[0]) + '</li>';
          }
          if (this.airdropCoins[1] !== 0) {
            noticeCustomText += '<li>' + this.modalData['coin_1'] + this.textNumber(this.airdropCoins[1]) + '</li>';
          }
          if (this.airdropCoins[2] !== 0) {
            noticeCustomText += '<li>' + this.modalData['coin_2'] + this.textNumber(this.airdropCoins[2]) + '</li>';
          }
          noticeCustomText += '</ul>';
        }
        if (this.referalCoins[0] !== 0 || this.referalCoins[1] !== 0 || this.referalCoins[2] !== 0) {
          noticeCustomText += '<ul><li style="list-style-type: none; font-weight: bold;">' + this.modalData['subtitle_2'] + '</li>';
          if (this.referalCoins[0] !== 0) {
            noticeCustomText += '<li>' + this.modalData['coin_0'] + this.textNumber(this.referalCoins[0]) + '</li>';
          }
          if (this.referalCoins[1] !== 0) {
            noticeCustomText += '<li>' + this.modalData['coin_1'] + this.textNumber(this.referalCoins[1]) + '</li>';
          }
          if (this.referalCoins[2] !== 0) {
            noticeCustomText += '<li>' + this.modalData['coin_2'] + this.textNumber(this.referalCoins[2]) + '</li>';
          }
          noticeCustomText += '</ul>';
        }
        this.setGlobalErrorCustomText(noticeCustomText);
        console.log('create CUSTOM TEXT 1001', this.airdropCoins,' - ', this.referalCoins);
      }
    },
  }
</script>

<template>
  <div><AppHeader v-if="!isTableRoute" :languages="languagesData"/></div>
  <div class="main-content">    
    <BModal v-model="globalModalError" id="alertModal" centered :title="modalData.title" :okTitle="modalData.button" okVariant="secondary" ok-only="true" @hide="modalErrorOff">
      <p v-if="globalErrorNumber < 1000"  class="my-4" style="text-align: justify;">{{ modalData.content }} </p>
      <p v-else v-html="getGlobalErrorCustomText" style="text-align: justify;"></p>
    </BModal>
    <router-view ></router-view>
  </div>
  <div><AppFooter v-if="!isTableRoute" /></div>
</template>


<style>
  #app {
    margin: 0;
    padding: 0;
    min-height: 100vh; /* Минимальная высота всего экрана */    
    display: flex;
    flex-direction: column; /* Элементы будут располагаться вертикально */
    background: Honeydew;
  }
  .main-content {
    flex-grow: 1;
    height: 100%;    
    background: LightGrey;
    display: flex;
  }
  .content {
    flex-grow: 1;
    height: 100%;    
    
  }
  .full {
    width: 100%;
  }
</style>
