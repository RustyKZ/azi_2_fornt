<script>
import axios from 'axios';
import { serverUrl } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';
import { trunc_26 } from '../js/supply'

export default {
  name: 'TableHall',  

  computed: {
    ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser', 'getActiveTable']),    

    sortedTables() {
      return this.tables.slice().sort((a, b) => {
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
    },
    getUser() { },

  },

  data() {
    return {
      interfaceData: {},
      globalInterfaceData: [],
      user: {},
      roomId: 'tables_hall',
      userData: {
        is_auth: false,
        is_auth_web3: false,
        django_name: '',
        user_id: 0,
        nickname: '',
        wallet: '',
        active_table: 0
      },
      tables: [],
      all_users: [{"id": 0, "nickname": "", "active_table": 0, "rating": 0, "reputation": 0}],
      numberPlayersHall: 0,      
      hideEmpty: false,
      hideFull: false,
      hideSilver: false,
      hideGold: false,
      hide36: false,
      hide27: false,
      hidePrivate: false,
      tablePasswordEntering: false,
      enteredTablePassword: '',
      sortBy: 'id', // Поле для текущей сортировки (по умолчанию по номеру стола)
      sortDesc: false, // Флаг для определения порядка сортировки
    };
  },

  async created() {    
    await this.getInterface();    
  },

  async mounted() {
    const getUserData = await email_check_auth();
    this.userData = getUserData;
    if (!this.userData['is_auth']) {
      this.goToAccessDenied(); // Переход на страницу доступа запрещен, если пользователь не авторизован
    }    
    this.$socket.on('update_tables_hall_data', (data) => {
      // console.log('TABLES HALL - Socket.ON: update_tables_hall_data');
      this.updateTablesData(data);
    });
    
    this.$socket.on('join_table_response', (data) => {
      this.joinTableResponse(data);
    });
    this.$socket.on('join_sandbox_response', (data) => {
      this.goTrainingResponse(data);
    });
    this.$socket.on('get_private_notice', (data) => {
      this.getPrivateNotice(data);
    });
    this.joinTablesHall();
  },

  beforeRouteLeave(to, from, next) {
    this.$socket.emit('leave_tables_hall', { user_id: this.userData.user_id });    
    this.$store.commit('setActiveTable', this.userData.active_table);
    next();
  },

  methods: {
    ...mapActions(['setGlobalModalErrorOn', 'setGlobalError', 'setActiveTable']),

    getPrivateNotice(data) {
        if (data.status) {
            if (data.error == 712) {
                this.setGlobalError(data.error);
                this.setGlobalModalErrorOn();                
            }            
        }
    },
    
    joinTablesHall() {      
      this.$socket.emit('join_tables_hall', { user_id: this.userData.user_id });
    },

    async getInterface() {      
      try {        
        const response = await axios.get(`${serverUrl}/api/get_tables_interface`);        
        try {
          this.globalInterfaceData = response.data
          if (response.data[this.getCurrentLanguage-1]['label']) {
            this.interfaceData = response.data[this.getCurrentLanguage-1]['form'];
          } 
        } catch {
          this.interfaceData = response.data[0]['form'];          
        }        
      } catch (error) {
        console.error('TABLES HALL GET INTERFACE error :', error);
      }
    },

    async update(newLanguage) {
      try {
          if (this.globalInterfaceData[newLanguage-1]['label']) {
            this.interfaceData = this.globalInterfaceData[newLanguage-1]['form'];            
          } 
        } catch {
          this.interfaceData = this.globalInterfaceData[0]['form'];          
        }
    },

    goToAccessDenied() {
      this.$router.push('/access_denied');
    },

    goToProfilePage(user_id) {
      this.$router.push(`/profile/${user_id}`);
    },

    updateTablesData(data) {
      this.all_users = data.all_players;
      this.all_users.forEach(user => {
        if (user.id === this.userData.user_id) {
            const newActiveTable = user.active_table;
            this.$store.commit('setActiveTable', newActiveTable);
        }

      });
      this.tables = data.all_tables.map(table => {
        return { ...table, editing: false };
      });
      this.numberPlayersHall = this.all_users.filter(user => user.active_table === -1).length;      
    },

    getTruncNickname(user_id) {
      const user = this.all_users.find(user => user.id === user_id);      
      if (user) {
        const name = user.nickname;
        return trunc_26(name)
      } else {
        return ''
      }
    },

    getReputation(user_id) {
      const user = this.all_users.find(user => user.id === user_id);    
      if (user) {
        return user.reputation
      } else {
        return 0
      }
    },

    getRating(user_id) {
      const user = this.all_users.find(user => user.id === user_id);    
      if (user) {
        return user.rating
      } else {
        return 0
      }
    },

    goTrainingRequest() {
      if (this.userData.active_table === 0 || this.userData.active_table === -1) {
        this.$socket.emit('join_sandbox_outside', { user_id: this.userData.user_id });
      } else if (this.userData.active_table === -2) {
        this.$router.push(`/sandbox/`);
      } else if (this.userData.active_table > 0) {
        this.setGlobalError(702);
        this.setGlobalModalErrorOn();
      }
    },

    goTrainingResponse(data) {      
      // console.log('GO TRAINING RESPONSE: ', data);
      if (data.status) {
        this.$router.push(`/sandbox/`);
      } else {
        this.setGlobalError(data.error);
        this.setGlobalModalErrorOn();
      }
    },

    joinTableRequest(table_id, table_protected) {
      if (this.userData.active_table === 0 || this.userData.active_table === -1 || this.userData.active_table === -2) {
        if (!table_protected) {
          this.$socket.emit('join_table_outside', { user_id: this.userData.user_id, table_id: table_id, table_password: '' });
          // console.log('JOIN TABLE : user ', this.userData.user_id, ' table ', table_id)
        } else {          
          // console.log('JOIN TABLE : need password - password is ', this.enteredTablePassword);
          this.$socket.emit('join_table_outside', { user_id: this.userData.user_id, table_id: table_id, table_password: this.enteredTablePassword});
          this.enteredTablePassword = '';          
          this.tables.forEach(table => {
            table.editing = false;
          });
        }        
      } else {
        if (this.userData.active_table === table_id) {
          this.setGlobalError(701);
          this.setGlobalModalErrorOn();
        } else if (this.userData.active_table > 0) {
          this.setGlobalError(702);
          this.setGlobalModalErrorOn();
        }
      }
    },    

    joinTableResponse(data) {      
      // console.log('JOIN TABLE RESPONSE: ', data);      
      if (data.status) {
        const goalTable = data.table;
        this.$router.push(`/table/${goalTable.id}`);
      } else {
        this.setGlobalError(data.error);
        this.setGlobalModalErrorOn();
      }
    },

    enterPassword(table_id) {
      // Here sortedTables
      this.tables.forEach(table => {
        table.editing = false;
      });
      const index = this.tables.findIndex(table => table.id === table_id);
      if (index !== -1) {
        this.tables[index].editing = true;
      }
    },

    returnTable(table_id) {
      if (this.userData.active_table == table_id) {
        this.$router.push(`/table/${table_id}`);
      } else {
        this.setGlobalError(0);
        this.setGlobalModalErrorOn();
      }
    },

    sortTables(field) {
      // console.log('SORT TABLES BY', this.sortDesc, this.sortBy)
      if (field === this.sortBy) {
        this.sortDesc = !this.sortDesc; // Если выбран тот же столбец, меняем порядок
      } else {
        this.sortBy = field; // Иначе устанавливаем новое поле для сортировки
        this.sortDesc = false; // Сбрасываем порядок в возрастающий
      }
    },

    training() {
      // console.log('TABLES HALL - Training');
      this.$router.push(`/sandbox/`);
    },

    createTable() {    
      // console.log('TABLES HALL - Create table');
      this.$router.push(`/create_table/`);
    },

    testSocket() {
      this.$socket.emit('test_connection', { user_id: this.userData.user_id });
    }

  },

}

</script>

<template>
  <div class="mainbox">
    <div v-if="sortedTables.length !== 0" class="container-xxl">
      <div class="row">
        <!--Левая панель со столами-->
        <div class="col-9">
          <div class="container mt-3">
            <div v-for="(table) in sortedTables" :key="table.id">
              <div v-if="!( (hidePrivate && table.protected) ||
                            (hideEmpty && table.players_now == 0) || 
                            (hideFull && table.players_now == table.max_players) ||
                            (hideSilver && table.cointype == 0) || 
                            (hideGold && table.cointype == 1) || 
                            (hide36 && table.drop_suit == 0) || 
                            (hide27 && table.drop_suit != 0))" 
                            class="alert alert-info" style="background: Honeydew; border: solid 1px green; margin-top: 10px">

                <div class="row">
                  <!-- Элемент стол: информация по столу-->
                  <div class="col-9" style="cursor: default">
                    <div class="row">
                      <!-- Колонка с опсианием полей -->
                      <div class="col-4 d-flex justify-content-center align-items-center">
                        <div class="container">
                          <h5 style="display: inline-block; margin-right: 10px;">{{ interfaceData.tc_table }} <b>#{{table.id }}</b></h5><span class="password-protected">&#8987;<span class="tooltiptext">{{ interfaceData.hint_timeout }} {{ table.interval }}</span></span><span v-if="table.protected" class="password-protected">🔒<span class="tooltiptext">{{ interfaceData.tc_password_protected }}</span></span>
                          <div>
                            <h6>{{ interfaceData.tc_max_players }} <b>{{ table.max_players }}</b></h6>
                            <h6>{{ interfaceData.tc_ante }} <b>{{ table.min_bet }}</b></h6>
                            <h6>{{ interfaceData.tc_blind_game }}
                              <b v-if="table.blind_game"> {{ interfaceData.tc_blind_game_true }} </b>
                              <b v-else> {{ interfaceData.tc_blind_game_false }} </b>
                            </h6>
                            <h6>{{ interfaceData.tc_cointype }} 
                              <span v-if="table.cointype === 0" class="badge text-bg-secondary" style="cursor:default">{{ interfaceData.tc_array_coin[table.cointype] || ''}}</span>
                              <span v-if="table.cointype === 1" class="badge text-bg-warning" style="cursor:default">{{ interfaceData.tc_array_coin[table.cointype] || ''}}</span>
                              <span v-if="table.cointype === 2" class="badge text-bg-success" style="cursor:default">{{ interfaceData.tc_array_coin[table.cointype] || ''}}</span>
                            </h6>
                            <h6>{{ interfaceData.tc_card_deck }} <b>{{ interfaceData.tc_array_deck[table.drop_suit] || ''
                            }}</b></h6>
                          </div>
                        </div>
                      </div>

                      <!-- Колонка с именами, репутацией и рейтингом  -->
                      <div class="col-8 d-flex justify-content-center align-items-center">
                        <div class="container" style="height: 100%">                          
                          <div class="row">
                            <div class="col-7 d-flex justify-content-center align-items-center">
                              <h6>{{ interfaceData.tc_player }}</h6>
                            </div>
                            <div class="col-3 d-flex justify-content-center align-items-center">
                              <h6>{{ interfaceData.tc_reputation }}</h6>
                            </div>
                            <div class="col-2 d-flex justify-content-center align-items-center">
                              <h6>{{ interfaceData.tc_rating }}</h6>
                            </div>
                          </div>
                          <div v-for="player, number in table.max_players" :key="number" class="row">
                            <div class="col-7 d-flex">                              
                              <b v-if="(table.players[number] !== 0)" @click="goToProfilePage(table.players[number])"
                                style="color: darkblue; cursor: pointer" :title="interfaceData.tc_hint_profile"> {{
                                  getTruncNickname(table.players[number]) }} </b>
                              <div v-else> {{ interfaceData.tc_free_place }} </div>
                            </div>
                            <div v-if="(table.players[number] !== 0)"
                              class="col-3 d-flex justify-content-center align-items-center">
                              {{ getReputation(table.players[number]) }}
                            </div>
                            <div v-if="(table.players[number] !== 0)"
                              class="col-2 d-flex justify-content-center align-items-center">
                              {{ getRating(table.players[number]) }}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </div>                    
                    <!--Поле ввода пароля-->
                    <div v-if="table.protected && table.editing" class="row">
                      <div class="col-4 d-flex justify-content-center align-items-center">
                        <div class="container"> {{ interfaceData.tc_password_required }} </div>
                      </div>
                      <div class="col-8 d-flex justify-content-center align-items-center">
                        <div class="container">
                          <input v-model="enteredTablePassword" class="form-control form-control-sm" type="text" :placeholder="interfaceData.tc_password_enter" aria-label="default input example">
                        </div>
                      </div>
                    </div>
                  </div>
                  <!--Кнопки присоединения к столу и выхода-->
                  <div class="col-3 d-flex justify-content-center">
                    <div class="container d-flex justify-content-center align-items-end" style="width: 100%;">
                      <div class="container" style="width: 100%">
                        <!--Кнопка возврата к столу-->
                        <div v-if="table.id === getActiveTable" class="d-flex justify-content-center my-1" style="width: 100%;">
                          <button @click="returnTable(table.id)" class="btn btn-outline-success flex-grow-1 w-100">{{ interfaceData.tc_button_return }}</button>
                        </div>
                        <!--Кнопка активации поля ввода пароля -->
                        <div v-if="(table.protected && !table.editing) && (table.id !== getActiveTable && !(getActiveTable > 0))" class="d-flex justify-content-center my-1" style="width: 100%;">
                          <button @click="enterPassword(table.id)" class="btn btn-outline-success flex-grow-1 w-100"> {{interfaceData.tc_button_ask }}</button>
                        </div>
                        <!--Кнопка присоединения к столу-->
                        <div v-if="(!table.protected || table.editing) && (table.id !== getActiveTable && !(getActiveTable > 0))" class="d-flex justify-content-center my-1" style="width: 100%;">
                          <button @click="joinTableRequest(table.id, table.protected)" class="btn btn-success flex-grow-1 w-100">{{ interfaceData.tc_button_join }}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Конец элемента описания стола -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--Правая панель с выбором способа сортировки столов-->
        <div class="col-3">          
          <div class="rounded-3 my-3 d-flex justify-content-center" style="background: Honeydew; border: solid 1px green;">
            <div class="container justify-content-center" style="width: 100%;">
              <!-- Кнопка сортировки столов по table.id -->
              <div class="my-3 d-flex justify-content-center" style="justify-content: center; width: 100%;">
                <h5 style="cursor: default">{{ interfaceData.sort_by }}</h5>
              </div>              
              <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                <div class="d-flex justify-content-center" style="width: 80%;">
                  <input @click="sortTables('id')" type="submit" class="btn btn btn-outline-success btn-sm flex-grow-1" :value="interfaceData.table_id" :title="interfaceData.hint_table_id">
                </div>
              </div>
              <!-- Кнопка сортировки столов по table.min_bet -->
              <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                <div class="d-flex justify-content-center" style="width: 80%;">
                  <input @click="sortTables('min_bet')" type="submit" class="btn btn btn-outline-success btn-sm flex-grow-1" :value="interfaceData.min_bet" :title="interfaceData.hint_min_bet">
                </div>
              </div>              
              <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                <div class="d-flex justify-content-center" style="width: 80%;">
                  <input @click="sortTables('max_players')" type="submit" class="btn btn btn-outline-success btn-sm flex-grow-1" :value="interfaceData.max_players" :title="interfaceData.hint_max_players">
                </div>
              </div>
              <!-- Кнопка сортировки столов по table.players_now -->
              <div class="my-2 d-flex justify-content-center" style="width: 100%;">
                <div class="d-flex justify-content-center" style="width: 80%;">
                  <input @click="sortTables('players_now')" type="submit" class="btn btn btn-outline-success btn-sm flex-grow-1" :value="interfaceData.players_now" :title="interfaceData.hint_players_now">
                </div>
              </div>

              <hr style="color: green">
              <!-- Чекбокс hide_private -->
              <div class="my-1 d-flex justify-content-center" style="width: 100%;">
                <div class="row" style="width: 90%">
                  <div class="col-9" style="cursor: default" :title="interfaceData.hint_hide_private">
                    {{ interfaceData.hide_private }}
                  </div>
                  <div class="col-3 d-flex justify-content-end" style="">
                    <div class="form-check d-flex justify-content-end">
                      <input class="form-check-input" type="checkbox" value="" id="cb_hide_private" v-model="hidePrivate" style="border-color: green">
                    </div>
                  </div>
                </div>
              </div>
              <!-- Чекбокс hide_empty -->
              <div class="my-1 d-flex justify-content-center" style="width: 100%;">
                <div class="row" style="width: 90%">
                  <div class="col-9" style="cursor: default" :title="interfaceData.hint_hide_empty">
                    {{ interfaceData.hide_empty }}
                  </div>
                  <div class="col-3 d-flex justify-content-end" style="">
                    <div class="form-check d-flex justify-content-end">
                      <input class="form-check-input" type="checkbox" value="" id="cb_hide_empty" v-model="hideEmpty" style="border-color: green">
                    </div>
                  </div>
                </div>
              </div>
              <!-- Чекбокс hide_full -->
              <div class="my-1 d-flex justify-content-center" style="width: 100%;">
                <div class="row" style="width: 90%">
                  <div class="col-9" style="cursor: default" :title="interfaceData.hint_hide_empty">
                    {{ interfaceData.hide_full }}
                  </div>
                  <div class="col-3 d-flex justify-content-end">
                    <div class="form-check d-flex justify-content-end">
                      <input class="form-check-input" type="checkbox" value="" id="cb_hide_full" v-model="hideFull" style="border-color: green">
                    </div>
                  </div>
                </div>
              </div>
              <!-- Чекбокс hide_silver -->
              <div class="my-1 d-flex justify-content-center" style="width: 100%;">
                <div class="row" style="width: 90%">
                  <div class="col-9" style="cursor: default" :title="interfaceData.hint_hide_silver">
                    {{ interfaceData.hide_silver }}
                  </div>
                  <div class="col-3 d-flex justify-content-end">
                    <div class="form-check d-flex justify-content-end">
                      <input class="form-check-input" type="checkbox" value="" id="cb_hide_silver" v-model="hideSilver" style="border-color: green">
                    </div>
                  </div>
                </div>
              </div>
              <!-- Чекбокс hide_gold -->
              <div class="my-1 d-flex justify-content-center" style="width: 100%;">
                <div class="row" style="width: 90%">
                  <div class="col-9" style="cursor: default" :title="interfaceData.hint_hide_gold">
                    {{ interfaceData.hide_gold }}
                  </div>
                  <div class="col-3 d-flex justify-content-end" style="">
                    <div class="form-check d-flex justify-content-end">
                      <input class="form-check-input" type="checkbox" value="" id="cb_hide_gold" v-model="hideGold" style="border-color: green">
                    </div>
                  </div>
                </div>
              </div>
              <!-- Чекбокс hide_36 -->
              <div class="my-1 d-flex justify-content-center" style="width: 100%;">
                <div class="row" style="width: 90%">
                  <div class="col-9" style="cursor: default" :title="interfaceData.hint_hide_36">
                    {{ interfaceData.hide_36 }}
                  </div>
                  <div class="col-3 d-flex justify-content-end" style="">
                    <div class="form-check d-flex justify-content-end">
                      <input class="form-check-input" type="checkbox" value="" id="cb_hide_36cards" v-model="hide36" style="border-color: green">
                    </div>
                  </div>
                </div>
              </div>
              <!-- Чекбокс hide_27 -->
              <div class="my-1 d-flex justify-content-center" style="width: 100%;">
                <div class="row" style="width: 90%">
                  <div class="col-9" style="cursor: default" :title="interfaceData.hint_hide_27">
                    {{ interfaceData.hide_27 }}
                  </div>
                  <div class="col-3 d-flex justify-content-end">
                    <div class="form-check d-flex justify-content-end">
                      <input class="form-check-input" type="checkbox" value="" id="cb_hide_27cards" v-model="hide27" style="border-color: green">
                    </div>
                  </div>
                </div>
              </div>

              <hr style="color: green">
              <!-- Кнопка CreateTable -->
              <div class="my-2 mb-3 d-flex justify-content-center" style="width: 100%;">
                <div class="d-flex justify-content-center" style="width: 80%;">
                  <input @click="createTable" type="submit" class="btn btn-success flex-grow-1" :value="interfaceData.create_table" :title="interfaceData.hint_create_table">
                </div>
              </div>
              <!-- Кнопка Training -->
              <div class="my-2 mb-3 d-flex justify-content-center" style="width: 100%;">
                <div class="d-flex justify-content-center" style="width: 80%;">
                  <input @click="goTrainingRequest" type="submit" class="btn btn-outline-success flex-grow-1" :value="interfaceData.training" :title="interfaceData.hint_training">
                </div>
              </div>
              <hr style="color: green">
              <!-- Индикатор количества игроков в лобби -->
              <div class="my-2 mb-3 d-flex justify-content-center" style="width: 100%;">
                <div class="row" style="width: 90%">
                  <div class="col-9" style="cursor: default" :title="interfaceData.hint_players_hall">
                    {{ interfaceData.players_hall }}
                  </div>
                  <div class="col-3 d-flex justify-content-end">
                    <div class="justify-content-end" style="cursor: default">
                      {{ numberPlayersHall }}                      
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Нет открытых столов -->
    <div v-if="sortedTables.length === 0" class="container-fluid d-flex align-items-center justify-content-center">
      <div class="container mt-3 mb-3">
        <div class="row p- pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-4 border shadow-lg" style="background: aliceblue;">

          <div class="col-lg-6 p-3 p-lg-5 pt-lg-3">
            <h4 class="display-5 fw-bold lh-1 text-body-emphasis">{{ interfaceData.empty_hall_title }}</h4>
            <p class="lead mt-2">{{ interfaceData.empty_hall_text }}</p>
            <div class="d-grid gap-2 d-md-flex justify-content-md-start mb-4 mb-lg-3">
              <button @click="createTable" :title="interfaceData.hint_create_table" type="button" class="btn btn-success btn-lg px-4 me-md-2 fw-bold">{{ interfaceData.create_table }}</button>
              <button @click="goTrainingRequest" :title="interfaceData.hint_training" type="button" class="btn btn-outline-success btn-lg px-4">{{ interfaceData.training }}</button>              
            </div>
          </div>

          <div class="col-lg-5 offset-lg-1 p-0">
            <div class="container d-flex align-items-center justify-content-center">
              <img class="mb-4" src="images/site_picture_cardtable.png" style="width: 95%; float: left">
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
    /*justify-content: center;
    align-items: center;*/
    font-size: 16px;
    width: 100%;
    margin: 0;
    padding: 0;
    cursor: default;
}
.img-container {
    width: 100%; /* Масштабировать изображение по ширине родительского контейнера */
    height: auto; /* Масштабировать высоту пропорционально */
}
.password-protected {
  cursor: help; /* Изменение курсора при наведении */
  position: relative; /* Необходимо для позиционирования всплывающего текста */
}

.password-protected .tooltiptext {
  visibility: hidden; /* Скрыть текст по умолчанию */
  background-color: #ffc107;
  color: #000000;
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  padding-left: 15px;
  padding-right: 15px;
  position: absolute;
  z-index: 1;
  bottom: 100%; /* Поместите текст над значком 🔒 */
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s; /* Плавное появление текста */
}

.password-protected:hover .tooltiptext {
  visibility: visible; /* Показать текст при наведении */
  opacity: 1; /* Сделать текст полностью видимым */
}
</style>