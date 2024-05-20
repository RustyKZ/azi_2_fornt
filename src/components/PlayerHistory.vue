<script>
import axios from 'axios';
import { serverUrl } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';
import { trunc_26 } from '../js/supply'


export default {
  name: 'PlayerHistory',
  components: {

  },

  computed: {
    ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser', 'globalErrorNumber']),

    sortedGames() {      
      return this.userGames.filter(game => {
        if (this.cointypeInt === 0) {
          return game.cointype === 0;
        } else if (this.cointypeInt === 1) {
          return game.cointype === 1;
        } else if (this.cointypeInt === 2) {
          return game.cointype === 2;
        }
        return true;
      })
    .slice()
    .sort((a, b) => {
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

    totalGames() {
      return this.sortedGames.length
    },

    totalProfit() {
      let profitValue = 0;
      for (let n = 0; n < this.sortedGames.length; n++) {
        profitValue = profitValue + this.sortedGames[n].profit;
      }
      return profitValue;
    }
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
      //console.log('NEW COINTYPE IS ', this.cointypeInt);
    }
  
  },

  data() {
    return {
      interfaceData: {},
      globalInterfaceData: [],
      user: {},
      formData: {},
      userReview: [],
      userNickname: '',
      userId: 0,
      userData: {
        is_auth: false,
        is_auth_web3: false,
        django_name: '',
        user_id: 0,
        nickname: '',
        wallet: '',
        active_table: 0
      },
      userGames: [],
      cointype: 3,
      cointypeInt: 3,
      cointypeDropdown: ["Silvercoin", "Goldcoin", "Bonuscoin", "All coins"],
      choosingCointype: false,
      sortBy: 'game_id', // Поле для текущей сортировки
      sortDesc: false, // Флаг для определения порядка сортировки
      hoveredGame: false,
      hoveredDate: false,
      hoveredAnte: false,
      hoveredCointype: false,
      hoveredPlayers: false,
      hoveredPot: false,
      hoveredProfit: false,
    };
  },

  async created() {    
    await this.getInterface();
    //console.log('PLAYER HISTORY CREATED: this userroute is ', this.userId, ' this User is ', this.userData.user_id);
    if (this.userId !== this.userData.user_id) {
      this.goToAccessDenied();
    }
    await this.getUserData()
  },

  async mounted() {
    const getUserData = await email_check_auth();    
    if (!getUserData['is_auth']) {
      //console.log('PLAYER HISTORY AccessDenied');
      this.goToAccessDenied(); // Переход на страницу доступа запрещен, если пользователь не авторизован
    }
    this.userData = getUserData;
    this.$store.commit('setUser', 
      { id: this.userData.user_id,
        nickname: this.userData.nickname,
        email: this.userData.email,
        active_table: this.userData.active_table,
        wallet: this.userData.wallet
    });
    this.userId = parseInt(this.$route.params.user_id);
    
  },

  methods: {
    ...mapActions(['setGlobalModalErrorOff', 'setGlobalModalErrorOn', 'setGlobalError']),

    async getInterface() {      
      try {        
        const response = await axios.get(`${serverUrl}/api/get_player_history_interface`);        
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
        console.error('PLAYER HISTORY GET INTERFACE error :', error);
      }
    },

    async getUserData() {
      this.userId = this.$route.params.user_id;      
      try {
        const dataToSend = {
          'user_id': this.userId,
          'token': localStorage.getItem('authToken')
        }        
        const response = await axios.post(`${serverUrl}/api/get_user_history_data`, dataToSend);
        this.userGames = response.data.games;
      } catch (error) {
        console.error('PLAYER HISTORY - getUserProfile Error:', error);
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
      await this.getInterface(newLanguage);
    },
    
    textNumber(number) {
      if (typeof number !== 'number') {        
        return '';
      }
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    commentUnroll(Step) {
      //console.log('COMMENT UNROLL ', Step);
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
      //console.log('COMMENT ROLL ', Step);
      this.userReview[Step].unrolled = false;
    },

    choosingCointypeOn() {
      this.choosingCointype = true;
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return ''; // Возвращаем пустую строку, если формат некорректен
      }
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      //const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} #${hours}:${minutes}`;
    },

    sortGames(field) {
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
                <h3><b> {{ getTruncNickname(userData.nickname) }} </b> - {{ interfaceData.title }}</h3>
              </div>
              <div class="col-md-2" >
                <button @click="goToProfilePage(userId)" :title="interfaceData.hint_return" class="btn btn-outline-secondary btn-sm w-100">{{ interfaceData.button_return }}</button>
              </div>
            </div>       
            <hr>
            <div class="container-fluid d-grid">
              <div class="row align-items-center">                
                <div  @click="sortGames('game_id')" 
                      @mouseover="hoveredGame = true; choosingCointype = false" 
                      @mouseout="hoveredGame = false"
                      :title="interfaceData.hint_game"
                      :style="{cursor: 'pointer', backgroundColor: hoveredGame ? 'royalblue' : '', borderRadius: hoveredGame ? '10px' : '', color: hoveredGame ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-1 d-flex align-items-center">
                  <b class="w-100 text-center">{{ interfaceData.game_no }}</b>                      
                </div>
                <div  @click="sortGames('date')" 
                      @mouseover="hoveredDate = true; choosingCointype = false" 
                      @mouseout="hoveredDate = false"
                      :title="interfaceData.hint_date"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredDate ? 'royalblue' : '', borderRadius: hoveredDate ? '10px' : '', color: hoveredDate ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-3 d-flex align-items-center">
                  <b class="w-100 text-center">{{ interfaceData.date }}</b>
                </div>
                <div  @click="sortGames('ante')" 
                      @mouseover="hoveredAnte = true; choosingCointype = false" 
                      @mouseout="hoveredAnte = false"
                      :title="interfaceData.hint_ante"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredAnte ? 'royalblue' : '', borderRadius: hoveredAnte ? '10px' : '', color: hoveredAnte ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-1 d-flex align-items-center">                  
                  <b class="w-100 text-center">{{ interfaceData.ante }}</b>
                </div>
                <div  @click="choosingCointype = true"
                      @mouseover="hoveredCointype = true" 
                      @mouseout="hoveredCointype = false"
                      :title="interfaceData.hint_cointype"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredCointype ? 'royalblue' : '', borderRadius: hoveredCointype ? '10px' : '', color: hoveredCointype ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-2 d-flex align-items-center">
                  <b v-if="!choosingCointype" style="cursor: pointer" class="w-100 text-center">{{ cointypeDropdown[cointype] }}</b>
                  
                  <select v-if="choosingCointype" @change="choosingCointype = false" class="form-select-sm w-100" v-model="cointype">
                    <option selected value=3 >{{ cointypeDropdown[3] }}</option>
                    <option value= 0 >{{ cointypeDropdown[0] }}</option>
                    <option value= 1 >{{ cointypeDropdown[1] }}</option>
                    <option value= 2 >{{ cointypeDropdown[2] }}</option>                    
                  </select>
                </div>
                <div  @click="sortGames('players')" 
                      @mouseover="hoveredPlayers = true; choosingCointype = false" 
                      @mouseout="hoveredPlayers = false"
                      :title="interfaceData.hint_players"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredPlayers ? 'royalblue' : '', borderRadius: hoveredPlayers ? '10px' : '', color: hoveredPlayers ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-1 d-flex align-items-center">
                  <b class="w-100 text-center">{{ interfaceData.players }}</b>
                </div>
                <div  @click="sortGames('pot')" 
                      @mouseover="hoveredPot = true; choosingCointype = false" 
                      @mouseout="hoveredPot = false"
                      :title="interfaceData.hint_pot"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredPot ? 'royalblue' : '', borderRadius: hoveredPot ? '10px' : '', color: hoveredPot ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-2 d-flex align-items-center">
                  <b class="w-100 text-center">{{ interfaceData.pot }}</b>
                </div>
                <div  @click="sortGames('profit')" 
                      @mouseover="hoveredProfit = true; choosingCointype = false" 
                      @mouseout="hoveredProfit = false"
                      :title="interfaceData.hint_profit"
                      :style="{ cursor: 'pointer', backgroundColor: hoveredProfit ? 'royalblue' : '', borderRadius: hoveredProfit ? '10px' : '', color: hoveredProfit ? 'White' : '', }"
                      style="height: 100%;"
                      class="col-2 d-flex align-items-center">
                  <b class="w-100 text-center">{{ interfaceData.profit }}</b>
                </div>
              </div>
              <hr>

              <div v-for="(game) in sortedGames" :key="game.id" class="row align-items-center">
                <div class="col-1 text-center align-middle">
                  {{ game.game_id }}
                </div>
                <div class="col-3 text-center align-middle">
                  {{ formatDate(game.date) }}
                </div>
                <div class="col-1 text-center align-middle">                  
                  {{ textNumber(game.ante) }}
                </div>
                <div class="col-2 text-center align-middle">
                  <span v-if="game.cointype === 0" class="badge text-bg-secondary" style="cursor:default">{{ interfaceData.cointypes[game.cointype] || ''}}</span>
                  <span v-if="game.cointype === 1" class="badge text-bg-warning" style="cursor:default">{{ interfaceData.cointypes[game.cointype] || ''}}</span>
                  <span v-if="game.cointype === 2" class="badge text-bg-success" style="cursor:default">{{ interfaceData.cointypes[game.cointype] || ''}}</span>                  
                </div>
                <div class="col-1 text-center align-middle">
                  {{ game.players }}
                </div>
                <div class="col-2 text-center align-middle">
                  {{ textNumber(game.pot) }}
                </div>
                <div class="col-2 text-center align-middle">
                  <span v-if="game.profit > 0"><b>{{ textNumber(game.profit) }}</b></span>
                  <span v-else style="color: red">{{ textNumber(game.profit) }}</span>
                </div>
              </div>
              <hr>
              <div class="row align-items-center">
                <div class="col-4 align-middle">
                  <b>{{ interfaceData.total_games }}</b>
                </div>
                <div class="col-1 text-center align-middle">
                  <b>{{ textNumber(totalGames) }}</b>
                </div>
                <div class="col-3 text-center align-middle">
                  
                </div>
                <div class="col-2 text-center align-middle">                  
                  <b>{{ interfaceData.total }}</b>
                </div>
                <div class="col-2 text-center align-middle">
                  <b v-if="totalProfit >= 0">{{ textNumber(totalProfit) }}</b>
                  <b v-else style="color: red">{{ textNumber(totalProfit) }}</b>
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
