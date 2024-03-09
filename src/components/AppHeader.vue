<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters, mapActions } from 'vuex';
  import { email_logout } from '../js/auth';
  import { walletConnect } from '../js/web3auth';
  import { trunc_10_3, trunc_9_4 } from '../js/supply'


  export default {
    name: 'AppHeader',
    props: ['languages'],

    data() {
      return {
        headerData: {},
        metamaskIsHovered: false,
        
      };
    },

    created() {
      this.fetchApiHeader(this.getCurrentLanguage);
    },
    
    mounted: async function() {
      console.log('MOUNTED');
    },

    computed: {
      ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser', 'getActiveTable']),
      userId() {
        return this.getUser.id;
      },
      userActiveTable() {
        return this.getActiveTable;
      },
    },

    watch: {      
      getUser() { }, 
      getActiveTable() { },
    },

    methods: {
      ...mapActions(['changeLanguage', 'setGlobalModalErrorOn', 'setGlobalError']),
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
        this.changeLanguage(newLanguage);        
        this.fetchApiHeader(this.getCurrentLanguage);
      },
      goToHomePage() {
        this.$router.push('/');
      },
      goToTablesPage() {
        this.$router.push('/tables');
      },
      goToGameRulesPage() {
        this.$router.push('/rules');
      },
      async goToToplistPage() {
        this.$router.push('/toplist');
      },
      goToAboutPage() {
        this.$router.push('/about');
      },
      goToProfilePage() {
        this.$router.push(`/profile/${this.getUser.id}`);
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
      returnTable(table_id) {
        this.$router.push(`/table/${table_id}`);
      },
      async metamaskConnect() {
        console.log('METAMASCT CONNECT');
        const walletStatus = await walletConnect('', this.getCurrentLanguage);
        console.log('METAMASK CONNECT response: ', walletStatus);
        if (walletStatus.logged_in) {
          console.log('METAMASK CONNECT ', walletStatus.logged_in);
          this.changeLanguage(walletStatus.user_language);
          this.$router.push('/');
        } else {
          this.setGlobalModalErrorOn();
          try {
            this.setGlobalError(walletStatus.error);
          } catch {
            this.setGlobalError(0);
          }
          console.log('METAMASK CONNECT ', walletStatus.logged_in);
        }
      },
      
      async metamaskDisonnect() {
        console.log('METAMASCT DISCONNECT');
        await email_logout();
        this.$router.push('/');
      },

      getTruncNickname() {
        return trunc_10_3(this.getUser.nickname)
      },

      getTruncWallet() {
        return trunc_9_4(this.getUser.wallet)
      }
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
        
        <ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">

          <li @click="goToTablesPage" class="btn btn-success me-2">{{ headerData.play }}</li>
          <li @click="goToGameRulesPage" class="nav-link px-2 text-white link_button" style="cursor: pointer;">{{ headerData.rules }}</li>
          <li @click="goToToplistPage" class="nav-link px-2 text-white link_button" style="cursor: pointer;">{{ headerData.top }}</li>
          <li @click="goToAboutPage" class="nav-link px-2 text-white link_button" style="cursor: pointer;">{{ headerData.about }}</li>
        </ul>

        <div class="text-end">
          <button v-if="isAuth" type="button" @click="goToProfilePage" class="btn btn-outline-primary me-2">{{ getTruncNickname() }}</button>
          <button v-if="isAuth && userActiveTable > 0" @click="returnTable(userActiveTable)" type="button" class="btn btn-primary me-2">{{ headerData.table }} {{ userActiveTable }}</button>
          <button v-if="isAuth && userActiveTable == -1" type="button" class="btn btn-primary me-2" style="cursor: default">{{ headerData.hall }}</button>
          <button v-if="!isAuth" @click="goToSignupPage" type="button" class="btn btn-outline-light me-2">{{ headerData.signup }}</button>
          <button v-if="!isAuth" @click="goToLoginPage" type="button" class="btn btn-outline-light me-2">{{ headerData.login }}</button>
          <button v-if="isAuth && !isAuthWeb3" @click="goToLogout" type="button" class="btn btn-outline-light me-2">{{ headerData.logout }}</button>
          <button v-if="!isAuth" type="button" @click="metamaskConnect" class="btn btn-outline-warning" :title="headerData.hint_wallet">{{ headerData.wallet }}</button>
          <button v-if="isAuth && !metamaskIsHovered && isAuthWeb3" @mouseover="metamaskIsHovered = true" type="button" class="btn btn-warning">{{ getTruncWallet() }}</button>
          <button v-if="isAuth && metamaskIsHovered && isAuthWeb3" @click="metamaskDisonnect" @mouseout="metamaskIsHovered = false" type="button" class="btn btn-danger me-2">{{ headerData.disconnect }}</button>

          <div class="btn-group" role="group">
            <button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <img class="link_button" :src="'/images/lang' + this.getCurrentLanguage + '.png'">
            </button>
            <ul class="dropdown-menu dropdown-menu-dark">
              <template v-for="language in languages" :key="language.id">
                <li v-if="language.id != this.getCurrentLanguage && language.status" @click="switchLanguage(language.id)" class="dropdown-item" style="cursor: pointer;">
                  <div><img class="link_button" :src="'/images/lang' + language.id + '.png'" > {{ language.name }} </div>
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
