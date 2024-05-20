<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters } from 'vuex';
  export default {
    name: 'AboutPage',

    computed: {
      ...mapGetters(['getCurrentLanguage']),
    },

    watch: {
      getCurrentLanguage(newLanguage) {        
        this.update(newLanguage);
      },
    },

    data() {
      return {
        aboutpageData: {},
        formData: {},
        article: {
          'title': '',
          'subtitle': '',
          'text': '',
          'image': ''
        },
        noContent: false,
        noContentMessage: '',
        noContentHeader: '',
      };
    },

    created() {      
      this.fetchApiForm(this.getCurrentLanguage);
      this.getAboutpageData(this.getCurrentLanguage);
    },

    methods: {
      async fetchApiForm(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_aboutpage_form/${languageId}`);
          this.formData = response.data;
          this.noContentMessage = this.formData[this.getCurrentLanguage-1].form.no_content;
          this.noContentHeader = this.formData[this.getCurrentLanguage-1].form.notice;
          // console.log('ABOUTPAGE - FORM: ', this.formData);
        } catch (error) {
          console.error('ABOUTPAGE - Error fetching API Form:', error);
        }
      },

      async getAboutpageData(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_aboutpage_data/${languageId}`);
          // console.log('ABOUTPAGE - DATA: ', response);
          this.aboutpageData = response.data;
          if (this.aboutpageData.result) {
            this.article = this.aboutpageData.article;
            // console.log('ABOUTPAGE - DATA: ', this.aboutpageData);
          } else {
            this.noContent = true;
            // console.log('ABOUTPAGE - DATA: ', this.aboutpageData);
          }          
        } catch (error) {
          this.noContent = true;
          console.error('ABOUTPAGE - Error fetching API data:', error);
        }
      },

      async update(newLanguage) {
        this.noContent = false;
        await this.fetchApiForm(newLanguage);
        await this.getAboutpageData(newLanguage);
      },

      getArticleImage(imagePath) {
        return serverUrl + '/' + imagePath;
      },      
    }
  }
</script>

<template>
  <div class="mainbox">
    <div v-if="noContent" class="d-flex align-items-center justify-content-center">
      <div class="card text-bg-light mb-2 align-self-center" style="max-width: 50rem;">
        <div class="card-header">{{ noContentHeader }}</div>
        <div class="card-body">            
          <p class="card-text" style="text-align: justify">{{ noContentMessage }}</p>
        </div>        
      </div>
    </div>

    <div v-else class="custom-container">
    
        <h2>{{ article.title }}</h2>
        <img :src="getArticleImage(article.image)" alt="Article Image" class="img-container rounded-3 mb-3 mt-1">
        <p style="text-align: justify"><b>{{ article.subtitle }}</b></p>
        <p v-html="article.text" style="text-align: justify;"></p>
        
        <br>
    
    </div>
    
  </div>  
</template>

<style scoped>
.mainbox {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    width: 100%;
    margin: 0;
    padding: 0;
}
.custom-container {
    width: 1280px;
    justify-content: center;
    align-items: center;
    padding: 30px;
    margin: 20px;    
    background: white;    
}

.img-container {
    width: 100%; /* Масштабировать изображение по ширине родительского контейнера */
    height: auto; /* Масштабировать высоту пропорционально */
}
</style>