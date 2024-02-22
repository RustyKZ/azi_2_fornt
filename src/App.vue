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
      };
    },
    computed: {
      ...mapGetters(['globalModalError', 'isAuth', 'isAuthWeb3', 'globalErrorNumber', 'getCurrentLanguage', 'getUser']),
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
    },
    async created() {
      await this.fetchApiLanguages();
      await this.fetchApiErrors();
      await this.getCurrentUser();
    },

    methods: {
      ...mapActions(['setGlobalModalErrorOff', 'setGlobalError', 'setUser']),
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
          console.log('APP VUE AFTER - GET CURRENT USER - user data: ', userData);
        } else {
          this.$store.commit('setUser', {
          id: 0,
          nickname: '',
          django_name: '',
          active_table: 0,
          wallet: ''
        });
        }
      },
      modalErrorOn() {
        console.log('MODAL ERROR ON');
        try {
          console.log('MODAL ERROR ON _ LANG IS ', this.errorsData[this.getCurrentLanguage - 1].label);
          const currentErrors = this.errorsData[this.getCurrentLanguage - 1].error;
          let currentError = currentErrors.find(error => error.number === this.globalErrorNumber);
          if (!currentError) {
            currentError = currentErrors[0];            
          }
          this.modalData = currentError;
          console.log('ERROR IS ', currentError);
        } catch (error) {
          console.log('MODAL ERROR ON _ LANG IS 0');
          const currentErrors = this.errorsData[0].error;
          let currentError = currentErrors.find(error => error.number === this.globalErrorNumber);
          if (!currentError) {
            currentError = currentErrors[0];
          }
          this.modalData = currentError;
          console.log('ERROR IS ', currentError);
        }
      },
      modalErrorOff() {
        this.setGlobalModalErrorOff();
        this.setGlobalError(0);
        console.log('MODAL ERROR OFF');
      },
    },
  }
</script>

<template>
  <div><AppHeader :languages="languagesData"/></div>
  <div class="main-content">    
    <BModal v-model="globalModalError" id="alertModal" centered :title="modalData.title" :okTitle="modalData.button" okVariant="secondary" ok-only="true" @hide="modalErrorOff">
      <p class="my-4">{{ modalData.content }}</p>
    </BModal>    
    <router-view :key="routeKey"></router-view>
  </div>
  <div><AppFooter/></div>
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
