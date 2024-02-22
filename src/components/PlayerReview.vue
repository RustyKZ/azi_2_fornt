<script>
import axios from 'axios';
import { serverUrl } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';
import { trunc_26 } from '../js/supply'


export default {
  name: 'PlayerReview',
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
    getUser() { 

    },
  

  },

  data() {
    return {
      formData: {},
      userReview: [],
      userNickname: '',
      userId: 0,
      
    };
  },

  async created() {
    const userData = await email_check_auth();
    this.userId = this.$route.params.user_id;
    console.log('PLAYER REVIEW is Auth after: ', userData);
    if (!userData['is_auth']) {
      console.log('PLAYER REVIEW AccessDenied')
      this.goToAccessDenied(); // Переход на страницу доступа запрещен, если пользователь не авторизован
    }
    await this.fetchApiForm();
    await this.getUserData();
  },

  methods: {
    ...mapActions(['setGlobalModalErrorOn', 'setGlobalError']),
    async fetchApiForm() {
      this.userId = this.$route.params.user_id;
      try {        
        const response = await axios.get(`${serverUrl}/api/get_user_review_form`);
        console.log('REVIEW PAGE GET FORM :', response);
        try {
          if (response.data[this.getCurrentLanguage-1]['label']) {
            this.formData = response.data[this.getCurrentLanguage-1]['form'];
            
          } 
        } catch {
          this.formData = response.data[0]['form'];
          
        }        
      } catch (error) {
        console.error('REVIEW PAGE GET FORM :', error);
      }
    },

    async getUserData() {
      this.userId = this.$route.params.user_id;
      try {        
        const response = await axios.get(`${serverUrl}/api/get_user_review_data/${this.userId}`);      
        this.userNickname = response.data.username;
        this.userReview = response.data.comments.map(comment => {
          return {
            ...comment,
            unrolled: false
          };
        });
        console.log('USER REVIEW USER DATA - response: ', response.data);
      } catch (error) {
        console.error('USER REVIEW USER DATA', error);
      }
    },

    goToAccessDenied() {
      this.$router.push('/access_denied');
    },

    goToProfilePage(user_id) {
      this.$router.push(`/profile/${user_id}`);
    },

    goToGameHistory(game_id) {
      this.$router.push(`/games/${game_id}`);
    },

    async update(newLanguage) {
      await this.fetchApiForm(newLanguage);
    },
    
    textNumber(number) {
      if (typeof number !== 'number') {        
        return '';
      }
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    commentUnroll(Step) {
      console.log('COMMENT UNROLL ', Step)
      this.userReview.forEach((comment, index) => {
        if (index === Step) {
            comment.unrolled = true;
        } else {
            comment.unrolled = false;
        }
      });
    },

    getTruncNickname(stringName) {
      return trunc_26(stringName)
    },

    commentRoll(Step) {
      console.log('COMMENT ROLL ', Step)
      this.userReview[Step].unrolled = false;
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
            <!-- TITLE UPPERLINE -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-10">
                <h3><b> {{ userNickname }} </b> - {{ formData.title }}</h3>
              </div>
              <div class="col-md-2" >
                <button @click="goToProfilePage(userId)" class="btn btn-outline-secondary btn-sm w-100">Return</button>
              </div>
            </div>       
            <hr>
            <!-- TABLE WITH COMMENTS -->
            <div v-if="userReview == [] || userReview == ''"><h4>{{ formData.no_comments }}</h4></div>
            <div v-else>
              <div class="row align-items-center justify-content-center d-flex">
                <div class="col-md-3 text-center"><b>{{ formData.author}}</b></div>
                <div class="col-md-7 text-center"><b>{{ formData.comment }}</b></div>
                <div class="col-md-1 text-center"><b>{{ formData.game }}</b></div>
                <div class="col-md-1 text-center"><b>{{ formData.rate }}</b></div>
              </div>
              <hr>
              
              <div v-for="(comment, step) in userReview" :key="step" class="row align-items-center justify-content-center d-flex">
                <div class="col-md-3" style="cursor:pointer" :title="formData.hint_author" @click="goToProfilePage(comment.author)"><b>{{ getTruncNickname(comment.author_nickname)}}</b></div>
                <div v-if="comment.unrolled" class="col-md-7" style="cursor:pointer" :formData="comment.hint_comment" @click="commentRoll(step)">
                  {{ comment.comment }}
                </div>
                <div v-else class="col-md-7 limited-lines" style="cursor:pointer" :title="formData.hint_comment" @click="commentUnroll(step)">
                  {{ comment.comment }}
                </div>
                <div class="col-md-1 text-center" style="cursor:pointer" :title="formData.hint_game" @click="goToGameHistory(comment.game)">{{ comment.game }}</div>
                <div class="col-md-1 text-center" :title="formData.hint_rate"><b>{{ comment.rate }}</b></div>
                <div><br></div>
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
  .limited-lines {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2; /* Ограничиваем до двух строк */
  }
  .tooltip {
    font-size: 16px;
    padding: 10px;
}
</style>
