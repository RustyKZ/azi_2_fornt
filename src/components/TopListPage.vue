<script>
import axios from 'axios';
import { serverUrl } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { trunc_26 } from '../js/supply'
import { email_check_auth } from '@/js/auth';


export default {
  name: 'TopListPage',
  components: {

  },

  computed: {
    ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser', 'globalErrorNumber']),

    sortedList() {
      return this.topListData.slice().sort((a, b) => {
        const aVal = a[this.sortBy];
        const bVal = b[this.sortBy];
        if (aVal > bVal) {
          return this.sortDesc ? -1 : 1;
        }
        if (aVal < bVal) {
          return this.sortDesc ? 1 : -1;
        }
        return 0;
      });
    },

  },

  
  watch: {
    getCurrentLanguage(newLanguage) {
      this.update(newLanguage);
      this.getInterface();      
    },
    getUser() { 
    },
    cointype() {
      this.cointypeInt = parseInt(this.cointype)
      console.log('NEW COINTYPE IS ', this.cointypeInt);
    }
  
  },

  data() {
    return {
      interfaceData: {},
      globalInterfaceData: [],      
      formData: {},

      is_auth: false,
      sortBy: 'pos', // Поле для текущей сортировки
      sortDesc: false, // Флаг для определения порядка сортировки
      hoveredPos: false,
      hoveredNickname: false,
      hoveredRating: false,
      hoveredPlayed: false,
      hoveredWon: false,
      hoveredDays: false,

      topListData: [],
      hoveredRows: new Array(100).fill(false),
    };
  },

  async created() {    
    await this.getInterface();
    await this.getToplistData();
    
  },

  async mounted() {
    const getUserData = await email_check_auth();    
    if (getUserData['is_auth']) {
      this.is_auth = true      
    }
  },

  methods: {
    ...mapActions(['setGlobalModalErrorOff', 'setGlobalModalErrorOn', 'setGlobalError']),

    async getInterface() {      
      try {
        const response = await axios.get(`${serverUrl}/api/get_toplist_interface`);        
        try {
          this.globalInterfaceData = response.data
          if (response.data[this.getCurrentLanguage-1]['label']) {
            this.interfaceData = response.data[this.getCurrentLanguage-1]['form'];
            this.cointypeDropdown = this.interfaceData.cointypes
          } 
        } catch {
          this.interfaceData = response.data[0]['form'];
          this.cointypeDropdown = this.interfaceData.cointypes
        }        
      } catch (error) {
        console.error('TOPLIST GET INTERFACE error :', error);
      }
    },

    async getToplistData() {
      this.userId = this.$route.params.user_id;      
      try {        
        const response = await axios.get(`${serverUrl}/api/get_toplist_data`);
        if (response.data['result'] ) {
          this.topListData = response.data['top_list'];          
          console.log('TOPLIST PAGE - get toplist data', response);
        } else {
          console.error('TOPLIST - get_toplist_data Error: - Bad responce');
          this.setGlobalError(465);
          this.setGlobalModalErrorOn();
        }        
      } catch (error) {
        this.setGlobalError(465);
        this.setGlobalModalErrorOn();
        console.error('TOPLIST - get_toplist_data Error:', error);
      }

    },

    goToProfilePage(user_id) {
      this.$router.push(`/profile/${user_id}`);
    },

    async update(newLanguage) {
      await this.getInterface(newLanguage);
    },
    
    textNumber(number) {
      if (typeof number !== 'number') {        
        return '';
      }
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    textRating(number) {
      if (typeof number !== 'number') {
        return '';
      }
      const cutNumber = number.toFixed(2)
      return cutNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },

    getTruncNickname(stringName) {
      return trunc_26(stringName)
    },

    sortList(field) {
      // console.log('SORT TABLES BY', this.sortDesc, this.sortBy)
      if (field === this.sortBy) {
        this.sortDesc = !this.sortDesc; // Если выбран тот же столбец, меняем порядок
      } else {
        this.sortBy = field; // Иначе устанавливаем новое поле для сортировки
        this.sortDesc = false; // Сбрасываем порядок в возрастающий
      }
    },
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
                <h3><b>{{interfaceData.title}}</b></h3>
              </div>
              <div class="col-md-2" >
                
              </div>
            </div>
            <hr>
            <div class="container-fluid d-grid">
              <div class="row align-items-center">                
                <div  @click="sortList('pos')" 
                      @mouseover="hoveredPos = true;" 
                      @mouseout="hoveredPos = false"
                      :title="interfaceData.hint_pos_no"
                      :style="{cursor: 'pointer', backgroundColor: hoveredPos ? 'royalblue' : '', borderRadius: hoveredPos ? '10px' : '', color: hoveredPos ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-1 d-flex align-items-center">
                  <b class="w-100 text-center">{{interfaceData.pos_no}}</b>                      
                </div>
                <div  @click="sortList('nickname')" 
                      @mouseover="hoveredNickname = true;" 
                      @mouseout="hoveredNickname = false"
                      :title="interfaceData.hint_nickname"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredNickname ? 'royalblue' : '', borderRadius: hoveredNickname ? '10px' : '', color: hoveredNickname ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-3 d-flex align-items-center">
                  <b class="w-100 text-center">{{interfaceData.nickname}}</b>
                </div>
                <div  @click="sortList('rating')" 
                      @mouseover="hoveredRating = true;" 
                      @mouseout="hoveredRating = false"
                      :title="interfaceData.hint_rating"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredRating ? 'royalblue' : '', borderRadius: hoveredRating ? '10px' : '', color: hoveredRating ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-2 d-flex align-items-center">                  
                  <b class="w-100 text-center">{{interfaceData.rating}}</b>
                </div>
                <div  @click="sortList('played')"
                      @mouseover="hoveredPlayed = true" 
                      @mouseout="hoveredPlayed = false"
                      :title="interfaceData.hint_games_played"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredPlayed ? 'royalblue' : '', borderRadius: hoveredPlayed ? '10px' : '', color: hoveredPlayed ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-2 d-flex align-items-center">
                  <b style="cursor: pointer" class="w-100 text-center">{{interfaceData.games_played}}</b>
                </div>

                <div  @click="sortList('won')" 
                      @mouseover="hoveredWon = true" 
                      @mouseout="hoveredWon = false"
                      :title="interfaceData.hint_games_won"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredWon ? 'royalblue' : '', borderRadius: hoveredWon ? '10px' : '', color: hoveredWon ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-2 d-flex align-items-center">
                  <b class="w-100 text-center">{{interfaceData.games_won}}</b>
                </div>

                <div  @click="sortList('days')" 
                      @mouseover="hoveredDays = true;" 
                      @mouseout="hoveredDays = false"
                      :title="interfaceData.hint_days_in_game"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredDays ? 'royalblue' : '', borderRadius: hoveredDays ? '10px' : '', color: hoveredDays ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-2 d-flex align-items-center">
                  <b class="w-100 text-center">{{interfaceData.days_in_game}}</b>
                </div>
              </div>
              <hr>
              
              <div v-for="(player) in sortedList" :key="player.user_id" class="row align-items-center"
              @click="goToProfilePage(player.user_id)"
              @mouseover="hoveredRows[player.pos - 1] = true" 
              @mouseout="hoveredRows[player.pos - 1] = false"
              :title="is_auth ? interfaceData.hint_row_auth : interfaceData.hint_row_notauth"
              :style="{ cursor: is_auth ? 'pointer' : 'default', backgroundColor: hoveredRows[player.pos - 1] ? 'royalblue' : '', borderRadius: hoveredRows[player.pos - 1] ? '10px' : '', color: hoveredRows[player.pos - 1] ? 'White' : '', }">
                <div class="col-1 text-center align-middle">
                  {{ player.pos }}
                </div>
                <div class="col-3 align-middle">
                  {{ getTruncNickname(player.nickname) }}
                </div>
                <div class="col-2 text-center align-middle">
                  {{ textRating(player.rating) }}
                </div>
                <div class="col-2 text-center align-middle">
                  {{ textNumber(player.played) }}
                </div>
                <div class="col-2 text-center align-middle">
                  {{ textNumber(player.won) }}
                </div>
                <div class="col-2 text-center align-middle">
                  {{ textNumber(player.days) }}
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
