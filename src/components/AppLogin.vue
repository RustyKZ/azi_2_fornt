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
        modalData: {          
          title: 'Modal title',
          content: 'Modal content',
          button: 'Close'
        },
        modalVisible: false,
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
            this.user = this.login_status.user_id;
            console.log('LOGIN USER: user is ', this.user);
            console.log('LOGIN USER: response is ', this.login_status);
            if (this.login_status.logged_in) {
              this.$router.push('/');  
            }
          }
        } 
        console.log(this.user_login);        
        
      },
      
      goToRecoveryPage() {
        this.$router.push('/recovery');
      },

      modalErrorIncorrect() {
        console.log('modalErrorIncorrect')
        this.modalData.title = this.formData.modal_title_error;
        this.modalData.content = this.formData.modal_client;
        this.modalData.button = this.formData.modal_button_close;
        this.modalVisible = true;
      },

      modalErrorWrong() {
        this.modalData.title = this.formData.modal_title_error;
        this.modalData.content = this.formData.modal_wrong;
        this.modalData.button = this.formData.modal_button_close;
        this.modalVisible = true;
      },

      google_auth() {
        // Google's OAuth 2.0 endpoint for requesting an access token
        var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
        // Create <form> element to submit parameters to OAuth 2.0 endpoint.
        var form = document.createElement('form');
        form.setAttribute('method', 'GET'); // Send as a GET request.
        form.setAttribute('action', oauth2Endpoint);
        // Parameters to pass to OAuth 2.0 endpoint.
        var params = {
              'client_id': '746578585810-cl1hd0s6kvde9dqq4u39gbpb68mmrpib.apps.googleusercontent.com',
              // 'redirect_uri': 'http://127.0.0.1:8000/api/user_login_google/',
              'redirect_uri': 'http://localhost:8080/oauth_google/',
              'response_type': 'token',
              'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly',
              'include_granted_scopes': 'true',
              'state': 'pass-through value'
        };
        // Add form parameters as hidden input values.
        for (var p in params) {
          var input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', p);
          input.setAttribute('value', params[p]);
          form.appendChild(input);
        }
        // Add form to page and submit it to open the OAuth 2.0 endpoint.
        document.body.appendChild(form);
        form.submit();

      }
    }

  }

</script>

<template>

  <BModal v-model="modalVisible" id="alertModal" centered :title="modalData.title" :okTitle="modalData.button" okVariant="secondary" ok-only="true">
    <p class="my-4">{{ modalData.content }}</p>
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
                      {{ formData.login_with }}
                    </span>

                    <img src="/images/3-google.png" :title="formData.google_hint" class="bi me-3" width="36" height="36" style="cursor: pointer" @click="google_auth">

                    <img src="/images/3-metamask.png" :title="formData.metamask_hint" class="bi" width="36" height="36" style="cursor: pointer;">
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
