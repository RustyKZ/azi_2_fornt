<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'AppFooter',
    props: ['languages'],

    computed: {
      ...mapGetters(['getCurrentLanguage']),
    },

    watch: {
      getCurrentLanguage(newLanguage) {
        this.fetchApiFooter(newLanguage);
      },
    },

    data() {
      return {
        footerData: {
        },          
      };      
    },

    created() {      
      this.fetchApiFooter(this.getCurrentLanguage);
    },

    methods: {
      ...mapActions(['changeLanguage']),

      async fetchApiFooter(languageId) {
        try {
          // console.log('API Footer data')
          const response = await axios.get(`${serverUrl}/api/get_footer/${languageId}`);
          this.footerData = response.data;
          // console.log(response.data)
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },
    }
  }
</script>

<template>
  <div class="container">
    <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
      <div class="col-md-5 d-flex align-items-center">
        <a :href="footerData.path_support" :title="footerData.hint_support" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
          <img src="/images/logo-footer.png" class="bi" height="36">
        </a>
        <span class="mb-3 mb-md-0 text-body-secondary">{{ footerData.text_copyright }}</span>
      </div>
      <div>
        <a :href="footerData.path_appstore" :title="footerData.hint_appstore" class="mb-3 me-4 mb-md-0 text-body-secondary text-decoration-none lh-1"><img src="/images/appstore.png" class="bi" height="44"></a>
        <a :href="footerData.path_googleplay" :title="footerData.hint_googleplay" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1"><img src="/images/googleplay.png" class="bi" height="44"></a>

        <!-- <button class="btn btn-outline-success me-2"> Partner Link 1 </button>
                <button class="btn btn-outline-success me-2"> Partner Link 2 </button> -->
      </div>

      <ul class="nav col-md-3 justify-content-end list-unstyled d-flex">
        <li v-if="footerData.path_discord" class="me-2"><a class="text-body-secondary" :href="footerData.path_discord" :title="footerData.hint_discord" target="_blank"><img src="/images/3-discord.png" class="bi" width="36" height="36"></a></li>
        <li v-if="footerData.path_reddit" class="me-2"><a class="text-body-secondary" :href="footerData.path_reddit" :title="footerData.hint_reddit" target="_blank"><img src="/images/3-reddit.png" class="bi" width="36" height="36"></a></li>
        <li v-if="footerData.path_telegram" class="me-2"><a class="text-body-secondary" :href="footerData.path_telegram" :title="footerData.hint_telegram" target="_blank"><img src="/images/3-telegram.png" class="bi" width="36" height="36"></a></li>
        <li v-if="footerData.path_x" class="me-2"><a class="text-body-secondary" :href="footerData.path_x" :title="footerData.hint_x" target="_blank"><img src="/images/3-x.png" class="bi" width="36" height="36"></a></li>
        <li v-if="footerData.path_facebook" class="me-2"><a class="text-body-secondary" :href="footerData.path_facebook" :title="footerData.hint_facebook" target="_blank"><img src="/images/3-facebook.png" class="bi" width="36" height="36"></a></li>
        <li v-if="footerData.path_instagram" class="me-2"><a class="text-body-secondary" :href="footerData.path_instagram" :title="footerData.hint_instagram" target="_blank"><img src="/images/3-instagram.png" class="bi" width="36" height="36"></a></li>
      </ul>

    </footer>
  </div>
</template>

<style scoped>
</style>
