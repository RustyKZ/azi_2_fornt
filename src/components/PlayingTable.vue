<script>
import axios from 'axios';
import { serverUrl } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';
import { trunc_24, trunc_20, trunc_9_4 } from '../js/supply'


export default {

name: 'PlayingTable',
components: {

},

computed: {
    ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser', 'getActiveTable']),

},

watch: {
    getCurrentLanguage(newLanguage) {
      this.update(newLanguage);      
    },
    getUser() { },

},

data() {
    return {
        interfaceData: {
            "table" : "Table #",
            "game": "Game #",
            "game_notstarted": "The game has not started",
            "button_leavetable": "Leave table",
            "ante": "Ante:",
            "max_players": "Max players:",
            "blindgame": "Blind game:",
            "cointype": "Coin type:",
            "dropsuit": "Dropped:",
            "password": "Password:",
            "blindgame_true": "enabled",
            "blindgame_false": "disabled",
            "array_cointype": ["Silver Coin", "Gold Coin", "Bonus Coin"],
            "array_dropsuit": ["None", "Spades", "Clubs", "Diamonds", "Hearts"],
            "gamestages": ["Not started", "Ante betting", "Blind betting", "Dealing", "First turn betting", "Discard extra card", "First turn", "Second turn", "Third turn", "Winner checking", "Waiting for players to AZI joining", "All check - Re-dealing", "End of the Game"],
            "button_bet": "Bet",
            "button_raise": "Raise",
            "button_call": "Call",
            "button_check": "Check",
            "button_fold": "Fold",
            "button_azi_in": "AZI-in for:",
            "button_azi_refuse": "Refuse AZI",
            "button_blind": "Blind bet",
            "button_blind_off": "Without blind bet",
            "button_gameready": "Ready for the new game",
            "button_gamerefuse": "Leave table",
            "drop_your_card": "Drop one of your cards",
            "hint_attacker": "Attacker player",
            "desk_pot": "POT",
            "desk_trump": "TRUMP",
            "hint_timeout": "The action must be performed by the user before the timeout expires, otherwise the default automatic action will be performed",
            "badge_game": "game# ",
            "badge_winner": "WINNER",
            "badge_pot": "Pot:  ",
            "badge_azi_in": "AZI-in",
            "badge_azi_out": "AZI-out",
            "badge_azi_burst": "AZI burst in",
            "badge_azi_refuse": "Refused to AZI",
            "balance": ["Silvercoin balance: ", "Goldcoin balance: ", "Bonuscoin balance: "]
        },
        globalInterfaceData: [],
        user: {},
        tableId: 0,
        userData: {
            is_auth: false,
            is_auth_web3: false,
            django_name: '',
            user_id: 0,
            nickname: '',
            wallet: '',
            active_table: 0
        },
        table: {},
        game: {},
        dropsuit: ['/images/192-spades.png','/images/192-clubs.png','/images/192-diamonds.png','/images/192-hearts.png'],
        all_users: [{"id": 0, "nickname": ""}],
        playerIndex: null,
        myCards: [
                {pos: 1, card: 2, name: 'myCard1', image: '/images/cards/220-cads-deck27.png', type: 'card', opacity: 'opacity: 100%'},
                {pos: 2, card: 3, name: 'myCard2', image: '/images/cards/220-cads-deck03.png', type: 'card', opacity: 'opacity: 100%'},
                {pos: 3, card: 1, name: 'myCard3', image: '/images/cards/220-cads-deck01.png', type: 'card', opacity: 'opacity: 100%'},
                {pos: 4, card: 36, name: 'myCard4', image: '/images/cards/220-cads-deck36.png', type: 'card', opacity: 'opacity: 100%'},
            ],
        cardImagePath:[
                '/images/cards/220_cads_shirt.png',
                '/images/cards/220-cads-deck01.png', 
                '/images/cards/220-cads-deck02.png', 
                '/images/cards/220-cads-deck03.png', 
                '/images/cards/220-cads-deck04.png', 
                '/images/cards/220-cads-deck05.png', 
                '/images/cards/220-cads-deck06.png', 
                '/images/cards/220-cads-deck07.png', 
                '/images/cards/220-cads-deck08.png', 
                '/images/cards/220-cads-deck09.png', 
                '/images/cards/220-cads-deck10.png', 
                '/images/cards/220-cads-deck11.png',
                '/images/cards/220-cads-deck12.png', 
                '/images/cards/220-cads-deck13.png', 
                '/images/cards/220-cads-deck14.png', 
                '/images/cards/220-cads-deck15.png', 
                '/images/cards/220-cads-deck16.png', 
                '/images/cards/220-cads-deck17.png', 
                '/images/cards/220-cads-deck18.png', 
                '/images/cards/220-cads-deck19.png', 
                '/images/cards/220-cads-deck20.png', 
                '/images/cards/220-cads-deck21.png',
                '/images/cards/220-cads-deck22.png', 
                '/images/cards/220-cads-deck23.png', 
                '/images/cards/220-cads-deck24.png', 
                '/images/cards/220-cads-deck25.png', 
                '/images/cards/220-cads-deck26.png', 
                '/images/cards/220-cads-deck27.png', 
                '/images/cards/220-cads-deck28.png', 
                '/images/cards/220-cads-deck29.png', 
                '/images/cards/220-cads-deck30.png', 
                '/images/cards/220-cads-deck31.png',
                '/images/cards/220-cads-deck32.png', 
                '/images/cards/220-cads-deck33.png', 
                '/images/cards/220-cads-deck34.png', 
                '/images/cards/220-cads-deck35.png', 
                '/images/cards/220-cads-deck36.png',
                '/images/cards/220-empty.png'
            ],
        cardRivalImagePath: ['/images/cards/rivals_0_cards.png', '/images/cards/rival_card_01.png', '/images/cards/rival_card_02.png', '/images/cards/rival_card_03.png', '/images/cards/rival_card_04.png'],
        progressValue: 0,
        progressWidth: 0,
        progressElapsed: 0,
        progressBarRunning: false,
        defaultActionRequestSent: false,
        timer: null,
        rivalsQuantity: 5,
        rivals: [   {"id": 1, "nickname": "FirstRival"},
                    {"id": 1, "nickname": "FirstRival"},
                    {"id": 1, "nickname": "FirstRival"},
                    {"id": 1, "nickname": "FirstRival"},
                    {"id": 1, "nickname": "FirstRival"},
            ],
        rivalsWidth: ['width: 100%', 'width: 30%', 'width: 50%', 'width: 75%', 'width: 100%', 'width: 100%' ],
        coins: [0, 0, 0, 0, 0, 0],
        playerIsAlone: true,
    };
},

async created() {    
    const getUserData = await email_check_auth();    
    this.userData = getUserData;
    this.tableId = parseInt(this.$route.params.table_id);
    this.userId = this.userData.user_id;
    if (!this.userData['is_auth']) {        
        this.goToAccessDenied();
    }    
    await this.getInterface();
    if (getUserData.active_table !== this.tableId) {
        this.goToLobby();
    }
    this.$store.commit('setUser', {
        id: this.userData.user_id,
        nickname: this.userData.nickname,
        email: this.userData.email,
        active_table: this.userData.active_table,
        wallet: this.userData.wallet
    });
    this.startProgressBar();
    this.$socket.emit('join_table_inside', { user_id: this.userData.user_id, table_id: this.tableId });
},

async mounted() {
    console.log('GAME TABLE MOUNTED');
    this.$socket.on('update_table_data', (data) => {
        this.updateTableData(data);
    });
    this.$socket.on('get_private_notice', (data) => {
        this.getPrivateNotice(data);
    });
},

beforeRouteLeave(to, from, next) {
    console.log('Пользователь покидает страницу');
    next();
},

beforeUnmount () {
    console.log('BEFORE DESTROY')
    clearInterval(this.timer)
},

methods: {
    ...mapActions(['setGlobalModalErrorOn', 'setGlobalError']),

    async getInterface() {
      this.userId = this.$route.params.user_id;
      try {        
        const response = await axios.get(`${serverUrl}/api/get_playtable_interface`);
        console.log('PLAYTABLE GET INTERFACE response :', response);
        try {
          this.globalInterfaceData = response.data
          if (response.data[this.getCurrentLanguage-1]['label']) {
            this.interfaceData = response.data[this.getCurrentLanguage-1]['form'];
          } 
        } catch {
          this.interfaceData = response.data[0]['form'];          
        }        
      } catch (error) {
        console.error('PLAYTABLE GET INTERFACE error :', error);
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
        this.stopProgressBar();
        this.$router.push('/access_denied');
    },

    goToLobby() {
        this.setGlobalError(705);
        this.setGlobalModalErrorOn();
        this.stopProgressBar();
        this.$router.push(`/tables`);
    },

    goToProfilePage(user_id) {
        this.stopProgressBar();
        this.$router.push(`/profile/${user_id}`);
    },

    leaveTable() {        
        this.$socket.emit('leave_table', { user_id: this.userData.user_id, table_id: this.tableId });        
        console.log('PLAYING TABLE - LEAVE TABLE');
        this.stopProgressBar();
        this.$router.push(`/tables`);
    },

    updateTableData(data) {
        if (data.status) {
            this.table = data.table;
            this.game = data.game;
            this.playerIndex = this.table.players.indexOf(this.userData.user_id);
            this.coins = data.coins;
            this.defaultActionRequestSent = false;
            this.checkPlayerIsAlone();            
        } else {
            this.setGlobalError(data.error);
            this.setGlobalModalErrorOn();
        }        
        console.log('UPDATE TABLE DATA: ', data);
    },

    getPrivateNotice(data) {
        if (data.status) {
            this.setGlobalError(data.error);
            this.setGlobalModalErrorOn();
            console.log('GET PRIVATE NOTICE - DATA: ', data);
        } else {
            console.log('GET PRIVATE NOTICE - DATA: ', data);
        }
    },

    getTruncNickname(user_nickname) {
        try {
            return trunc_24(user_nickname)
        } catch {
            return ''
        }
    },

    getTruncNickname20(user_nickname) {
        try {
            return trunc_20(user_nickname)
        } catch {
            return ''
        }
    },

    getTruncNickname16(nickname) {
        try {
            return trunc_9_4(nickname)
        } catch {
            return ''
        }        
    },

    textNumber(number) {
        if (typeof number !== 'number') {                
            return '';
        }
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    dragOver(event) {
        event.preventDefault();
    },

    dragEnter(event) {
        event.preventDefault();
    },

    startDrag(event, item) {
    // Начало перетаскивания
        event.dataTransfer.setData('text/plain', JSON.stringify(item));
        console.log('CARD DRAGGED:', item);
        this.myCards[item.pos-1]['opacity'] = 'opacity: 20%';
    },
    cancelDrag(event) {
        event.preventDefault();
        console.log('CANCEL DRAG')
        this.myCards.forEach(card => {
            card.opacity = 'opacity: 100%';
        });
    },
    dropCard(event) {
        event.preventDefault();
        try {
            const item = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (item.type === 'card') {
                // console.log('CARD VALID DROPPED:', item.pos, item.card);
                const droppedCard = {
                    user_id: this.getUser.id,
                    game_id: this.game.id,
                    card_pos: item.pos,
                    card_value: item.card
                }
                console.log('DROP CARD: ', droppedCard);
                this.myCards[droppedCard.card_pos - 1].card = 0
            }
        } catch (error) {   
            console.log('CARD INVALID DROPPED:');
        }
    },

    bettingRaise(bet) {
        console.log('BETTING BET: bet is ', bet)
    },

    bettingBet(bet) {
        console.log('BETTING BET: bet is ', bet)
    },

    bettingCall() {
        console.log('BETTING CALL')
    },

    bettingFold() {
        console.log('BETTING CALL')
    },

    bettingCheck() {
        console.log('BETTING CALL')
    },

    bettingBlind(bet) {
        console.log('BETTING BET: bet is ', bet)
    },

    bettingBlindCheck() {
        console.log('BETTING CALL')
    },

    bettingAziHalfPot() {
        console.log('BETTING CALL')
    },

    bettingAziDecline() {
        console.log('BETTING CALL')
    },

    readyForNewGame() {
        this.$socket.emit('player_ready_for_the_new_game', { user_id: this.userData.user_id, table_id: this.tableId });
        console.log('READY FOR THE NEW GAME')
    },

    startProgressBar() {
        if (!this.progressBarRunning) {
            this.timer = setInterval(() => {
                console.log('PROGRESSBAR STARTED, timer is', this.timer, '  time elapsed ', this.progressElapsed)
                // Рассчитываем, сколько времени прошло с момента lastdeal до текущего момента
                const currentTime = Math.floor(new Date().getTime() / 1000); // Текущее время в секундах
                if (this.table.lastdeal !== 0) {
                    const elapsed = currentTime - this.table.lastdeal;
                    const progress = (elapsed / this.table.interval) * 100;
                    this.progressValue = Math.min(progress, 100);
                    this.progressElapsed = elapsed;
                    this.progressWidth = `${this.progressValue}%`;
                    if (elapsed >= this.table.interval) {
                        this.defaultAction();
                    }
                } else {
                    const elapsed = 0;
                    const progress = (elapsed / this.table.interval) * 100;
                    this.progressValue = Math.min(progress, 100);
                    this.progressElapsed = elapsed;
                    this.progressWidth = `${this.progressValue}%`;
                }                
            }, 1000); // Обновление каждую секунду
            this.progressBarRunning = true;
        }
        
    },

    async stopProgressBar() {
        console.log('PROGRESSBAR STOPPED, time elapsed ', this.progressElapsed)
        clearInterval(this.timer);
        this.progressBarRunning = false;
        this.timer = null;
    },

    defaultAction() {
        console.log('DEFAULT ACTION')
        if (!this.defaultActionRequestSent) {
            this.defaultActionRequestSent = true;
            this.$socket.emit('default_action', { user_id: this.userData.user_id, table_id: this.tableId });            
        }
        
    },

    countArrayValue(sourceArray, maxPlayers, checkingValue) {
        const array = sourceArray.slice(0, maxPlayers);
        return array.filter(item => item === checkingValue).length;
    },

    checkPlayerIsAlone() {
        console.log('CHECK PLAYER IS ALONE', this.table.players, this.table.status, this.table.max_players)
        try {
            const arrayPlayers = this.table['players'].slice(0, this.table.max_players);
            const arrayStatus = this.table['status'].slice(0, this.table.max_players);
            console.log('CHECK PLAYER IS ALONE - TRY')
            if (arrayPlayers.filter(item => item === 0).length + arrayStatus.filter(item => item === 12).length === this.table.max_players - 1) {
                this.playerIsAlone = true;
            } else {
                this.playerIsAlone = false;
            }
        } catch {
            console.log('CHECK PLAYER IS ALONE - CATCH')
            this.playerIsAlone = true;
        }        
        
        
    }
  }
}

</script>

<template>
    <div class="container-fluid" style="background: silver">        
        <div class="row" style="height: 100%;">
            <!--  Левый игровой блок-->
            <div class="col-9" style="height: 100%">
                <div style="height: 100%; margin-left: 10px;">

                    <!-- Верхняя панель - карты и информация соперников -->
                    <div class="row align-items-center justify-content-center" style="height: 25%;">
                        {{ game }} {{ table }} {{ playerIndex }} {{ coins }} {{ timer }} {{ playerIsAlone }}
                        <div v-if="game.status" class="container-fluid" style="height: 100%" :style="rivalsWidth[rivalsQuantity]">
                            <!-- Верхний ряд 1/3 - Имена соперников -->
                            <div class="row align-items-center, main mt-2" style="height: 15%;" >
                                <div v-for="rival in rivals" :key="rival.id" class="col align-items-center">
                                    <div class="align-items-center">
                                        <div v-if="game.speaker_id === rival.id" @click="goToPlayerProfile(rival.id)" class="main rounded-3" style="background: blue; cursor: pointer; text-align: center; vertical-align: middle">
                                            <b style="color: white"> {{ getTruncNickname20(rival.nickname) }}</b>
                                        </div>
                                        <div v-else @click="goToPlayerProfile(rival)" class="main rounded-5" style="background: green; cursor: pointer; text-align: center; vertical-align: middle">
                                            <b style="color: white"> {{ getTruncNickname20(rival.nickname) }}</b>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Верхний ряд 2/3 - Карты соперников -->
                            <div class="row align-items-center, main" style="height: 55%;">
                                <div v-for="rival in rivals" :key="rival.id" class="col align-items-center">
                                    <div class="row">
                                        <div class="col-1"></div>
                                        <div class="col-10">
                                            <img class="my-1" :src="cardRivalImagePath[4]" style="height: 13vh; margin-left: 0px; position: absolute;" :draggable="false">                                        
                                        </div>                                    
                                        <div class="col-1"></div>
                                    </div>
                                </div>  
                            </div>
                            <!-- Верхний ряд 3/3 - Реплики соперников/прогрессбар -->
                            <div  class="row align-items-center mb-2" style="height: 25%;">
                                <div v-for="rival in this.rivals" :key="rival.id" class="col align-items-center">                                
                                    <div class="row" style="height:100%">
                                        <div class="col-10">
                                            <div class="d-flex align-items-center rounded-3 mb-1 w-100" style="height:90%; background:white; white-space: pre-line;">
                                                <h6 class="ms-3 mt-1" style="color: black">{{ game.usersays[game.players.indexOf(rival)] }}</h6>
                                            </div>
                                        </div>
                                        <div class="col-2" :title="interfaceData.hint_attacker" >
                                            <h3 class="" style="cursor: default;"><b>A</b></h3>
                                        </div>
                                    </div>                                
                                <!--
                                    <div>
                                        <div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="progressValue" aria-valuemin="0" aria-valuemax="100">                                            
                                            <div class="progress-bar progress-bar-striped progress-bar-animated" :style="{ width: progressWidth }">{{ this.table.interval - progressElapsed }}</div>
                                        </div>
                                    </div>
                                -->
                                </div>
                            </div>                            
                        </div>
                    </div>

                    <!-- Средняя панель - игровой стол -->
                    <div class="row align-items-center, main" style="height: 57%;">
                        <div class="green-table" @dragenter.prevent="dragEnter" @dragover.prevent="dragOver" @drop="dropCard">                            
                            <div class="row mt-2" style="height: 96%; ">
                                <!-- Левая часть стола - кон -->
                                <div class="col-1 align-items-center justify-content-center text-center">
                                    <div class="row" style="height: 40%"></div>
                                    <div class="row" style="height: 20%;">
                                        <b class="text-center" style="color: white;">POT:</b>
                                        <br>
                                        <b style="color: white;">10,000</b>
                                    </div>
                                    <div class="row" style="height: 20%"></div>
                                </div>
                                <!-- Центральная часть стола - место для карт  -->
                                <div class="col-10 row align-items-center justify-content-center">
                                    <div class="col" style="height: 100%"></div>
                                    <div class="col" style="height: 100%"></div>
                                    <div class="col" style="height: 100%"></div>
                                    <div class="col" style="height: 100%"></div>
                                    <div class="col" style="height: 100%"></div>
                                </div>
                                <!-- Правая часть стола - козырь -->
                                <div class="col-1 align-items-center justify-content-center">
                                    <div class="row align-items-start text-center" style="height: 33%;">
                                    </div>
                                    <div class="row" style="height: 34%;">                                        
                                        <div class="container">                                            
                                            <img class="" src="/images/cards/220-card_shirt.png" style="height: 15vh; position: absolute;">
                                            <img class="m-2" src="/images/cards/220-card_shirt.png" style="height: 15vh; position: absolute;">
                                            <img class="m-3" :src="cardImagePath[13]" style="height: 15vh; position: absolute;">
                                        </div>

                                    </div>
                                    <div class="row align-items-start text-center" style="height: 33%">
                                        <h6 style="color: LimeGreen"><b>TRUMP</b></h6>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                    </div>

                    <!-- Панель управления пользователя -->
                    <div class="row align-items-end" style="height: 18%; cursor: default;">
                        <!--  1 колонка панели - информация пользователя -->
                        <div class="col" style="display: grid; place-items: center; height:100%;">
                            <div class="container" style="margin:0; padding:0; height:100%">
                                <!-- uID и никнейм пользователя -->
                                <div class="row align-items-start" style="height: 30%">
                                    <div class="col-4 align-self-center">
                                        <div style="color: black"><h5>uID: <b> {{ getUser.id }} </b></h5></div>
                                    </div>
                                    <div class="col-8 align-self-center">                                        
                                        <div class="d-flex justify-content-center align-items-center rounded-5" style="background: blue">
                                            <h5 style="color: white">{{ getTruncNickname20(getUser.nickname) }}</h5>
                                        </div>
                                    </div>
                                </div>
                                <!-- Баланс пользователя -->
                                <div class="row align-items-center" style="height: 30%">
                                    <div class="col-7 align-self-center justify-content-center align-items-center">
                                        <div class="textcenter" style="color: black">
                                            <h5 v-if="table.cointype === 0">{{ interfaceData.balance[0] }}</h5>
                                            <h5 v-if="table.cointype === 1">{{ interfaceData.balance[0] }}</h5>
                                            <h5 v-if="table.cointype === 2">{{ interfaceData.balance[0] }}</h5>                                            
                                        </div>
                                    </div>
                                    <div v-if="playerIndex !== null" class="col-5 align-self-center justify-content-center align-items-center">                                        
                                        <div v-if="table.cointype === 0" class="d-flex align-self-center justify-content-center align-items-center rounded-5 text-bg-secondary" >{{textNumber(coins[playerIndex])}}</div>
                                        <div v-if="table.cointype === 1" class="d-flex justify-content-center align-items-center rounded-5 text-bg-warning" >{{textNumber(coins[playerIndex])}}</div>
                                        <div v-if="table.cointype === 2" class="d-flex justify-content-center align-items-center rounded-5 text-bg-success">{{textNumber(coins[playerIndex])}}</div>                                        
                                    </div>
                                </div>
                                <!--   Слово пользователя-->        
                                <div class="row align-items-end" style="; height: 35%">
                                    <div class="col-10 align-self-center">
                                        <div class="d-flex justify-content-center align-items-center rounded-3" style="background:Honeydew">
                                            <h5 style="color: black">Usersays</h5>
                                        </div>
                                    </div>
                                    <div class="col-2 justify-content-center align-items-center" :title="interfaceData.hint_attacker">
                                        <div><h3 class="text-center align-middle" style="cursor: default;"><b>A</b></h3></div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                        <!--  2 колонка панели - карты пользователя-->
                        <div class="col" style="display: grid; place-items: center; height:100%;">
                            <div v-if="1==2" class="row pt-1" style="height:100%; overflow: hidden;">
                                <div v-for="item in myCards" :key="item.pos" class="col" style="padding: 0; margin:0; height:100%">
                                    <div class="col" v-if="(item.card !=0)" style="padding: 0; margin:0; height: 100%;">
                                        <img :src="item.image" :alt="item.name" class="draggable-item" :draggable="true" @dragend="cancelDrag" @dragstart="startDrag($event, item)" :style="item.opacity">
                                    </div>
                                </div>
                            </div>
                            <!--  Не карты пользователя -->

                            <div v-if="1==1" class="container-fluid rounded-4" style="background: ForestGreen; height: 90%;">
                                <div class="row align-items-center justify-content-center" style="height: 35%;"><h5 class="text-center align-middle mt-2" style="color: aliceblue;">{{ interfaceData.badge_game }}<b>{{ game.id }}</b></h5></div>
                                <div class="row align-items-center justify-content-center" style="height: 30%;"><h2 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_winner }}</b></h2></div>
                                <div class="row align-items-center justify-content-center" style="height: 35%;"><h5 class="text-center align-middle" style="color: aliceblue;">{{ interfaceData.badge_pot }}<b>{{ textNumber(this.game.pot) }}</b></h5></div>                                        
                            </div>
                            <div v-if="1==2" class="col-10 d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: SlateBlue; height: 10vh;">
                                <div class="align-items-center justify-content-center"><h3 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_in }}</b></h3></div>
                            </div>
                            <div v-if="1==2" class="col-10 d-flex justify-content-center col align-items-center rounded-4 mt-2" style="background: SlateGray; height: 10vh;">
                                <div class="row align-items-center justify-content-center"><h3 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_out }}</b></h3></div>
                            </div>
                            <div v-if="1==2" class="col-10 d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: SlateBlue; height: 10vh;">
                                <div class="row align-items-center justify-content-center"><h3 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_burst }}</b></h3></div>
                            </div>
                            <div v-if="1==2" class="col-10 d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: #ffc107; height: 10vh;">
                                <div class="row align-items-center justify-content-center"><h3 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_refuse }}</b></h3></div>
                            </div>

                        </div>

                        <!--  3 колонка панели - прогрессбар  и кнопки -->
                        <div class="col" style="margin:0; padding: 0; display: grid; place-items: center; height: 100%;">
                            
                                
                                <div class="container-flex" style="height: 100%; width: 100%;">
                                     <!-- 1/3 строка 3 колонки нижнего ряда - прогрессбар времени пользователя   -->
                                     <div class="row align-items-center justify-content-center" style="height: 20%;">
                                        
                                        <div class="justify-content-center" style="width: 80%">
                                            <div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="progressValue" aria-valuemin="0" aria-valuemax="100">
                                                <div class="progress-bar progress-bar-striped progress-bar-animated" :title="interfaceData.hint_timeout" :style="{ width: progressWidth }">{{ table.interval - progressElapsed }}</div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                
                                     <!-- Блок для кнопок / полезных советов -->
                                    <div class="row align-items-center justify-content-center" style="height: 80%;">
                                        <!--  Кнопки для ставок -->
                                        <div v-if="1==2" class="container" style="height: 100%; width: 100%;">
                                            <div class="row align-items-center, main" style="height: 50%; display: grid; place-items: center;" >
                                                <div style="height: 50%; display: flex; justify-content: center; align-items: center;">
                                                    <div class="d-flex flex-wrap align-items-center justify-content-center w-100">
                                                        <div class="btn-group dropup flex-grow-1">
                                                            <button type="button" class="btn btn-primary dropdown-toggle flex-grow-1 m-1" data-bs-toggle="dropdown" aria-expanded="false">{{ interfaceData.button_bet }}</button>
                                                            <ul class="dropdown-menu">
                                                                <li v-for="myBet in [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]" :key="myBet" @click="bettingBet(myBet)"><a class="dropdown-item" href="#">{{ this.textNumber(this.table.min_bet * myBet) }}</a></li>
                                                            </ul>
                                                        </div>
                                                        <div class="btn-group dropup flex-grow-1">
                                                            <button type="button" class="btn btn-primary dropdown-toggle flex-grow-1 m-1" data-bs-toggle="dropdown" aria-expanded="false">{{ interfaceData.button_raise }}</button>
                                                            <ul class="dropdown-menu">
                                                                <li v-for="myRaise in [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]" :key="myRaise" @click="bettingRaise(myRaise)"><a class="dropdown-item" href="#">{{ this.textNumber(this.table.min_bet * myRaise) }}</a></li>
                                                            </ul>
                                                        </div>
                                                        <div class="btn-group dropup flex-grow-1">
                                                            <button type="button" @click="bettingCall" class="btn btn-dark flex-grow-1 m-1">{{ interfaceData.button_call }}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>                                
                                            <!--  Кнопки для паса, поддержки и сбрасывания  -->
                                            <div class="row align-items-center, main" style="height: 50%; display: grid; place-items: center;" >
                                                <div style="height: 50%; display: flex; justify-content: center; align-items: center;">
                                                    <div class="d-flex flex-wrap align-items-center justify-content-center w-100">
                                                        <button type="button" @click="bettingCheck" class="btn btn-secondary flex-grow-1 m-1">{{ interfaceData.button_check }}</button>
                                                        <button type="button" @click="bettingFold" class="btn btn-warning flex-grow-1 m-1">{{ interfaceData.button_fold }}</button>
                                                    </div>                                            
                                                </div>
                                            </div>                                            
                                        </div>
                                        <!-- Кнопки врезки в Ази -->
                                        <div v-if="1==3" class="container" style="height: 100%; width: 100%;">
                                            <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;" >
                                                <button type="button" @click="bettingAziHalfPot" class="btn btn-dark flex-grow-1 m-1 w-100">{{ interfaceData.button_azi_in }} {{ textNumber(game.azi_price) }}</button>
                                            </div>
                                            <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;" >
                                                <button type="button" @click="bettingAziDecline" class="btn btn-warning flex-grow-1 m-1 w-100">{{ interfaceData.button_azi_refuse }}</button>
                                            </div>
                                        </div>
                                        <!-- Кнопки ставок втемную -->
                                        <div v-if="1==4" class="container" style="height: 100%; width: 100%;">
                                            <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;">
                                                <button type="button" class="btn btn-primary dropdown-toggle flex-grow-1 m-1 w-100" data-bs-toggle="dropdown" aria-expanded="false">{{ interfaceData.button_blind }}</button>
                                                <ul class="dropdown-menu">
                                                    <li v-for="myBlindBet in [5, 4, 3, 2, 1]" :key="myBlindBet" @click="bettingBlind(myBlindBet)"><a class="dropdown-item" href="#">{{ this.textNumber(this.table.min_bet * myBlindBet) }} (call {{ this.textNumber(this.table.min_bet * myBlindBet * 2) }})</a></li>
                                                </ul>
                                            </div>
                                            <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;" >
                                                <button type="button" @click="bettingBlindCheck" class="btn btn-secondary flex-grow-1 m-1 w-100">{{ interfaceData.button_blind_off }}</button>
                                            </div>                                            
                                        </div>
                                        <!-- Кнопки следующей игры / выхода -->
                                        <div v-if="(game.stage === 0)" class="container" style="height: 100%; width: 100%;">
                                            <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;">
                                                <button v-if="table.status[playerIndex] === 0" type="button" @click="readyForNewGame" class="btn btn-primary flex-grow-1 m-1 w-100">{{ interfaceData.button_gameready }}</button>
                                                <button v-if="table.status[playerIndex] === 1" type="button" class="btn active btn-primary flex-grow-1 m-1 w-100" disabled data-bs-toggle="button" aria-pressed="true">{{ interfaceData.button_gameready }} 🗹</button>
                                                <button v-if="table.status[playerIndex] === 12" type="button" class="btn btn-warning flex-grow-1 m-1 w-100">{{ interfaceData.button_push_balance }}</button>
                                            </div>
                                            <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;" >
                                                <button type="button" @click="leaveTable" class="btn btn-danger flex-grow-1 m-1 w-100">{{ interfaceData.button_gamerefuse }}</button>
                                            </div>                                            
                                        </div>
                                        <!--  Этап  сбрасывания карты -->
                                        <div v-if="1==2" class="container" style="height: 100%; width: 100%;">
                                            <div class="row align-items-center, main" style="height: 100%; display: grid; place-items: center;" >
                                                <h4 class="text-center">{{ interfaceData.drop_yuor_card }}</h4>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            
                        </div>
                        
                    </div>
                </div>
            </div>
            
            
            <!-- Правая панель с информацией-->
            <div class="col-3" style="height: 100%">

                <div class="rounded-3 mt-2 d-flex justify-content-center" style="background: Honeydew; border: solid 1px darkgreen; height: 98%">

                    <div class="container">
                        <div class="row my-1">
                            <div class="col-7 d-flex align-items-center">
                                <div class="my-1" style="width: 100%;">                                    
                                    <h5>{{ interfaceData.table }}{{ table.id }}</h5>
                                    <h6 v-if="table.currentgame !== 0">{{ interfaceData.game }}{{ table.currentgame }}</h6>
                                    <h6 v-else>{{ interfaceData.game_notstarted }}</h6>
                                </div>
                            </div>
                            <div class="col-5 d-flex justify-content-center align-items-center">
                                <div class="d-flex flex-grow-1" style="width: 100%;">
                                    <button @click="leaveTable" class="btn btn-danger flex-grow-1 w-100">{{ interfaceData.button_leavetable }}</button>
                                </div>
                            </div>
                        </div>

                        <hr style="color: green">

                        <div class="row">
                            
                            <div v-if="table.status" class="col-8">
                                <div class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.ante }}</h6> <h6 v-if="table.min_bet !== undefined" class="text-end"><b>{{ table.min_bet }}</b></h6> </div>
                                <div class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData. max_players }}</h6> <h6 v-if="table.max_players !== undefined" class="text-end"><b>{{ table.max_players }}</b></h6> </div>
                                <div v-if="table.blind_game" class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.blindgame }}</h6> <h6 class="text-end"><b>{{ interfaceData.blindgame_true }}</b></h6></div>
                                <div v-else class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.blindgame }}</h6> <h6 class="text-end"><b>{{ interfaceData.blindgame_false }}</b></h6></div>
                                
                                <div class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.cointype }}</h6> 
                                    <span v-if="table.cointype === 0" class="badge text-bg-secondary" style="cursor:default">{{ interfaceData.array_cointype[table.cointype] || ''}}</span>
                                    <span v-if="table.cointype === 1" class="badge text-bg-warning" style="cursor:default">{{ interfaceData.array_cointype[table.cointype] || ''}}</span>
                                    <span v-if="table.cointype === 2" class="badge text-bg-success" style="cursor:default">{{ interfaceData.array_cointype[table.cointype] || ''}}</span>
                                </div>
                                    
                                <div class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.dropsuit }}</h6> <h6 v-if="interfaceData.array_dropsuit[table.drop_suit] !== undefined" class="text-end"><b>{{ interfaceData.array_dropsuit[table.drop_suit] || ''}} </b></h6> </div>
                                
                                <div v-if="table.table_password != '' && table.table_password !== null" class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.password }}</h6> <h6 v-if="table.table_password !== undefined" class="text-end"><b>{{ table.table_password }}</b></h6> </div>
                            </div>
                            
                            <!-- Сброшенная масть -->

                            <div class="col-4 d-flex justify-content-center align-items-center">
                                <div v-if="table.drop_suit !== 0" style="width: 80%">
                                    
                                    <img :src="dropsuit[table.drop_suit-1]" style="width: 100%;" :draggable="false">
                                    
                                </div>
                            </div>

                        </div>

                        <hr style="color: green">                        

                        <div v-if="table.status">
                            <div v-if="table.currentgame !== 0 && game.speaker_id === getUser.id" class="d-flex justify-content-between align-items-center rounded-3 my-1" style="background: blue">
                                <h5 class="ms-2 mt-1 align-self-center text-white" style="color: aliceblue;"><b>{{ getTruncNickname(getUser.nickname) }}</b></h5>
                            </div>
                            <div v-if="table.currentgame !== 0 && game.speaker_id !== getUser.id" class="d-flex justify-content-between align-items-center rounded-3 my-1">
                                <h5 class="ms-2 mt-1 align-self-center"><b>{{ getTruncNickname(getUser.nickname) }}</b></h5>
                            </div>
                        </div>

                        <hr style="color: green">                        
                        
                        <!-- Никнеймы соперников  -->
                        <div class="container">
                            <div v-if="table.status" class="row">
                                
                                <div v-for="playerN in [0, 1, 2, 3, 4, 5]" :key="playerN" style="padding: 0; margin: 0;">                                    
                                    <div v-if="game.speaker === playerN && table.players[playerN] !== 0" class="d-flex justify-content-between align-items-center rounded-3 mb-1" style="background: blue;">
                                        <b class="ms-2" style="color: aliceblue;">{{ getTruncNickname(table.players_nicknames[playerN]) }}</b> 
                                        <b v-if="table.dealer == playerN" class="me-2 text-end" style="color: aliceblue;"> - Dealer</b>
                                    </div>
                                    <div v-if="game.speaker !== playerN && table.players[playerN] !== 0" class="d-flex justify-content-between align-items-center rounded-3 mb-1" style="background: darkgreen;">
                                        <b class="ms-2" style="color: aliceblue;">{{ getTruncNickname(table.players_nicknames[playerN]) }}</b>
                                        <b v-if="table.dealer == playerN" class="me-2 text-end" style="color: aliceblue;"> - Dealer</b>
                                    </div>                                    
                                </div>
                                
                            </div>   
                        </div>
                        
                        <hr style="color: green">

                        <!-- Статус игры  -->
                        <div class="d-flex justify-content-center align-items-center rounded-3 my-1">
                            <div class="text-center">
                                <h5 v-if="table.status">
                                    <b v-if="table.currentgame !== 0"> {{ interfaceData.gamestages[game.stage] }} </b>
                                    <b v-else> {{ interfaceData.gamestages[0] }} </b>
                                </h5>
                            </div>
                        </div>

                        <!-- <hr style="color: green">

                        <input type="submit" @click="startNewGame" class="btn btn-danger flex-grow-1 m-1" value="New game"> -->

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
.background-table {
    width: 100%; /* Ширина элемента */
    background-repeat: no-repeat;
    background-image: url('frontimages/playingtable.png'); /* Путь к изображению */
    background-size: contain; 
    background-position: center; /* Позиция изображения по центру */
}
.red-table {
    background-repeat: no-repeat;
    background-image: url('frontimages/red_table.jpg'); /* Путь к изображению */
    background-size: cover; 
    background-position: center; /* Позиция изображения по центру */
    border-radius: 80px;
    
    
    height: 100%;
}
.green-table {
    background-repeat: no-repeat;
    background-image: url('frontimages/green_table_logo.png'); /* Путь к изображению */
    background-size: cover; 
    background-position: center; /* Позиция изображения по центру */
    border-radius: 120px;
    height: 100%;
    border: 4px solid Maroon;
}
.draggable-item {
    height: 17vh;
    cursor: grab; /* Установите курсор grab для элементов, чтобы указать их перетаскиваемость */
    pointer-events:visibleStroke; /* Уберите прозрачность и разрешите взаимодействие с элементом */
    user-select: none; /* Запретите выделение текста внутри элемента */
    
}

</style>