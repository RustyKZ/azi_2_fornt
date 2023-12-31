<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters } from 'vuex';
  import { email_login } from '../js/auth'

  export default {
    name: 'LoginPage',
    components: {

    },

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
        formData: {},
        user: {},
        user_login: {
          email: '',
          password: '',
        },
        alertModalData: {          
          title: 'Modal title',
          content: 'Modal content',
          button: 'Close'
        },
        alertVisible: false,
        login_status: {},
      };
    },

    created() {      
      this.fetchApiForm(this.getCurrentLanguage);
    },

    methods: {

      async fetchApiForm(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_login_form/${languageId}`);
          this.formData = response.data;          
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },

      async update(newLanguage) {      
        await this.fetchApiForm(newLanguage);
      },

      async loginUser() {
        if (this.user_login.email === '' || !(this.user_login.password.length >= 5 && this.user_login.password.length <= 50)) {
          this.modalErrorIncorrect();
        } else {
          this.login_status = await email_login(this.user_login);
          if (this.login_status.code === 404 || this.login_status.code === 403) {
            this.modalErrorWrong();
          } else if (this.login_status.code === 200) {
            this.user = this.login_status.user;
          }
        } 
        console.log(this.user_login);        
        
      },
      
      goToRecoveryPage() {
        this.$router.push('/recovery');
      },

      modalErrorIncorrect() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_incorrect;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      modalErrorWrong() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_wrong;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },
    }

  }

</script>

<template>

  <BModal v-model="alertVisible" id="alertModal" centered :title="alertModalData.title" :okTitle="alertModalData.button" okVariant="secondary" ok-only="true">
    <p class="my-4">{{ alertModalData.content }}</p>
  </BModal>

  <div class="container">
    <div class="content">      
      <div class="mainbox">
          <div class="container my-3">
            <div class="bg-body-tertiary p-5 rounded">
            <h3>{{ formData.title }} - {{ login_status }}</h3>
            <hr>
            
            <form @submit.prevent="loginUser">
              
              <div class="form-floating mb-3">
                <input v-model="user_login.email" type="email" class="form-control" id="floatingEmail" placeholder="name@example.com">
                <label for="floatingInput">{{ formData.email }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_login.password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
                <label for="floatingPassword">{{ formData.password }}</label>
              </div>

              <hr>
              <div class="row">
                <div class="col-6">
                  <button type="submit" class="btn btn-dark">{{ formData.submit }}</button>
                </div>
                <div class="col-6">
                  <div class="text-end">
                    <span class="me-3">
                      {{ formData.login }}
                    </span>
                    <img src="/images/3-google.png" :title="formData.google" class="bi me-3" width="36" height="36" style="cursor: pointer;">
                    <img src="/images/3-metamask.png" :title="formData.metamask" class="bi" width="36" height="36" style="cursor: pointer;">
                  </div>          
                </div>
              </div>

              <hr>
              <span @click="goToRecoveryPage" class="badge text-bg-secondary" :title="formData.forgot_password_hint" style="cursor: pointer;">{{ formData.forgot_password }}</span>              
              
            </form>
            
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
</style>
