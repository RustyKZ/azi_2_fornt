<script>
  import axios from 'axios';
  import { serverUrl } from '../main';
  import { mapGetters } from 'vuex';

  export default {
    name: 'SignupPage',
    props: ['signupArgument'],

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
        allUsers: {},
        user_reg: {
          name: '',
          email: '',
          password: '',
          repassword: '',
          ref_code: '',
        },
        user_login:{
          email: '',
          password: '',
        },        
        alertModalData: {          
          title: 'Modal title',
          content: 'Modal content',
          button: 'Close'
        },
        alertVisible: false,
        successVisible: false,

      };
    },

    created() {      
      this.fetchApiForm(this.getCurrentLanguage);
      this.refCodeChecking();      
    },

    methods: {
      refCodeChecking() {
        if (this.signupArgument && this.signupArgument.startsWith('ref=')) {
          this.user_reg.ref_code = this.signupArgument.slice(4);
        } else {
          this.user_reg.ref_code = '';
        }
      },

      async fetchApiForm(languageId) {
        try {
          const response = await axios.get(`${serverUrl}/api/get_signup_form/${languageId}`);
          this.formData = response.data;          
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      },

      async update(newLanguage) {      
        await this.fetchApiForm(newLanguage);
      },

      async getUsers() {
        try {
          const response = await axios.get(`${serverUrl}/api/get_users`);
          this.allUsers = response.data;
        } catch (error) {
          console.error('Error fetching API data:', error);
          this.modalErrorServer();
        }
      },

      async registerUser() {
        console.log('Register user function', this.user_reg);
        await this.getUsers();
        const userExists = this.allUsers.some(user => user.nickname === this.user_reg.name);
        const emailExists = this.allUsers.some(user => user.email === this.user_reg.email);
        const passwordError = !(this.user_reg.password === this.user_reg.repassword);
        const passwordShort = !(this.user_reg.password.length >= 5 && this.user_reg.password.length <= 50)
        const nameError = !(this.user_reg.name.length >= 5 && this.user_reg.name.length <= 30)
        if (userExists) {
          this.modalErrorName();
        } else if (emailExists) {
          this.modalErrorEmail();
        } else if (nameError) {
          this.modalErrorNameIncorrect();
        } else if (passwordError) {
          this.modalErrorPassword();
        } else if (passwordShort) {
          this.modalErrorPasswordShort();
        } else {
          try {
            const response = await axios.post(`${serverUrl}/api/user_signup`, this.user_reg);
            console.log('Register user', response);
            // Обработка успешного запроса, если нужно
            this.scrollToTop();
            this.successVisible = true;
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.$router.push('/');
          } catch (error) {
            if (error.response) {
              // Ошибка 4XX (клиентская ошибка)
              console.error('Client error:', error.response.status);
              this.modalErrorClient();
            } else if (error.request) {
              // Ошибка связанная с запросом (например, отсутствие ответа)
              console.error('Request error:', error.request);
              this.modalErrorClient();
            } else {
              // Ошибка при настройке запроса
              console.error('Setup error:', error.message);
              this.modalErrorClient();
            }
              // Обработка ошибок 5XX или других ошибок
              this.modalErrorServer();
          }          
        }
      },

      async registerGoogle() {
        console.log('Register Google function', this.user_reg);
        const response = await axios.post(`${serverUrl}/api/user_signup`, this.user_reg);
        this.modalErrorServer();
        console.log('Register user',response)
      },

      async registerMetamask() {
        console.log('Register Metamask function', this.user_reg);
        const response = await axios.post(`${serverUrl}/api/user_signup`, this.user_reg);
        // this.modalErrorMetamask();
        this.scrollToTop();
        this.successVisible = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.$router.push('/');
        console.log('Register user',response)
      },

      modalErrorClient() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_incorrect;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      modalErrorServer() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_server;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      modalErrorName() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_name;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      modalErrorPassword() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_password;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      modalErrorPasswordShort() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_passwordshort;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      modalErrorNameIncorrect() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_nameincorrect;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      modalErrorEmail() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_email;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      modalErrorMetamask() {
        this.alertModalData.title = this.formData.alert_title_error;
        this.alertModalData.content = this.formData.alert_content_metamask;
        this.alertModalData.button = this.formData.alert_button_close;
        this.alertVisible = true;
      },

      scrollToTop() {
        // Для плавного скролла (если поддерживается)
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
          top: 0,
          behavior: 'smooth'
          });
        } else {
          // Для браузеров, не поддерживающих плавный скролл
          window.scrollTo(0, 0);
        }
      },

    }

  }

</script>

<template>
  <BModal v-model="alertVisible" id="alertModal" centered :title="alertModalData.title" :okTitle="alertModalData.button" okVariant="secondary" ok-only="true">
    <p class="my-4">{{ alertModalData.content }}</p>
  </BModal>
  {{ allUsers }}
  <div class="container">    
    <div class="content">
      <div class="mainbox">

        <div class="container my-3">
          <div v-if="successVisible" class="alert alert-success" role="alert">
            <b>{{ formData.alert_congrats }}</b> {{ formData.alert_successful }}
          </div>
          <div class="bg-body-tertiary p-5 rounded">
            
            <h3>{{ formData.title }}</h3>
            <hr>            

            <form @submit.prevent="registerUser">
              <div class="form-floating mb-3">
                <input v-model="user_reg.name" type="text" class="form-control" id="floatingName" placeholder="name@example.com" :title="formData.nickname_hint">
                <label for="floatingName">{{ formData.nickname }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_reg.email" type="email" class="form-control" id="floatingEmail" placeholder="name@example.com" :title="formData.email_hint">
                <label for="floatingEmail">{{ formData.email }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_reg.ref_code" type="text" class="form-control" id="floatingRef" :placeholder="user_reg.ref_code" :title="formData.ref_code_hint">
                <label for="floatingRef">{{ formData.ref_code }}</label>
              </div>
              <div class="form-floating mb-3">
                <input v-model="user_reg.password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
                <label for="floatingPassword">{{ formData.password }}</label>
              </div>
              <div class="form-floating">
                <input v-model="user_reg.repassword" type="password" class="form-control" id="floatingRePassword" placeholder="Password">
                <label for="floatingRePassword">{{ formData.repassword }}</label>
              </div>
              <hr>
              <div class="row">
                <div class="col-6">
                  <button type="submit" class="btn btn-dark">{{ formData.submit }}</button>
                </div>
                <div class="col-6">
                  <div class="text-end">
                    <span class="me-3">
                      {{ formData.signup }}
                    </span>
                    <img @click="registerGoogle" src="/images/3-google.png" :title="formData.google" class="bi me-3" width="36" height="36" style="cursor: pointer;">
                    <img @click="registerMetamask" src="/images/3-metamask.png" :title="formData.metamask" class="bi" width="36" height="36" style="cursor: pointer;">
                  </div>          
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>  
</template>

<style scoped>
</style>
