<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters } from 'vuex';
  export default {
    name: 'HomePage',

    computed: {
      ...mapGetters(['getCurrentLanguage']),
    },

    watch: {
      getCurrentLanguage(newLanguage) {
        // Вызываем нужную функцию при изменении getCurrentLanguage
        this.update(newLanguage);
      },
    },

    data() {
      return {
        headerData: {},
      };
    },

    created() {      
      this.fetchApiHeader(this.getCurrentLanguage);
    },

    methods: {
      async fetchApiHeader(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_header/${languageId}`);
          this.headerData = response.data;          
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },
      async update(newLanguage) {
        // Выполняйте нужные действия, например, повторный запрос к серверу
        await this.fetchApiHeader(newLanguage);
      },
    }

  }
</script>

<template>
  <div class="container">
    Home page
    <br>
    {{ getCurrentLanguage }}
    <br>
    {{ headerData }}
  </div>  
</template>

<style scoped>
</style>
