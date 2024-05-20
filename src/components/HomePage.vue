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
        this.update(newLanguage);
      },
    },

    data() {
      return {
        homepageData: {},
        formData: {},
        articles: [],
        noContent: false,
        noContentMessage: '',
        noContentHeader: '',
      };
    },

    created() {
      this.fetchApiForm(this.getCurrentLanguage);
      this.getHomepageData(this.getCurrentLanguage);
    },

    methods: {
      async fetchApiForm(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_homepage_form/${languageId}`);
          this.formData = response.data;
          this.noContentMessage = this.formData[this.getCurrentLanguage-1].form.no_content;
          this.noContentHeader = this.formData[this.getCurrentLanguage-1].form.notice;
          //console.log('HOMEPAGE - FORM: ', this.formData);
        } catch (error) {
          console.error('HOMEPAGE - Error fetching API Form:', error);
        }
      },

      async getHomepageData(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_homepage_data/${languageId}`);
          this.homepageData = response.data;
          if (this.homepageData.result) {
            this.articles = JSON.parse(this.homepageData.articles);
            //console.log('HOMEPAGE - DATA: ', this.homepageData);
          } else {
            this.noContent = true;
            //console.log('HOMEPAGE - DATA: ', this.homepageData);
          }          
        } catch (error) {
          this.noContent = true;
          console.error('HOMEPAGE - Error fetching API data:', error);
        }
      },

      async update(newLanguage) {
        this.noContent = false;
        await this.fetchApiForm(newLanguage);
        await this.getHomepageData(newLanguage);
      },

      getArticleImage(imagePath) {
        return serverUrl + '/' + imagePath;
      },

      formatDate(dateString) {    
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // Добавляем ноль перед однозначными месяцами
        const day = ('0' + date.getDate()).slice(-2); // Добавляем ноль перед однозначными днями
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
      }
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
      
        <img :src="getArticleImage(article.fields.image)" alt="Article Image" class="img-container rounded-3 mb-3 mt-1">
        <p style="text-align: justify"><b>{{ article.fields.subtitle }}</b></p>
        <p v-html="article.fields.text" style="text-align: justify;"></p>
        <p><i>{{ formatDate(article.fields.publicdate) }}</i></p>
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
    cursor: default;  

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