<template>
  <div><AppHeader :languages="languagesData"/></div>
  <div class="content">
    <router-view :key="routeKey"></router-view>
  </div>
  <div><AppFooter/></div>
</template>

<script>
  import axios from 'axios';
  import { serverUrl } from './main';
  import AppHeader from './components/AppHeader.vue'
  import AppFooter from './components/AppFooter.vue'

  export default {
    name: 'App',
    components: {
      AppHeader,
      AppFooter
    },

    data() {
      return {
        languagesData: {},
      };
    },

    created() {
      this.fetchApiLanguages();
    },

    methods: {
      async fetchApiLanguages() {
        try {
          const response = await axios.get(serverUrl+'/api/get_languages');
          this.languagesData = response.data;
          console.log(response.data)
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      }
    },
  }
</script>

<style>
  #app {
    margin: 0;
    padding: 0;
    min-height: 100vh; /* Минимальная высота всего экрана */
    display: flex;
    flex-direction: column; /* Элементы будут располагаться вертикально */
    background: Honeydew;
  }
  .content {
    flex-grow: 1;
    background: LightGrey;
  }
  .full {
    width: 100%;
  }
</style>
