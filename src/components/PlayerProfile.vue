<script>
import axios from 'axios';
import { serverUrl, serverMail } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';
import { trunc_55 } from '../js/supply'

export default {
  name: 'PlayerProfile',
  components: {

  },

  computed: {
    ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser']),
  },

  watch: {
    getCurrentLanguage(newLanguage) {
      this.update(newLanguage);
      this.fetchApiForm();
    },
    getUser() { },

    '$route.params.user_id': {
      immediate: true, // Запустить наблюдение сразу после создания компонента
      handler() {
        this.getUserProfile();        
      },
    },

  },

  data() {
    return {
      formData: {},
      user: {},
      userId: 0,
      isEmailDefault: false,
      editingNickname: false,
      editingEmail: false,
      editingCountry: false,
      editingPhone: false,
      newNickname: '',
      newPhone: '',
      country: 0,          
      states: []
      
    };
  },

  async created() {
    const userData = await email_check_auth();    
    if (!userData['is_auth']) {
      console.log('PLAYER PROFILE AccessDenied')
      this.goToAccessDenied(); // Переход на страницу доступа запрещен, если пользователь не авторизован
    }
    await this.fetchApiForm();
    this.getUserProfile();
  },

  methods: {
    ...mapActions(['setGlobalModalErrorOn', 'setGlobalError']),
    async fetchApiForm() {
      this.userId = this.$route.params.user_id;
      try {        
        const response = await axios.get(`${serverUrl}/api/get_user_profile_form`);        
        try {
          if (response.data[this.getCurrentLanguage-1]['label']) {
            this.formData = response.data[this.getCurrentLanguage-1]['form'];
            this.states = response.data[this.getCurrentLanguage-1]['states'];
          } 
        } catch {
          this.formData = response.data[0]['form'];
          this.states = response.data[0]['states'];
        }        
      } catch (error) {
        console.error('PLAYER PROFILE - fetchApiForm Error:', error);
      }
    },

    async getUserProfile() {
      this.userId = this.$route.params.user_id;
      try {
        const dataToSend = {
          'user_id': this.userId,
          'token': localStorage.getItem('authToken')
        }        
        const response = await axios.post(`${serverUrl}/api/get_user_profile_data`, dataToSend);
        this.user = response.data;        
        this.country = this.user.country;
        if (this.user.owner) {
          if (this.user.email.endsWith(serverMail)) {            
            this.isEmailDefault = true;
          } else {            
            this.isEmailDefault = false;
          }
        }        
      } catch (error) {
        console.error('PLAYER PROFILE - getUserProfile Error:', error);
      }
    },

    goToAccessDenied() {
      this.$router.push('/access_denied');
    },

    goToReviewPage() {
      this.$router.push(`/review/${this.userId}`);
    },

    async update(newLanguage) {
      await this.fetchApiForm(newLanguage);
    },

    getTruncEmail() {
        return trunc_55(this.user.email)
      },
    startEditingNickname() {
      this.newNickname = this.user.nickname;
      this.editingNickname = true;
    },
    cancelEditingNickname() {
      this.editingNickname = false;
    },
    async submitChangeNickname() {
      if (this.newNickname != this.user.nickname) {
        try {
          const dataToSend = {
            'user_id': this.userId,
            'new_nickname': this.newNickname,
            'token': localStorage.getItem('authToken')
          }
          const response = await axios.post(`${serverUrl}/api/change_user_nickname`, dataToSend);
          console.log('CHANGE NICKNAME - response: ', response.data);
          if (response.data['result']) {
            await this.getUserProfile();
            this.$store.commit('setUser', {
              id: this.user.id,
              nickname: this.user.nickname,
              email: this.user.email,
              active_table: this.user.active_table,
              wallet: this.user.wallet
            });
            console.log('CHANGE NICKNAME - response: SUCCESS');
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('CHANGE NICKNAME - response: ERROR');
          }          
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
          console.error('Error fetching API data:', error);
        }
      } else {
        console.log('CHANGE NICKNAME - canceled ');
      }
      this.editingNickname = false;
    },
    startEditingEmail() {
      this.newEmail = this.user.email;
      this.editingEmail = true;
    },
    cancelEditingEmail() {
      this.editingEmail = false;
    },
    async submitChangeEmail() {
      if (this.newEmail != this.user.email) {
        try {
          const dataToSend = {
            'user_id': this.userId,
            'new_email': this.newEmail,
            'token': localStorage.getItem('authToken')
          }
          const response = await axios.post(`${serverUrl}/api/change_user_email`, dataToSend);
          console.log('CHANGE EMAIL - response: ', response.data);
          if (response.data['result']) {
            await this.getUserProfile();
            this.$store.commit('setUser', {
              id: this.user.id,
              nickname: this.user.nickname,
              django_name: this.user.django_name,
              active_table: this.user.active_table,
              wallet: this.user.wallet
            });
            console.log('CHANGE EMAIL - response: SUCCESS');
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('CHANGE EMAIL - response: ERROR');
          }          
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
          console.error('Error fetching API data:', error);
        }
      } else {
        console.log('CHANGE NICKNAME - canceled ');
      }
      this.editingEmail = false;
    },
    startEditingPhone() {
      this.newPhone = this.user.phone;
      this.editingPhone = true;
    },
    cancelEditingPhone() {
      this.editingPhone = false;
    },
    async submitChangePhone() {
      if (this.newPhone != this.user.phone) {
        try {
          const dataToSend = {
            'user_id': this.userId,
            'new_phone': this.newPhone,
            'token': localStorage.getItem('authToken')
          }
          const response = await axios.post(`${serverUrl}/api/change_user_phone`, dataToSend);
          console.log('CHANGE PHONE - response: ', response.data);
          if (response.data['result']) {
            await this.getUserProfile();            
            console.log('CHANGE PHONE - response: SUCCESS');
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('CHANGE PHONE - response: ERROR');
          }          
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
          console.error('Error change phone', error);
        }
      } else {
        console.log('CHANGE PHONE - canceled ');
      }
      this.editingPhone = false;
    },
    async stopChooseCountry() {      
      this.editingCountry = false;
      console.log('NEW COUNTRY IS ', this.newCountry );
      if (this.newCountry['id'] != this.user.country) {
        try {
          const dataToSend = {
            'user_id': this.userId,
            'new_country': this.newCountry['id'],
            'token': localStorage.getItem('authToken')
          }
          const response = await axios.post(`${serverUrl}/api/change_user_country`, dataToSend);
          console.log('CHANGE COUNTRY - response: ', response.data);
          if (response.data['result']) {
            await this.getUserProfile();            
            console.log('CHANGE COUNTRY - response: SUCCESS');
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('CHANGE COUNTRY - response: ERROR');
          }          
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
          console.error('Error change country', error);
        }
      } else {
        console.log('CHANGE COUNTRY - canceled ');
      }      
    },
    textNumber(number) {
    if (typeof number !== 'number') {        
        return '';
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
  }
}

</script>

<template>
  <div class="content">    
    <div class="mainbox" style="cursor: default;">
      <div class="container my-3">
        <div class="container mt-5; height: 100% ">
          <div class="alert alert-info" style="background: #F0FFF0; border: solid 1px green">
            <h3><b> {{ user.nickname }} </b> - {{ formData.title }}</h3>
            <hr>
            <!-- USER NICKNAME -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.username }}</h5>
              </div>
              <div v-if="!editingNickname" class="col-md-7 align-items-center d-flex">
                <h5 v-if="user.owner" style="cursor: pointer" @click="startEditingNickname"><b> {{ user.nickname }} </b></h5>
                <h5 v-if="!user.owner"><b> {{ user.nickname }} </b></h5>
                <br>
              </div>
              <div v-else class="col-md-7 align-items-center d-flex">
                <input v-model="newNickname" class="form-control" />
              </div>

              <div v-if="!editingNickname" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button v-if="user.owner" @click="startEditingNickname" class="btn btn-outline-secondary btn-sm w-100">{{ formData.button_changeusername }}</button>
              </div>
              <div v-else class="col-md-2 align-items-center d-flex flex-wrap justify-content-between">
                <button v-if="user.owner" @click="cancelEditingNickname" class="btn btn-outline-danger btn-sm w-45">{{ formData.button_cancel }}</button>
                <button v-if="user.owner" @click="submitChangeNickname" class="btn btn-success btn-sm w-50">{{ formData.button_submit }}</button>
              </div>
            </div>
            <!-- USER EMAIL -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.email }}</h5>
              </div>
              <div v-if="!editingEmail" class="col-md-7 align-items-center d-flex">
                <h5 v-if="!user.email_is_verified" style="cursor: pointer" @click="startEditingEmail"><b> {{ getTruncEmail() }} </b></h5>
                <h5 v-else><b> {{ getTruncEmail() }} </b></h5>
                <br>
              </div>
              <div v-else class="col-md-7 align-items-center d-flex">
                <input v-model="newEmail" class="form-control" />
              </div>

              <div v-if="!user.email_is_verified && isEmailDefault && !editingEmail" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="startEditingEmail" class="btn btn-outline-secondary btn-sm w-100" :title="formData.hint_changeemail">{{ formData.button_changeemail }}</button>                
              </div>
              <div v-if="!user.email_is_verified && editingEmail" class="col-md-2 align-items-center d-flex flex-wrap justify-content-between">
                <button @click="cancelEditingEmail" class="btn btn-outline-danger btn-sm w-45">{{ formData.button_cancel }}</button>
                <button @click="submitChangeEmail" class="btn btn-success btn-sm w-50">{{ formData.button_submit }}</button>
              </div>
              <div v-if="!user.email_is_verified && !isEmailDefault && isAuthWeb3 && !editingEmail" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center dropdown">
                <button class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" :title="formData.hint_email">{{ formData.button_confirmemail }} </button>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li><a class="dropdown-item" @click="confirmEmail" style="cursor: pointer">{{ formData.button_confirmemail }}</a></li>
                  <li><a class="dropdown-item" @click="startEditingEmail" style="cursor: pointer">{{ formData.button_changeemail }}</a></li>
                </ul>
              </div>
              <div v-if="!user.email_is_verified && !isEmailDefault && !isAuthWeb3" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button class="btn btn-outline-secondary btn-sm w-100" :title="formData.hint_email">{{ formData.button_confirmemail }}</button>
              </div>                                              
              <div v-if="user.email_is_verified" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div class="badge_confirmed w-100" :title="formData.hint_email">🗹 {{ formData.button_confirmed }}</div>
              </div>

            </div>
            <!-- USER SILVERCOIN -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.silvercoin }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ textNumber(user.silvercoin) }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div class="btn btn-outline-secondary btn-sm w-100">{{ formData.button_addsilvercoin }}</div>
              </div>
            </div>            
            <!-- USER GOLDCOIN -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.goldcoin }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ textNumber(user.goldcoin) }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="requestToken" class="btn btn-warning btn-sm w-100">{{ formData.button_addgoldcoin }}</button>
              </div>
            </div>
            <!-- USER DEMOCOIN -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.democoin }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ textNumber(user.democoin) }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div class="btn btn-outline-secondary btn-sm w-100">{{ formData.button_adddemocoin }}</div>
              </div>
            </div>
            <!-- USER BONUSCOIN -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.bonuscoin }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ textNumber(user.bonuscoin) }} </b></h5><br>
              </div>
            </div>
            <!-- USER WALLET -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.wallet }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ user.wallet }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
              </div>
            </div>
            <!-- USER RIGISTRATION DATE -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.reg_date }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ user.reg_date }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
              </div>
            </div>
            <!-- USER REPUTATION -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.reputation }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ textNumber(user.reputation) }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="goToReviewPage()" class="btn btn-secondary btn-sm w-100">{{ formData.button_comments }}</button>
              </div>
            </div>
            <!-- USER RATING -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.rating }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ textNumber(user.rating) }} </b></h5><br>
              </div>
              <div v-if="user.owner" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="requestToken" class="btn btn-secondary btn-sm w-100">{{ formData.button_gamehistory }}</button>
              </div>
            </div>
            <!-- USER REFERRAL LINK -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.ref_link }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5><b> {{ user.referal_code }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">                
              </div>
            </div>
            <!-- USER COUNTRY -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.country }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 v-if="!editingCountry && user.owner" @mouseover="editingCountry = true" @mouseout="editingCountry = false">
                  <b v-if="states.find(state => state.id === country) && states.find(state => state.id === country).name !== null"> {{ states.find(state => state.id === country).name }} </b>                  
                </h5>
                <h5 v-if="editingCountry && user.owner" @mouseout="editingCountry = false">
                  <select class="form-select form-select-sm w-100" aria-label="Small select example" @change="stopChooseCountry" v-model="newCountry">                    
                    <option v-for="(state, id) in states" :key="id" :value="state">{{ state.name }}</option>
                  </select>
                </h5>
                <h5 v-if="!user.owner">
                  <b v-if="states.find(state => state.id === country) && states.find(state => state.id === country).name !== null"> {{ states.find(state => state.id === country).name }} </b>
                </h5>
                <br>
              </div>
              
              <div v-if="user.owner" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                
              </div>
            </div>
            <!-- USER PHONE -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">              
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.phone }}</h5>
              </div>
              <div v-if="!editingPhone" class="col-md-7 align-items-center d-flex">
                <h5 v-if="!user.phone_is_verified" style="cursor: pointer" @click="startEditingPhone">
                  <b v-if="user.phone !== null"> {{ user.phone }} </b>
                  <b v-else> {{ formData.not_specified }} </b>
                </h5>
                <br>
              </div>              
              <div v-if="editingPhone" class="col-md-7 align-items-center d-flex">
                <input v-model="newPhone" class="form-control" />
              </div>
              
              <div v-if="!user.phone_is_verified && !editingPhone && user.phone === ''" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="startEditingPhone" class="btn btn-outline-secondary btn-sm w-100">{{ formData.button_addphone }}</button>
              </div>
              <div v-if="!user.phone_is_verified && !editingPhone && user.phone != ''" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center dropdown">
                <button class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">{{ formData.button_confirmphone }} </button>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li><a class="dropdown-item" @click="confirmPhone" style="cursor: pointer">{{ formData.button_confirmphone }}</a></li>
                  <li><a class="dropdown-item" @click="startEditingPhone" style="cursor: pointer">{{ formData.button_changephone }}</a></li>
                </ul>
              </div>              
              <div v-if="!user.phone_is_verified && editingPhone" class="col-md-2 align-items-center d-flex flex-wrap justify-content-between">
                <button @click="cancelEditingPhone" class="btn btn-outline-danger btn-sm w-45">{{ formData.button_cancel }}</button>
                <button @click="submitChangePhone" class="btn btn-success btn-sm w-50">{{ formData.button_submit }}</button>
              </div>
              <div v-if="user.phone_is_verified" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div class="badge_confirmed w-100">🗹 {{ formData.button_confirmed }}</div>
              </div>                          
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .badge_confirmed {
    color: green;
    
    border-radius: 5px;
    text-align: center;
    cursor: default;
    font-weight: 600;
  }
</style>
