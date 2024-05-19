<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters } from 'vuex';

  export default {
    name: 'PrivacyPolicyPage',

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
        pageData: {},
        formData: {},
        articles: [],
        noContent: false,
        noContentMessage: '',
        noContentHeader: '',
      };
    },

    async created() {     
      this.fetchApiForm(this.getCurrentLanguage);
      this.getPageData(this.getCurrentLanguage);
    },

    methods: {

      async fetchApiForm(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_rulespage_form/${languageId}`);
          this.formData = response.data;
          this.noContentMessage = this.formData[this.getCurrentLanguage-1].form.no_content;
          this.noContentHeader = this.formData[this.getCurrentLanguage-1].form.notice;
          
        } catch (error) {
          console.error('TERMSPAGE - Error fetching API Form:', error);
        }
      },


      async getPageData(languageId) {
        try {

          const response = await axios.get(`${serverUrl}/api/get_privacypolicypage_data/${languageId}`);
          this.pageData = response.data;
          if (this.pageData.result) {
            this.articles = JSON.parse(this.pageData.articles);
            console.log('TOKENPAGE - DATA: ', this.pageData);
          } else {
            this.noContent = true;
            console.log('TOKENPAGE - DATA: ', this.pageData);
          }          
        } catch (error) {
          this.noContent = true;
          console.error('TOKENPAGE - Error fetching API data:', error);
        }
      },
      
      async update(newLanguage) {
        this.noContent = false;
        await this.fetchApiForm(newLanguage);
        await this.getPageData(newLanguage);
      },

      getArticleImage(imagePath) {
        return serverUrl + '/' + imagePath;
      },

      goToHomePage() {
        this.$router.push('/');
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
      <div v-for="article in articles" :key="article.pk">
        <h2 >{{ article.fields.title }}</h2>        
        <img v-if="article.fields.image != null && article.fields.image !=''" :src="getArticleImage(article.fields.image)" alt="Article Image" class="img-container rounded-3 mb-3 mt-1">        
        <b><p v-html="article.fields.subtitle" style="text-align: justify"></p></b>
        <p v-html="article.fields.text" style="text-align: justify;"></p>
        <br>
      </div>
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
