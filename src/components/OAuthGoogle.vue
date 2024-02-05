<script>
  // import axios from 'axios';
  // import { serverUrl } from '../main';
  export default {
    name: 'OAuth_Google_Page',
    data() {
      return {
        authParams: {},
      };
    },

    created() {
      this.parseHashParams();
    },

    methods: {
      parseHashParams() {
        const hash = window.location.hash.substring(1);
        const params = hash.split('&');
        const parsedParams = {};
        params.forEach(param => {
        const [key, value] = param.split('=');
          parsedParams[key] = value;
        });
        this.authParams = parsedParams;
      }
    }

  }

</script>

<template>
  <div>
    OAuth
    <hr>
    {{ authParams }}
    <hr>
    <div v-if="authParams.access_token">
      Access Token: {{ authParams.access_token }}
    </div>
    <div v-if="authParams.expires_in">
      Expires In: {{ authParams.expires_in }}
    </div>

  </div>
</template>

<style scoped>
</style>
