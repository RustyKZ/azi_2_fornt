<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters } from 'vuex';
  import { email_check_auth } from '@/js/auth';

  export default {
    name: 'Error_500_Page',

    computed: {
      ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser']),
    },

    watch: {
      getCurrentLanguage(newLanguage) {
        this.update(newLanguage);      
      },
      getUser() { },
    },

    data() {
      return {
        interfaceData: {},
        globalInterfaceData: [],
        userData: {
          is_auth: false,
          is_auth_web3: false,
          django_name: '',
          user_id: 0,
          nickname: '',
          wallet: '',
          active_table: 0
        },
      };
    },

    async created() {     
      await this.getInterface(); 
    },

    async mounted() {
      const getUserData = await email_check_auth();
      this.userData = getUserData;      
    },

    methods: {
      async getInterface() {      
        try {        
          const response = await axios.get(`${serverUrl}/api/get_servererror_interface`);        
          try {
            this.globalInterfaceData = response.data
            if (response.data[this.getCurrentLanguage-1]['label']) {
              this.interfaceData = response.data[this.getCurrentLanguage-1]['form'];
            } 
          } catch {
            this.interfaceData = response.data[0]['form'];          
          }        
        } catch (error) {
          console.error('TABLES HALL GET INTERFACE error :', error);
        }
      },
      async update(newLanguage) {
        try {
          if (this.globalInterfaceData[newLanguage-1]['label']) {
            this.interfaceData = this.globalInterfaceData[newLanguage-1]['form'];            
          } 
        } catch {
          this.interfaceData = this.globalInterfaceData[0]['form'];          
        }
      },
      goToHomePage() {
        this.$router.push('/');
      },
    }

  }

</script>

<template>
  <div class="mainbox">
    <div class="container-fluid d-flex align-items-center justify-content-center">
      <div class="container mt-3 mb-3">
        <div class="row p- pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-4 border shadow-lg" style="background: aliceblue">

          <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
            <h4 class="display-5 fw-bold lh-1 text-body-emphasis">{{ interfaceData.title }}</h4>
            <p class="lead mt-2">{{ interfaceData.text }}</p>
            <div class="d-grid gap-2 d-md-flex justify-content-md-start mb-4 mb-lg-3">
              <button @click="goToHomePage" type="button" class="btn btn-secondary btn-lg px-4 me-md-2 fw-bold">{{ interfaceData.button_home }}</button>              
            </div>
          </div>

          <div class="col-lg-4 offset-lg-1 p-0">
            <div class="container d-flex align-items-center justify-content-center">
              <img class="mb-4" src="images/server_error.png" style="width: 320px">
            </div>
          </div>
        </div>
      </div>
    </div>    
  </div>
</template>

<style scoped>
.mainbox {
    display: flex;
    /*justify-content: center;
    align-items: center;*/
    font-size: 16px;
    width: 100%;
    margin: 0;
    padding: 0;
    cursor: default;
}
</style>
