<script>
import axios from 'axios';
import { serverUrl, serverMail } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';
import { trunc_55 } from '../js/supply';
import TableCard from './TableCard.vue'

export default {
  name: 'TableHall',
  components: {
    TableCard,    
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
    console.log('PLAYER PROFILE is Auth after: ', userData);
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
        console.log('PROFILE PAGE GET PAGE :', response);
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
        console.error('Error fetching API data:', error);
      }
    },

    async getUserProfile() {
      this.userId = this.$route.params.user_id;
      try {
        const dataToSend = {
          'user_id': this.userId,
          'token': localStorage.getItem('authToken')
        }
        console.log('PROFILE PAGE GET USER DATA - query: ', dataToSend)
        const response = await axios.post(`${serverUrl}/api/get_user_profile_data`, dataToSend);
        this.user = response.data;
        this.country = this.user.country;
        if (this.user.email.endsWith(serverMail)) {
          console.log('EMAIL ADRESS ',this.user.email, ' included in the end the mailserver namne ', serverMail);
          this.isEmailDefault = true;
        } else {
          console.log('EMAIL ADRESS ',this.user.email, ' NOT included in the end the mailserver namne ', serverMail);
          this.isEmailDefault = false;
        }
        console.log('PROFILE PAGE GET USER DATA - response: ', response.data);
      } catch (error) {
        console.error('Error fetching API data:', error);
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
  <div class="mainbox">
        <div class="container">
            <div class="row">
                <!--Левая панель со столами-->              
                <div class="col-9">
                    <div class="container mt-3">
                        <div v-for="(table) in sortedTables" :key="table.id">
                            <div v-if="!((hideEmpty && table.players_now == 0) || (hideFree && table.cointype == 0) || (hideGold && table.cointype == 1) || (hide36 && table.drop_suit == 0) || (hide27 && table.drop_suit != 0))" class="alert alert-info" style="background: Honeydew; border: solid 1px green; margin-top: 10px">
                                <TableCard
                                    :key = "tableKey(table.id)"
                                    :table="table"
                                    :playerNames="playerNames"
                                    :playerReputation="playerReputation"
                                    :playerRating="playerRating"
                                    :playerActiveTable = "playerActiveTable"/>
                            </div>
                        </div>
                    </div>
                </div>

                <!--Правая панель с выбором способа сортировки столов-->
                <div class="col-3">
                    <div class="rounded-3 my-3 d-flex justify-content-center"
                        style="background: Honeydew; border: solid 1px green;">
                        <div class="container justify-content-center" style="width: 100%;">
                            <div class="my-3 d-flex justify-content-center" style="justify-content: center; width: 100%;">
                                <h5>Sort tables by:</h5>
                            </div>
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="d-flex justify-content-center" style="width: 80%;">
                                    <input @click="sortTables('id')" type="submit" class="btn btn-success flex-grow-1" value="Table #ID">
                                </div>
                            </div>
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="d-flex justify-content-center" style="width: 80%;">
                                    <input @click="sortTables('min_bet')" type="submit" class="btn btn-success flex-grow-1" value="Minimal bet">
                                </div>
                            </div>
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="d-flex justify-content-center" style="width: 80%;">
                                    <input @click="sortTables('max_players')" type="submit" class="btn btn-success flex-grow-1" value="Max players">
                                </div>
                            </div>
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="d-flex justify-content-center" style="width: 80%;">
                                    <input @click="sortTables('players_now')" type="submit" class="btn btn-success flex-grow-1" value="Players now">
                                </div>
                            </div>
                            <hr style="color: green">
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="row" style="width: 90%">
                                    <div class="col-9" style="">
                                        Hide empty
                                    </div>
                                    <div class="col-3 d-flex justify-content-end" style="">
                                        <div class="form-check d-flex justify-content-end">
                                            <input class="form-check-input" type="checkbox" value="" id="cb_hide_empty" v-model="hideEmpty" style="border-color: green">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="row" style="width: 90%">
                                    <div class="col-9" style="">
                                        Hide Free Coin
                                    </div>
                                    <div class="col-3 d-flex justify-content-end" style="">
                                        <div class="form-check d-flex justify-content-end">
                                            <input class="form-check-input" type="checkbox" value="" id="cb_hide_free" v-model="hideFree" style="border-color: green">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="row" style="width: 90%">
                                    <div class="col-9" style="">
                                        Hide Gold Coin
                                    </div>
                                    <div class="col-3 d-flex justify-content-end" style="">
                                        <div class="form-check d-flex justify-content-end">
                                            <input class="form-check-input" type="checkbox" value="" id="cb_hide_gold" v-model="hideGold" style="border-color: green">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="row" style="width: 90%">
                                    <div class="col-9" style="">
                                        Hide 36's deck
                                    </div>
                                    <div class="col-3 d-flex justify-content-end" style="">
                                        <div class="form-check d-flex justify-content-end">
                                            <input class="form-check-input" type="checkbox" value="" id="cb_hide_36cards" v-model="hide36" style="border-color: green">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                                <div class="row" style="width: 90%">
                                    <div class="col-9" style="">
                                        Hide 27's deck
                                    </div>
                                    <div class="col-3 d-flex justify-content-end" style="">
                                        <div class="form-check d-flex justify-content-end">
                                            <input class="form-check-input" type="checkbox" value="" id="cb_hide_27cards" v-model="hide27" style="border-color: green">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr style="color: green">
                            <div class="my-2 mb-3 d-flex justify-content-center" style="width: 100%;">
                                <div class="d-flex justify-content-center" style="width: 80%;">
                                    <input @click="createTable" type="submit" class="btn btn-success flex-grow-1" value="Create table">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
.img-container {
    width: 100%; /* Масштабировать изображение по ширине родительского контейнера */
    height: auto; /* Масштабировать высоту пропорционально */
}
</style>