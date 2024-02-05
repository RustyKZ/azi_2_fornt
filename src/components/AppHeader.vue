<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters, mapActions } from 'vuex';
  import { email_check_auth, email_logout } from '../js/auth'


  export default {
    name: 'AppHeader',
    props: ['languages'],

    data() {
      return {
        headerData: {},
        isLoggedByEmail: {},
      };
    },

    created() {      
      this.fetchApiHeader(this.getCurrentLanguage);
      email_check_auth();
    },

    computed: {
      ...mapGetters(['getCurrentLanguage', 'isAuthEmail', 'isAuthWeb3']),
    },

    methods: {
      ...mapActions(['changeLanguage']),
      async fetchApiHeader(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_header/${languageId}`);
          this.headerData = response.data;
          console.log(response.data)
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },

      switchLanguage(newLanguage) {
        // localStorage.setItem('currentLanguage', newLanguage);
        this.changeLanguage(newLanguage);        
        this.fetchApiHeader(this.getCurrentLanguage);
      },
      goToHomePage() {
        this.$router.push('/');
      },
      async goToToplistPage() {
        this.$router.push('/');
        this.isLoggedByEmail = await email_check_auth();
      },
      goToAboutPage() {
        this.$router.push('/about');
      },
      goToSignupPage() {
        this.$router.push('/signup');
      },
      goToLoginPage() {
        this.$router.push('/login');
      },
      async goToLogout() {
        await email_logout();
        this.$router.push('/');
      },

    }
  }

</script>

<template>

  <header class="p-3 text-bg-dark">
    <div class="container">
      <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">

        <div class="d-flex align-items-center text-white text-decoration-none">
          <img @click="goToHomePage" class="link_button mt-1 me-4" src="/images/logo.png" alt="AZI Online" style="cursor: pointer;">
        </div>
        {{ isAuthEmail }} {{ isAuthWeb3 }}
        <ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
          <li class="btn btn-success me-2">{{ headerData.play }}</li>
          <li class="nav-link px-2 text-white link_button">{{ headerData.rules }}</li>
          <li @click="goToToplistPage" class="nav-link px-2 text-white link_button" style="cursor: pointer;">{{ headerData.top }}</li>
          <li @click="goToAboutPage" class="nav-link px-2 text-white link_button" style="cursor: pointer;">{{ headerData.about }}</li>
        </ul>

        <div class="text-end">
          <button type="button" class="btn btn-outline-primary me-2">Username</button>
          <button type="button" class="btn btn-primary me-2">{{ headerData.table }} 1</button>          
          <button @click="goToSignupPage" type="button" class="btn btn-outline-light me-2">{{ headerData.signup }}</button>
          <button @click="goToLoginPage" type="button" class="btn btn-outline-light me-2">{{ headerData.login }}</button>
          <button @click="goToLogout" type="button" class="btn btn-outline-light me-2">{{ headerData.logout }}</button>
          <!--
          <button type="button" class="btn btn-outline-warning">{{ headerData.wallet }}</button>
          <button type="button" class="btn btn-warning">WalletAddress</button>          
          <button type="button" class="btn btn-danger me-2">{{ headerData.disconnect }}</button>
          -->

          <div class="btn-group" role="group">
            <button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <img class="link_button" :src="'/images/lang' + this.getCurrentLanguage + '.png'">
            </button>
            <ul class="dropdown-menu dropdown-menu-dark">
              <template v-for="language in languages" :key="language.id">
                <li v-if="language.id != this.getCurrentLanguage && language.status" @click="switchLanguage(language.id)" class="dropdown-item" style="cursor: pointer;">
                  <div><img class="link_button" :src="'/images/lang' + language.id + '.png'" > {{ language.name }}</div>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>


<style scoped>
</style>
