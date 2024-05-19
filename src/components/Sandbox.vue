<script>
import axios from 'axios';
import { serverUrl } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';
import { trunc_20, trunc_9_4 } from '../js/supply'


export default {
    name: 'SandboxPage',
    components: {
    },

    computed: {
        ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser', 'getActiveTable', 'globalErrorNumber']),
        isRivalsQuantityEven() {
            return this.rivalsQuantity % 2 === 0;
        },
        
        rivalsQuantity() {
            let maxPlayers = parseInt(this.game.max_players);
            if (isNaN(maxPlayers) || maxPlayers < 2 || maxPlayers > 6) {
                maxPlayers = 6;
            }
        return maxPlayers - 1;
  }

    },

    watch: {
        getCurrentLanguage(newLanguage) {
            this.update(newLanguage);      
        },
        getUser() { },
        rivalsQuantity() {
            this.updateRivals();
        }
    },

    data() {
        return {
            interfaceData: {
                "table" : "Sandbox",
                "game": "Game #",
                "game_notstarted": "The game has not started",
                "button_leavetable": "Leave table",
                "ante": "Ante:",
                "min_bet": "Minimal bet:",
                "max_players": "Players quantity:",
                "blindgame": "Blind game:",
                "cointype": "Coin type:",
                "dropsuit": "Dropped:",
                "password": "Password:",
                "blindgame_true": "enabled",
                "blindgame_false": "disabled",
                "cointype_demo": "Demo Coin",
                "array_dropsuit": ["None", "Spades", "Clubs", "Diamonds", "Hearts"],
                "gamestages": ["Not started", "Ante betting", "Blind betting", "Dealing", "First turn betting", "Discard extra card", "First turn", "Second turn", "Third turn", "Draw over", "Waiting for players to AZI joining", "All check - Re-dealing", "Waiting for the new Game"],
                "button_bet": "Bet",
                "button_raise": "Raise",
                "button_call": "Call",
                "button_check": "Check",
                "button_fold": "Fold",
                "button_azi_in": "AZI-in for:",
                "button_azi_refuse": "Refuse AZI",
                "button_blind": "Blind bet",
                "button_blind_off": "Without blind bet",
                "button_newgame": "Start the new game",
                "button_gamerefuse": "Leave table",
                "button_gotorules": "Game rules",
                "drop_your_card": "Drop one of your cards",
                "hint_attacker": "Attacker player",
                "desk_pot": "POT:",
                "desk_trump": "TRUMP",
                "hint_timeout": "The action must be performed by the user before the timeout expires, otherwise the default automatic action will be performed",
                "badge_game": "game# ",
                "badge_winner": "WINNER",
                "badge_pot": "Pot:  ",
                "badge_azi_in": "AZI-in",
                "badge_azi_out": "AZI-out",
                "badge_azi_burst": "AZI burst in",
                "badge_azi_refuse": "Refused to AZI",
                "balance": "Democoin balance: ",
                "button_no_balance": "Not enough coins",
                "button_push_balance": "Top up your account",
                "usersays": ["", "Ante betting: ", "Bet: ", "TOP bet: ", "Blind bet: ", "TOP blind bet: ", "Raise: ",  "Check", "Call: ", "Fold", "Out of coins, fold", "Burst into AZI: ", "Refuse of AZI", "Out of coins", "Without blind bet", "TOP Raise:"],
                "blind_bet_button": ["Bet:", "Call:"],
                "your_turn": "Your turn",
                "your_word": "Your turn",
                "dealer": "Dealer",
                "button_change_rivals": "Change rivals",
                "button_close_table": "Close table",
                "hint_close_table": "When this button is pressed, the game will be interrupted and the table will be closed. Current game data will not be saved",
                "game_on": "The game is on",
                "game_off": "The game has not started"
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
            game: {
                max_players: 6,
                players: [0, 0, 0, 0, 0, 0],
                min_bet: 1,
                drop_suit: 0,
                trump_suit: 0,
                pot: 0,
                winner: -1,                
                actual_deck: [],
                card_players: [0, 0, 0, 0, 0, 0],
                card_place1: [0, 0, 0, 0, 0, 0],
                card_place2: [0, 0, 0, 0, 0, 0],
                card_place3: [0, 0, 0, 0, 0, 0],
                card_place: [0, 0, 0, 0, 0, 0],
                speaker: -1,
                speaker_id: 0,
                stage: 0,
                players_bet: [0, 0, 0, 0, 0, 0],
                usersays: [0, 0, 0, 0, 0, 0],
                usersays_value: [0, 0, 0, 0, 0, 0],
                top_bet: false,
                check_status: [false, false, false, false, false, false],
                status: [0, 0, 0, 0, 0, 0],
                turn1win: -1,
                turn2win: -1,
                turn3win: -1,
                current_hodor: -1,
                azi_price: 0,
                blind_game: true,
                dealing: -1,
                player_balance: 0,
                bot_nicknames: ['','','','','',''],
                my_cards: [0, 0, 0, 0]
            },
            dropsuit: ['/images/192-spades.png','/images/192-clubs.png','/images/192-diamonds.png','/images/192-hearts.png'],
            all_users: [{"id": 0, "nickname": ""}],
            playerIndex: 0,
            myCardsUnknown: true,
            myCards: [
                {pos: 0, card: 0, name: 'myCard1', image: '/images/cards/220-empty.png', type: 'card', opacity: 'opacity: 100%'},
                {pos: 1, card: 0, name: 'myCard2', image: '/images/cards/220-empty.png', type: 'card', opacity: 'opacity: 100%'},
                {pos: 2, card: 0, name: 'myCard3', image: '/images/cards/220-empty.png', type: 'card', opacity: 'opacity: 100%'},
                {pos: 3, card: 0, name: 'myCard4', image: '/images/cards/220-empty.png', type: 'card', opacity: 'opacity: 100%'},
            ],
            cardImagePath:[
                '/images/cards/220-cads_shirt.png',
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
            rivals: [ 
                {"id": 0, "nickname": "", "index": 1}, 
                {"id": 0, "nickname": "", "index": 2}, 
                {"id": 0, "nickname": "", "index": 3}, 
                {"id": 0, "nickname": "", "index": 4}, 
                {"id": 0, "nickname": "", "index": 5} ],
            rivalsWidth: ['width: 100%', 'width: 30%', 'width: 50%', 'width: 75%', 'width: 100%', 'width: 100%' ],
            coins: [0, 0, 0, 0, 0, 0],
            playerIsAlone: true,
            //# 0 - ожидание
            //# 1 - готов к игре
            //# 2 - сделана стартовая ставка Ante
            //# 3 - окончены торги и сброшена карта
            //# 4 - сделан 1-й ход
            //# 5 - сделан 2-й ход
            //# 6 - сделан 3-й ход
            //# 7 - в Ази
            //# 8 - вырезан из Ази
            //# 9 - Вкупился в Ази
            //# 10- Отказался от Ази
            //# 11- Упал 
            //# 12- Нет монет для игры
            statusColor: ['Grey','Indigo','Indigo','Indigo','Indigo','Indigo','Indigo','Indigo','Grey','Indigo','#ffc107','#ffc107','Brown'],
            showCard: false,
            cardImgSrc: '/images/cards/220-cads_shirt.png',
            cardImg: null,
            card_place: [0, 0, 0, 0, 0, 0],
            card_place1: [0, 0, 0, 0, 0, 0],
            card_place2: [0, 0, 0, 0, 0, 0],
            card_place3: [0, 0, 0, 0, 0, 0],
            screenHeight: 900,
            new_game: { 
                user_id: 0,
                max_players: 6,
                min_bet: 1,
                drop_suit: 0,
                blind_game: true,
                winner: -1

            }
        };
    },

    async created() {    
        const getUserData = await email_check_auth();    
        this.userData = getUserData;
        this.userId = this.userData.user_id;
        if (!this.userData['is_auth']) {
            this.goToAccessDenied();
        }    
        await this.getInterface();
        if (getUserData.active_table > 0) {
            this.goToLobby();
        }
        this.$store.commit('setUser', {
            id: this.userData.user_id,
            nickname: this.userData.nickname,
            email: this.userData.email,
            active_table: this.userData.active_table,
            wallet: this.userData.wallet
        });        
        this.$socket.emit('join_sandbox_inside', { user_id: this.userData.user_id });
        console.log('CREATED: Image ', this.cardImg)
    },

    async mounted() {
        console.log('SANDBOX TABLE MOUNTED');

        this.cardImg = this.$refs.card_shirt;
        this.$socket.on('update_sandbox_game', (data) => {
            this.updateTableData(data);
        });
        this.$socket.on('update_table_data_cards', (data) => {
            this.updateTableDataCards(data);
        });
        this.$socket.on('get_private_notice', (data) => {
            this.getPrivateNotice(data);
        });
        this.$socket.on('get_my_cards', (data) => {
            this.updateUserCards(data);
        });
        this.screenHeight = window.innerHeight;
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
        ...mapActions(['setGlobalModalErrorOff', 'setGlobalModalErrorOn', 'setGlobalError']),

        async getInterface() {
            this.userId = this.$route.params.user_id;
            try {        
                const response = await axios.get(`${serverUrl}/api/get_sandboxtable_interface`);
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

        getPrivateNotice(data) {
            if (data.status) {
                if (data.error === 800) { //#Quit from the table by def leave_table                    
                    this.$router.push(`/tables`);
                } else { 
                    if (data.error !== 708) {
                        this.setGlobalError(data.error);
                        this.setGlobalModalErrorOn();
                        console.log('GET PRIVATE NOTICE - DATA: ', data)
                    }
                if (data.error === 712) {
                    this.$router.push(`/tables`);
                }
                if (data.error >= 721 && data.error <= 723) {
                    this.setGlobalModalErrorOff();
                    this.setGlobalError(data.error);
                    this.setGlobalModalErrorOn();
                    }
                }
            } else {
                console.log('GET PRIVATE NOTICE - DATA: ', data);
            }
        },

        goToAccessDenied() {
            this.$router.push('/access_denied');
        },

        goToLobby() {        
            this.$router.push(`/tables`);
        },

        leaveTable() {        
            this.$socket.emit('leave_sandbox', { user_id: this.userData.user_id });
            console.log('LEAVE SANDBOX');
        },

        closeTable() {        
            this.$socket.emit('close_sandbox', { user_id: this.userData.user_id });
            console.log('CLOSE SANDBOX');
        },

        updateTableData(data) {
            if (data.status) {
                console.log('UPDATE TABLE DATA:', data.game);
                this.game = data.game;
                this.updateRivals();
                this.updateMyCards();
                if (this.game.stage === 1 || this.game.stage === 0 || this.game.stage >= 9) {
                    this.myCards = [
                        {pos: 0, card: 0, name: 'myCard1', image: '/images/cards/220-empty.png', type: 'card', opacity: 'opacity: 100%'},
                        {pos: 1, card: 0, name: 'myCard2', image: '/images/cards/220-empty.png', type: 'card', opacity: 'opacity: 100%'},
                        {pos: 2, card: 0, name: 'myCard3', image: '/images/cards/220-empty.png', type: 'card', opacity: 'opacity: 100%'},
                        {pos: 3, card: 0, name: 'myCard4', image: '/images/cards/220-empty.png', type: 'card', opacity: 'opacity: 100%'},
                    ]
                }
                if (data.turn_player_index !== null && data.turn_player_index !== undefined && data.turn_player_index !== this.playerIndex && data.turn_player_index >= 0 && data.turn_player_index <=5) {                
                    const card_place_json = {
                        '0': this.game.card_place, 
                        '1': this.game.card_place1, 
                        '2': this.game.card_place2, 
                        '3': this.game.card_place3, 
                        }
                    this.rivalTurn(data.turn_player_index, card_place_json);
                } else {
                    this.card_place = this.game.card_place;
                    this.card_place1 = this.game.card_place1;
                    this.card_place2= this.game.card_place2;
                    this.card_place3 = this.game.card_place3;                
                }
                if (this.playerIndex === -1) {
                    this.stopProgressBar();
                    this.$router.push(`/tables`);
                }
            } else {
                this.setGlobalError(data.error);
                this.setGlobalModalErrorOn();
            }
        },
    

        updateRivals() {        
            const rivals = [];            
            const maxPlayers = this.game.max_players;            
            const players = this.game.players.slice(0, maxPlayers);
            const nicknames = this.game.bot_nicknames.slice(0, maxPlayers);            
            // Начиная с элемента, следующего за текущим пользователем, добавляем соперников в массив
            for (let idx = 1; idx < maxPlayers; idx++) {                
                const rival = {
                    id: players[idx],
                    nickname: nicknames[idx],
                    index: idx
                };
                rivals.push(rival);                
            }
            this.rivals = rivals;            
        },

        getTruncNickname(user_nickname) {
            try {
                return trunc_20(user_nickname)
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

        textValue(number) {
            if (typeof number !== 'number' || number === 0) {
                return '';
            }
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        startGame() {
            console.log('START GAME: ', this.game.max_players, this.game.drop_suit, this.game.blind_game, this.game.min_bet);
            if (this.game.min_bet > this.game.player_balance) {
                this.setGlobalError(724);
                this.setGlobalModalErrorOn();
            } else if (!(this.game.min_bet > 0 && Number.isInteger(this.game.min_bet))) {
                this.setGlobalError(725);
                this.setGlobalModalErrorOn();
            } else if (this.game.min_bet > 1000) {
                this.setGlobalError(726);
                this.setGlobalModalErrorOn();
            } else {
                this.new_game.max_players = Number(this.game.max_players);
                this.new_game.min_bet = this.game.min_bet;
                this.new_game.drop_suit = Number(this.game.drop_suit);
                this.new_game.blind_game = this.game.blind_game;
                this.new_game.user_id = this.getUser.id;
                this.new_game.winner = this.game.winner;
                console.log('START NEW GAME ', this.new_game);
                this.$socket.emit('sandbox_start_game', { user_id: this.getUser.id, game: this.new_game });
            }                  
        },

        goToRules() {
            this.$router.push(`/rules`); 
        },

        topUpAccount() {
            this.$router.push(`/rules`); 
        },

        changeRivals() {
            const maxPlayers = parseInt(this.game.max_players);
            this.$socket.emit('sandbox_change_rivals', { user_id: this.userData.user_id, max_players: maxPlayers });
        },

        updateTableDataCards(data) {
            if (data.status) {            
                this.dealCard(data.index)
                this.game = data.game;
            }
        },

        dealCard(dealIndex) {
            try {
            // Получаем элементы DOM
            const card = this.$refs.card_shirt;
            // console.log('DEAL CARD start: ', card)
            if (card != null) {
                // console.log('DEAL CARD INSIDE: ', card)
                const deck = document.getElementById('deck');
                const destination = document.getElementById('destination_' + dealIndex);
                // Устанавливаем начальное положение карты над колодой
                card.style.height = '15vh';
                card.style.opacity = '1';
                card.style.display = 'block';
                card.style.left = deck.offsetLeft + 'px';
                card.style.top = deck.offsetTop + 'px';
                // Анимируем перемещение карты к месту назначения
                const destinationLeft = destination.offsetLeft;
                const destinationTop = destination.offsetTop;
                const animation = card.animate(
                    [
                        { transform: `translate(0px, 0px)` },
                        { transform: `translate(${destinationLeft - deck.offsetLeft}px, ${destinationTop - deck.offsetTop}px)` }
                    ],
                    { duration: 200, easing: 'ease-in-out'}
                );
                // По завершению анимации скрываем карту
                animation.onfinish = () => {
                    card.style.opacity = '0';
                    // console.log('DEAL CARD - ANIMATION')
                }
            } else {
                // console.log('DEAL CARD - ANIMATION ERROR')
            }
            } catch {
                console.error('DEAL ERROR')
            }
        },

        rivalTurn(index, card_place_json) {
            try {
                const card = this.$refs.card_shirt;
                const deck = document.getElementById('rivalplace_' + index);
                const destination = document.getElementById('tableplace_' + index);            
                if (card != null && deck != null && destination != null) {                
                    // Устанавливаем начальное положение карты над колодой
                    card.style.height = '15vh';
                    card.style.opacity = '1';
                    card.style.display = 'block';
                    card.style.left = deck.offsetLeft + 'px';
                    card.style.top = deck.offsetTop + 'px';
                    // Анимируем перемещение карты к месту назначения
                    const destinationLeft = destination.offsetLeft;
                    const destinationTop = destination.offsetTop;
                    const animation = card.animate(
                        [
                            { transform: `translate(0px, 0px)` },
                            { transform: `translate(${destinationLeft - deck.offsetLeft}px, ${destinationTop - deck.offsetTop}px)` }
                        ],
                        { duration: 300, easing: 'ease-in-out'}
                    );
                    // По завершению анимации скрываем карту
                    animation.onfinish = () => {
                        card.style.opacity = '0';
                        this.card_place = card_place_json['0'];
                        this.card_place1 = card_place_json['1'];
                        this.card_place2 = card_place_json['2'];
                        this.card_place3 = card_place_json['3'];
                    }
                } else {
                    this.card_place = card_place_json['0'];
                    this.card_place1 = card_place_json['1'];
                    this.card_place2 = card_place_json['2'];
                    this.card_place3 = card_place_json['3'];
                }
            } catch (error) {
                console.error('RIVAL TURN ERROR', error)
                this.card_place = card_place_json['0'];
                this.card_place1 = card_place_json['1'];
                this.card_place2 = card_place_json['2'];
                this.card_place3 = card_place_json['3'];
            }
        },

        updateMyCards() {            
            const myCardsArray = this.game.my_cards
            for (let n = 0; n < 4; n++) {
                const card = myCardsArray[n];                
                const strCard = card < 10 ? '0' + card : '' + card;
                this.myCards[n].card = card // Присваиваем ключу card значение myCards[n]
                this.myCards[n].image = '/images/cards/220-cads-deck' + strCard + '.png'; // Присваиваем ключу image значение '/images/cards/220-cads-deck{strCard}.png'
            }        
        },

        bettingBlind(bet) {
            let int_bet = parseInt(bet, 10);
            if (isNaN(int_bet)) {
                int_bet = 0; // Если преобразование не удалось, устанавливаем int_bet в 0
            }        
            this.$socket.emit('sandbox_user_blind_bet', { user_id: this.userData.user_id, blind_bet: int_bet });
            console.log('BETTING BLIND BET: bet is ', int_bet)
        },

        bettingBlindCheck() {
            this.$socket.emit('sandbox_user_blind_check', { user_id: this.userData.user_id});
            console.log('BETTING BLIND CHECK')
        },

        bettingRaise(raise_bet) {
            console.log('BETTING RAISE: bet is ', raise_bet);
            let int_bet = parseInt(raise_bet, 10);
            if (isNaN(int_bet)) {
                int_bet = 0; // Если преобразование не удалось, устанавливаем int_bet в 0
            }
            this.$socket.emit('sandbox_user_raise', { user_id: this.userData.user_id, raise_bet: int_bet });
            console.log('BETTING RAISE: bet is ', int_bet)
        },

        bettingBet(bet) {
            console.log('BETTING BET: bet is ', bet)
            let int_bet = parseInt(bet, 10);
            if (isNaN(int_bet)) {
                int_bet = 0; // Если преобразование не удалось, устанавливаем int_bet в 0
            }        
            this.$socket.emit('sandbox_user_bet', { user_id: this.userData.user_id, bet: int_bet });
            console.log('BETTING BLIND BET: bet is ', int_bet)
        },

        bettingCall() {
            console.log('BETTING call')        
            this.$socket.emit('sandbox_user_call', { user_id: this.userData.user_id, table_id: this.tableId});
        },

        bettingFold() {
            console.log('BETTING FOLD')
            this.$socket.emit('sandbox_user_fold', { user_id: this.userData.user_id, table_id: this.tableId});
        },

        bettingCheck() {
            console.log('BETTING CHECK');
            this.$socket.emit('sandbox_user_check', { user_id: this.userData.user_id, table_id: this.tableId});
        },

        bettingAziHalfPot() {
            this.$socket.emit('sandbox_user_azi_burst', { user_id: this.userData.user_id });
            console.log('BETTING AZI HALF POT')
        },

        bettingAziDecline() {
            this.$socket.emit('sandbox_user_azi_refuse', { user_id: this.userData.user_id });
            console.log('BETTING AZI DECLINE')
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
            this.myCards[item.pos]['opacity'] = 'opacity: 50%';
        },

        cancelDrag(event) {
            event.preventDefault();
            console.log('CANCEL DRAG')
            this.myCards.forEach(card => {
                card.opacity = 'opacity: 100%';
            });
        },

        calculateMargin(arrayIndex,index) {
            let margin = 0;
            for (let i = 0; i < index; i++) {
                if ( arrayIndex == 1) {
                    if (this.game.card_place1[i] !== 0) {
                        margin += 15;
                    }
                }
                if (arrayIndex == 2) {
                    if (this.game.card_place2[i] !== 0) {
                        margin += 15;
                    }
                }
                if (arrayIndex == 3) {
                    if (this.game.card_place3[i] !== 0) {
                        margin += 15;
                    }
                }
            }
            return `${margin}px`;
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
                    if (this.game.stage < 5) {
                        this.setGlobalError(713);
                        this.setGlobalModalErrorOn();
                    }
                    const emptyCards = this.myCards.filter(item => item.card === 0);
                    console.log('EMPTY CARDS IS ', emptyCards.length);
                    if (this.game.stage === 5) {
                        if (emptyCards.length > 0) {
                            this.setGlobalError(714);
                            this.setGlobalModalErrorOn();
                        } else {
                            this.$socket.emit('sandbox_user_drop_card', { user_id: this.userData.user_id, card_pos: droppedCard.card_pos });
                            // this.myCards[droppedCard.card_pos].card = 0
                        }
                    } else if (this.game.stage === 6) {
                        if (emptyCards.length > 1) {
                            this.setGlobalError(715);
                            this.setGlobalModalErrorOn();
                        }
                        if (this.game.speaker !== this.playerIndex) {
                            this.setGlobalError(716);
                            this.setGlobalModalErrorOn();
                        }
                        if (emptyCards.length === 1 && this.game.speaker === this.playerIndex) {
                            this.$socket.emit('sandbox_game_turn_1', { user_id: this.userData.user_id, card_pos: droppedCard.card_pos });
                        }
                    } else if (this.game.stage === 7) {
                        if (emptyCards.length > 2) {
                            this.setGlobalError(715);
                            this.setGlobalModalErrorOn();
                        }
                        if (this.game.speaker !== this.playerIndex) {
                            this.setGlobalError(716);
                            this.setGlobalModalErrorOn();
                        }
                        if (emptyCards.length === 2 && this.game.speaker === this.playerIndex) {
                            this.$socket.emit('sandbox_game_turn_2', { user_id: this.userData.user_id, card_pos: droppedCard.card_pos });
                        }
                    } else if (this.game.stage === 8) {                    
                        if (this.game.speaker !== this.playerIndex) {
                            this.setGlobalError(716);
                            this.setGlobalModalErrorOn();
                        }
                        if (emptyCards.length === 3 && this.game.speaker === this.playerIndex) {
                            this.$socket.emit('sandbox_game_turn_3', { user_id: this.userData.user_id, card_pos: droppedCard.card_pos });
                        }
                    }                
                }
            } catch (error) {   
                console.log('CARD INVALID DROPPED:');
            }
        },

        async depositDemocoin() {
            if ((this.game.player_balance >= 1000)) {
                this.setGlobalError(475);
                this.setGlobalModalErrorOn();
            } else {
                try {
                    const dataToSend = {
                        'user_id': this.getUser.id,            
                        'token': localStorage.getItem('authToken')
                    }
                    console.log('DEPOSIT DEMOCOIN');
                    const response = await axios.post(`${serverUrl}/api/user_deposit_demo`, dataToSend);
                    console.log(response)          
                    if (response.data['result']) {
                        this.$socket.emit('update_sandbox_request');
                        this.setGlobalError(476);
                        this.setGlobalModalErrorOn();
                        console.log('DEPOSIT DEMOCOIN - response: SUCCESS');
                    } else {
                        this.$socket.emit('update_sandbox_request');
                        this.setGlobalError(response.data['code']);
                        this.setGlobalModalErrorOn();
                        console.log('DEPOSIT DEMOCOIN - response: ERROR');
                    }          
                } catch (error) {
                    this.$socket.emit('update_sandbox_request');
                    this.setGlobalError(0);
                    this.setGlobalModalErrorOn();
                    console.error('Error DEPOSIT DEMOCOIN', error);
                }
            }    
        },

        testFunction() {
            this.$socket.emit('sandbox_goto_currentgamestage', { user_id: this.userData.user_id });
        },


    }
}

</script>

<template>
    <div class="container-fluid" style="background: silver">
        <div class="row" style="height: 96%;">
            <!--  Левый игровой блок-->            
            <div class="col-9" style="height: 100%">
                <div style="height: 100%; margin-left: 10px;">
                    
                    <!-- Верхняя панель - информация соперников -->
                    <div v-if="game.stage === 0 || game.stage === 12" class="row align-items-center justify-content-center" style="height: 20%;">
                        <div v-if="game.status" class="container-fluid" style="height: 100%" :style="rivalsWidth[rivalsQuantity]">
                            <div class="row align-items-center, main mt-1" style="height: 100%;" >
                                <div v-for="(rival, index) in rivals.slice(0, rivalsQuantity)" :key="index" class="col align-items-center" style="height: 100%;">
                                    <div class="p-1 rounded-4" style="height: 74%;" :style="{'background': game.players.indexOf(rival.id) === game.speaker ? 'RoyalBlue' : ''}">
                                        <!-- Верхний ряд 1/3 - Имена соперников -->
                                        <div class="align-items-center" style="height: 25%;">
                                            <div @click="goToPlayerProfile(rival)" class="main rounded-5" :style="{ background: statusColor[game.status[rival.index]] }" style="cursor: pointer; text-align: center; vertical-align: middle">
                                                <b style="color: white"> {{ getTruncNickname20(rival.nickname) }}</b>
                                            </div>
                                        </div>

                                        <div v-if="game.stage === 12 && game.winner === game.players.indexOf(rival.id)" class="row align-items-center, main rounded-4 mt-2" style="height:75%; background: forestgreen;">                                            
                                            <div class="align-items-center justify-content-center" style="height: 20%;"><h5 class="text-center align-middle" style="color: aliceblue;"><b></b></h5></div>
                                            <div class="align-items-center justify-content-center" style="height: 40%;"><h5 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_winner }}</b></h5></div>
                                            <div class="align-items-center justify-content-center" style="height: 40%;"><h6 class="text-center align-middle" style="color: aliceblue;">{{ interfaceData.badge_pot }}<b>{{ textNumber(this.game.pot) }}</b></h6></div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="!(game.stage === 0 || game.stage === 12)" class="row align-items-center justify-content-center" style="height: 25%;">
                        <div v-if="game.status" class="container-fluid" style="height: 100%" :style="rivalsWidth[rivalsQuantity]">
                            <div class="row align-items-center, main mt-1" style="height: 100%;" >
                                <div v-for="(rival, index) in rivals.slice(0, rivalsQuantity)" :key="index" class="col align-items-center" style="height: 100%;">
                                    <div class="p-1 rounded-4" style="height: 74%;" :style="{'background': game.players.indexOf(rival.id) === game.speaker ? 'RoyalBlue' : ''}">
                                        <!-- Верхний ряд 1/3 - Имена соперников -->
                                        <div class="align-items-center" style="height: 25%;">
                                            <div @click="goToPlayerProfile(rival)" class="main rounded-5" :style="{ background: statusColor[game.status[rival.index]] }" style="cursor: pointer; text-align: center; vertical-align: middle">
                                                <b style="color: white"> {{ getTruncNickname20(rival.nickname) }}</b>
                                            </div>
                                        </div>

                                        <!-- Верхний ряд 2/3 - Карты соперников -->
                                        <div :id="'destination_' + rival.index" v-if="(game.stage >= 3 && game.stage <= 9)" class="row align-items-center, main" style="height: 75%;">
                                            <div class="col-2 align-items-center justify-content-center d-flex">
                                                <div v-if="game.players.indexOf(rival.id) === game.current_hodor && game.stage >=3 && game.current_hodor != -1" :title="interfaceData.hint_attacker">
                                                    <h3 class="" style="cursor: default;"><b>A</b></h3>
                                                </div>
                                            </div>
                                            <div :id="'rivalplace_' + rival.index" class="col-8 align-items-center justify-content-center">
                                                <img v-if="game.card_players[rival.index] === 0" class="my-1" :src="cardRivalImagePath[0]" style="height: 12vh; margin-left: 0px; position: absolute;" :draggable="false">
                                                <img v-if="game.card_players[rival.index] === 1" class="my-1" :src="cardRivalImagePath[1]" style="height: 12vh; margin-left: 0px; position: absolute;" :draggable="false">
                                                <img v-if="game.card_players[rival.index] === 2" class="my-1" :src="cardRivalImagePath[2]" style="height: 12vh; margin-left: 0px; position: absolute;" :draggable="false">
                                                <img v-if="game.card_players[rival.index] === 3" class="my-1" :src="cardRivalImagePath[3]" style="height: 12vh; margin-left: 0px; position: absolute;" :draggable="false">
                                                <img v-if="game.card_players[rival.index] === 4" class="pb-1" :src="cardRivalImagePath[4]" style="height: 12vh; margin-left: 0px; position: absolute;" :draggable="false">
                                            </div>
                                            <div class="col-2"></div>
                                        </div>

                                        <div v-if="(game.stage === 10 && game.status[rival.index] === 7)" class="row align-items-center, main rounded-4" style="height: 75%;">
                                            <div class="d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: SlateBlue">
                                                <div class="align-items-center justify-content-center"><h4 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_in }}</b></h4></div>
                                            </div>
                                        </div>

                                        <div v-if="(game.stage === 10 && game.status[rival.index] === 8)" class="row align-items-center, main rounded-4" style="height: 75%;">
                                            <div class="d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: slategray">
                                                <div class="align-items-center justify-content-center"><h4 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_out }}</b></h4></div>
                                            </div>
                                        </div>

                                        <div v-if="(game.stage === 10 && game.status[rival.index] === 9)" class="row align-items-center, main rounded-4" style="height: 75%;">
                                            <div class="d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: slateblue">
                                                <div class="align-items-center justify-content-center"><h4 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_burst }}</b></h4></div>
                                            </div>
                                        </div>

                                        <div v-if="(game.stage === 10 && game.status[rival.index] === 10)" class="row align-items-center, main rounded-4" style="height: 75%;">
                                            <div class="d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: #ffc107">
                                                <div class="align-items-center justify-content-center"><h4 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_refuse }}</b></h4></div>
                                            </div>
                                        </div>

                                    </div>

                                    <div style="height: 26%;">
                                    <!-- Верхний ряд 3/3 - Реплики соперников/прогрессбар -->
                                    
                                        <div v-if="!(game.stage === 5 && game.status[rival.index] === 2) &&
                                            !(game.stage === 12 && game.status[rival.index] === 0) &&
                                            !(game.stage === 0 && game.status[rival.index] === 0) &&
                                            !(game.stage === 10 && (game.status[rival.index] === 8 || game.status[rival.index] === 11))
                                            " class="row align-items-center" style="height:100%">
                                            <div>
                                                <div v-if="game.usersays[rival.index] !== 0 && game.usersays[rival.index] !== undefined && game.status[rival.index] > 1" class="d-flex align-items-center rounded-3 mb-1 w-100" style="height:80%; background:white; white-space: pre-line;">
                                                    <h6 class="ms-3 mt-1" style="color: black">{{ interfaceData.usersays[game.usersays[rival.index]] }} {{ textValue(game.usersays_value[rival.index]) }}</h6>
                                                </div>
                                            </div>
                                        </div>                                                                                
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Средняя панель - игровой стол -->
                    <div class="row align-items-center, main" style="height: 57%;">                        
                        <div class="green-table" @dragenter.prevent="dragEnter" @dragover.prevent="dragOver" @drop="dropCard">
                            <div class="row" style="height: 96%; ">
                                
                                <!-- Левая часть стола - кон -->
                                <div class="col-1 align-items-center justify-content-center text-center">
                                    <div class="row" style="height: 40%"></div>
                                    <div class="row" style="height: 20%;">
                                        <b class="text-center" style="color: white;">{{ interfaceData.desk_pot }}</b>
                                        <br>
                                        <b v-if="game.id !== 0 && game.stage !== 12" style="color: white;">{{ textNumber(game.pot) }}</b>
                                    </div>
                                    <div class="row" style="height: 20%"></div>
                                </div>
                                <!-- Центральная часть стола - место для карт  -->
                                <div class="col-10" style="height: 100%;">
                                    <!--Взятки соперника-->
                                    <div class="row" style="height: 25%; opacity: 60%;">
                                        <div class="container-fluid" style="height: 100%" :style="rivalsWidth[rivalsQuantity]">
                                            <div class="row align-items-center, main mt-1" style="height: 100%;" >
                                            <div v-for="rival in this.rivals" :key="rival.id" class="col align-items-center">
                                                
                                                <div class="row" style="background: 1300">                                                
                                                    <div v-if="(rival.index == game.turn1win)" class="col-1">                                         
                                                        <template v-for="(card, index) in card_place1">
                                                            <img v-if="card !== 0" :key="index" class="my-1" :src="cardImagePath[card]" :style="{ height: '15vh', marginLeft: calculateMargin(1,index), position: 'absolute' }">
                                                        </template>
                                                    </div>
                                                    <div v-if="(rival.index == game.turn2win)" class="col-1" style="margin-top: 35px">                                                    
                                                        <template v-for="(card, index) in card_place2">
                                                            <img v-if="card !== 0" :key="index" class="my-1" :src="cardImagePath[card]" :style="{ height: '15vh', marginLeft: calculateMargin(2,index), position: 'absolute' }">
                                                        </template>
                                                    </div>
                                                    <div v-if="(rival.index == game.turn3win)" class="col-1" style="margin-top: 70px">
                                                        <template v-for="(card, index) in card_place3">
                                                            <img v-if="card !== 0" :key="index" class="my-1" :src="cardImagePath[card]" :style="{ height: '15vh', marginLeft: calculateMargin(3,index), position: 'absolute' }">
                                                        </template>
                                                    </div>
                                                    <div class="col-9">
                                                    </div>
                                                </div>

                                                </div>
                                            </div>
                                        </div> 
                                    </div>
                                    <!--Ходы соперника и пользвоателя -->
                                    <div class="row" style="height: 50%">
                                        <div class="container-fluid" style="height: 100%" :style="rivalsWidth[rivalsQuantity]">
                                            <div class="" style="height: 100%">
                                                <!--Ходы соперника  -->
                                                <div class="row" style="height: 50%">                                        
                                                    <div v-for="rival in this.rivals" :key="rival.id" class="col" >
                                                        <div :id="'tableplace_' + rival.index">
                                                            <img v-if="(card_place[rival.index] != 0)" class="my-1" :src="cardImagePath[card_place[rival.index]]" style="height: 15vh; position: absolute;">
                                                        </div>
                                                    </div>
                                                </div>
                                                <!--Ходы пользователя  -->
                                                <div class="row" style="height: 50%">
                                                    <div class="row" style="height: 50%; place-items: center;">
                                                        <div class="col-5">
                                                        </div>
                                                        <div class="col-1">
                                                            <div v-if="isRivalsQuantityEven" style="position: relative;">
                                                                <img v-if= "(card_place[playerIndex] != 0)" class="my-1" :src="cardImagePath[card_place[playerIndex]]" style="height: 15vh; position: absolute; top: 0; right: 0;">
                                                            </div>
                                                        </div>
                                                        
                                                        <div class="col-1">
                                                            <div v-if="!isRivalsQuantityEven" style="position: relative;">
                                                                <img v-if= "(card_place[playerIndex] != 0)" class="my-1" :src="cardImagePath[card_place[playerIndex]]" style="height: 15vh; position: absolute; top: 0; right: 0;">
                                                            </div>
                                                        </div>
                                                        <div class="col-5">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!--Взятки пользователя-->
                                    <div class="row" style="height: 25%; opacity: 60%;">
                                        <div v-if="playerIndex == game.turn1win" class="col-2" style="position: relative;">
                                            <template v-for="(card, index) in card_place1">
                                                <img v-if="card !== 0" :key="index" class="my-1" :src="cardImagePath[card]" :style="{ height: '15vh', marginLeft: calculateMargin(1,index), position: 'absolute',bottom: 0, left: 0}">
                                            </template>
                                        </div>
                                        <div v-if="playerIndex == game.turn2win" class="col-2" style="position: relative;">
                                            <template v-for="(card, index) in card_place2">
                                                <img v-if="card !== 0" :key="index" class="my-1" :src="cardImagePath[card]" :style="{ height: '15vh', marginLeft: calculateMargin(2,index), position: 'absolute', bottom: 0, left: 0}">
                                            </template>
                                        </div>
                                        <div v-if="playerIndex == game.turn3win" class="col-2" style="position: relative;">
                                            <template v-for="(card, index) in card_place3">
                                                <img v-if="card !== 0" :key="index" class="my-1" :src="cardImagePath[card]" :style="{ height: '15vh', marginLeft: calculateMargin(3,index), position: 'absolute', bottom: 0, left: 0}">
                                            </template>
                                        </div>

                                        <div class="col-6 d-flex align-items-center justify-content-center">                                        
                                        
                                        </div>
                                    </div>
                                        
                                </div>
                                
                                <!-- Правая часть стола - козырь -->
                                <div class="col-1">
                                    <div class="row align-items-start text-center" style="height: 30%;">
                                    </div>
                                    <div class="row align-items-start" style="height: 35%;">
                                        <div id="deck" class="align-items-start p-1">
                                            <img v-if="game.stage >= 2" class="" :src="cardImagePath[0]" style="height: 15vh; position: absolute;">                                        
                                            <img v-if="game.stage >= 2" class="m-2" :src="cardImagePath[0]" style="height: 15vh; position: absolute;">
                                            <img ref="card_shirt" class="m-2" :src="cardImagePath[0]" style="height: 15vh; position: absolute; opacity: 0;">
                                            <img v-if="game.trump_value !== 0" class="m-3" :src="cardImagePath[game.trump_value]" style="height: 15vh; position: absolute;">
                                        </div>
                                    </div>
                                    <div class="row align-items-start text-center" style="height: 35%">
                                        <h6 style="color: LimeGreen"><b>{{ interfaceData.desk_trump }}</b></h6>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    <!-- Панель управления пользователя -->
                    <div class="row align-items-end" :style="{ height: game.stage === 0 || game.stage === 12 ? '23%' : '18%', cursor: 'default' }">
                        <!--  1 колонка панели - информация пользователя -->
                        <div class="col" style="display: grid; place-items: center; height:100%;">
                            <div class="container" style="margin:0; padding:0; height:100%;">
                                <!-- uID и никнейм пользователя -->
                                <div class="row align-items-start mt-1" style="height: 25%">
                                    <div class="col-4 align-self-center">
                                        <div style="color: black"><h5>uID: <b> {{ getUser.id }} </b></h5></div>
                                    </div>
                                    <div class="col-8 align-self-center">                                                                                
                                        <div class="d-flex justify-content-center align-items-center rounded-5" :style="{ background: statusColor[game.status[playerIndex]] }">
                                            <h5 style="color: white">{{ getTruncNickname20(getUser.nickname) }}</h5>
                                        </div>
                                    </div>
                                </div>
                                <!-- Баланс пользователя -->
                                <div class="row align-items-center" style="height: 25%">
                                    <div class="col-7 align-self-center justify-content-center align-items-center">
                                        <div class="textcenter" style="color: black">
                                            <h5 class="">{{ interfaceData.balance }}</h5>
                                        </div>
                                    </div>
                                    <div class="col-5 align-self-center justify-content-center align-items-center">
                                        <div class="d-flex justify-content-center align-items-center rounded-5 text-bg-info">{{textNumber(game.player_balance)}}</div>
                                    </div>
                                </div>
                                <!--   Слово пользователя-->        
                                <div v-if="!(game.stage === 0 || game.stage === 12)" class="row align-items-end" style="height: 45%">
                                    <div class="col-10 align-self-center">
                                        <div v-if="game.usersays[0] !== 0 && game.usersays[0] !== undefined && game.status[0] > 1" class="d-flex justify-content-center align-items-center rounded-3" style="background:Honeydew">
                                            <h5  style="color: black">{{ interfaceData.usersays[game.usersays[0]] }} {{ textValue(game.usersays_value[0]) }}</h5>
                                        </div>
                                    </div>
                                    <div v-if="game.current_hodor === 0" class="col-2 justify-content-center align-items-center" :title="interfaceData.hint_attacker">
                                        <div><h3 class="text-center align-middle" style="cursor: default;"><b>A</b></h3></div>
                                    </div>
                                </div>
                                <div v-if="(game.stage === 0 || game.stage === 12)" class="row align-items-end" style="height: 45%;">
                                    <div v-if="game.stage === 12 && game.winner === playerIndex" class="container-fluid rounded-4" style="background: ForestGreen; height: 90%;">
                                        <div class="row align-items-center justify-content-center" style="height: 10%;"><h5 class="text-center align-middle mt-2" style="color: aliceblue;"></h5></div>
                                        <div class="row align-items-center justify-content-center" style="height: 45%;"><h4 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_winner }}</b></h4></div>
                                        <div class="row align-items-center justify-content-center" style="height: 40%;"><h5 class="text-center align-middle" style="color: aliceblue;">{{ interfaceData.badge_pot }}<b>{{ textNumber(this.game.pot) }}</b></h5></div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <!--  2 колонка панели - карты пользователя-->
                        <div :id="'destination_' + playerIndex" class="col" style="display: grid; place-items: center; height:100%;">
                            <!-- Выбор настроек игры -->
                            <div v-if="game.stage === 0 || game.stage === 12" class="w-100" style="height: 100%">
                                <div class="container mt-3" style="height: 96%;">
                                    <div class="row" style="height: 25%;">
                                        <div class=col-9>
                                            <label for="maxplayers"><b>{{interfaceData.max_players}}</b></label>
                                        </div>
                                    <div class=col-3>
                                        <select class="form-select-sm w-100" v-model="game.max_players">
                                            <option selected value= 6 >6</option>
                                            <option value= 5 >5</option>
                                            <option value= 4 >4</option>
                                            <option value= 3 >3</option>
                                                <option value= 2 >2</option>
                                            </select>
                                        </div>    
                                    </div>
                                    <div class="row" style="height: 25%;">
                                        <div class=col-9>
                                            <span><b>{{ interfaceData.min_bet }}</b></span>
                                        </div>
                                        <div class=col-3>
                                            <input type="number" class="form-control-sm w-100" v-model="game.min_bet">
                                        </div>
                                    </div>
                                    <div class="row" style="height: 25%;">
                                        <div class=col-7>
                                            <label for="dropped"><b>{{ interfaceData.dropsuit }}</b></label>
                                        </div>
                                        <div class=col-5>
                                            <select class="form-select-sm w-100" v-model="game.drop_suit">
                                                <option selected value = 0 >{{interfaceData.array_dropsuit[0]}}</option>
                                                <option value = 1 >{{interfaceData.array_dropsuit[1]}} <span>&#9824;</span></option>
                                                <option value = 2 >{{interfaceData.array_dropsuit[2]}} <span>&#9827;</span></option>
                                                <option value = 3 >{{interfaceData.array_dropsuit[3]}} <span>&#9830;</span></option>
                                                <option value = 4 >{{interfaceData.array_dropsuit[4]}} <span>&#9829;</span></option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="row" style="height: 25%;">
                                        <div class=col-9>
                                            <span><b>{{ interfaceData.blindgame }}</b></span>
                                        </div>
                                        <div class=col-3>
                                            <div class="form-check d-flex justify-content-end">
                                                <input class="form-check-input" type="checkbox" value="" id="blindgame_checkbox" v-model="game.blind_game" style="border-color: green">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Карты пользователя -->
                            <div v-if="!(game.stage === 0 || game.stage === 12)" class="align-items-center justify-content-center" style="display: grid; place-items: center; height:100%;">
                                <div v-if="game.stage === 3 && game.card_players[playerIndex] !==0" class="row pt-1" style="height:100%; overflow: hidden;">
                                    <div v-for="card_shirt in game.card_players[playerIndex]" :key="card_shirt" class="col" style="padding: 0; margin:0; height:100%">
                                        <div class="col" style="padding: 0; margin:0; height: 100%;">
                                            <img :src="cardImagePath[0]" class="draggable-item">
                                        </div>
                                    </div>
                                </div>
                                <div v-if="game.stage === 4" class="row pt-1" style="height:100%; overflow: hidden;">
                                    <div v-for="item in myCards" :key="item.pos" class="col" style="padding: 0; margin:0; height:100%">
                                        <div class="col" v-if="(item.card !=0)" style="padding: 0; margin:0; height: 100%;">
                                            <img :src="item.image" :alt="item.name" class="draggable-item" :draggable="false" style="cursor: default;">
                                        </div>
                                    </div>
                                </div>
                                <div v-if="game.stage >= 5 && game.stage <= 9" class="row pt-1" style="height:100%; overflow: hidden;">
                                    <div v-for="item in myCards" :key="item.pos" class="col" style="padding: 0; margin:0; height:100%">
                                        <div class="col" v-if="(item.card !=0)" style="padding: 0; margin:0; height: 100%;">
                                            <img :src="item.image" :alt="item.name" class="draggable-item" :draggable="true" @dragend="cancelDrag" @dragstart="startDrag($event, item)" :style="item.opacity">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Бейджи в Ази / не в Ази / врезался / отказался -->
                            <div v-if="game.stage === 10 && game.status[0] === 7" class="col-10 d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: SlateBlue; height: 10vh;">
                                <div class="align-items-center justify-content-center"><h3 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_in }}</b></h3></div>
                            </div>
                            <div v-if="game.stage === 10 && game.status[0] === 8" class="col-10 d-flex justify-content-center col align-items-center rounded-4 mt-2" style="background: SlateGray; height: 10vh;">
                                <div class="row align-items-center justify-content-center"><h3 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_out }}</b></h3></div>
                            </div>
                            <div v-if="game.stage === 10 && game.status[0] === 9" class="col-10 d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: SlateBlue; height: 10vh;">
                                <div class="row align-items-center justify-content-center"><h3 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_burst }}</b></h3></div>
                            </div>
                            <div v-if="game.stage === 10 && game.status[0] === 10" class="col-10 d-flex justify-content-center align-items-center rounded-4 mt-2" style="background: #ffc107; height: 10vh;">
                                <div class="row align-items-center justify-content-center"><h3 class="text-center align-middle" style="color: aliceblue;"><b>{{ interfaceData.badge_azi_refuse }}</b></h3></div>
                            </div>

                        </div>
                        <!--  3 колонка панели - прогрессбар  и кнопки -->
                        <div class="col" style="margin:0; padding: 0; display: grid; place-items: center; height: 100%;">
                            <div v-if="game.stage === 0 || game.stage === 12" class="w-100" style="height: 100%">
                                <div class="container mt-1" style="height: 96%;">
                                    <div class="btn-group dropup flex-grow-1 w-100 m-1" style="height: 24%; display: grid; place-items: center;" >
                                        <button type="button" @click="startGame" :class="{ 'btn': true, 'btn-sm': screenHeight <= 900, 'btn-success': true, 'flex-grow-1': true, 'w-100': true }">{{ interfaceData.button_newgame }}</button>
                                    </div>
                                    <div class="btn-group dropup flex-grow-1 w-100 m-1" style="height: 24%; display: grid; place-items: center;" >
                                        <button type="button" @click="depositDemocoin" :class="{ 'btn': true, 'btn-sm': screenHeight <= 900, 'btn-warning': true, 'flex-grow-1': true, 'w-100': true }">{{ interfaceData.button_push_balance }}</button>
                                    </div>
                                    <div class="btn-group dropup flex-grow-1 w-100 m-1" style="height: 24%; display: grid; place-items: center;" >
                                        <button type="button" @click="leaveTable" :class="{ 'btn': true, 'btn-sm': screenHeight <= 900, 'btn-danger': true, 'flex-grow-1': true, 'w-100': true }">{{ interfaceData.button_gamerefuse }}</button>
                                    </div>
                                    <div class="btn-group dropup flex-grow-1 w-100 m-1" style="height: 24%; display: grid; place-items: center;" >
                                        <button type="button" @click="goToRules" :class="{ 'btn': true, 'btn-sm': screenHeight <= 900, 'btn-info': true, 'flex-grow-1': true, 'w-100': true }">{{ interfaceData.button_gotorules }}</button>
                                    </div>
                                </div>                                    
                            </div>

                            <div v-if="!(game.stage === 0 || game.stage === 12)" class="container-flex" style="height: 100%; width: 100%;">
                                <div class="row align-items-center justify-content-center" style="height: 10%;">
                                </div>
                                
                                <div class="row align-items-center justify-content-center" style="height: 80%;">
                                    <!-- Кнопки ставок втемную -->
                                    <div v-if="game.blind_game && game.stage === 2 && game.speaker === 0" class="container" style="height: 100%; width: 100%;">
                                        <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;">
                                            <button type="button" class="btn btn-primary dropdown-toggle flex-grow-1 m-1 w-100" data-bs-toggle="dropdown" aria-expanded="false">{{ interfaceData.button_blind }}</button>
                                                <ul class="dropdown-menu">
                                                    <li v-for="myBlindBet in [5, 4, 3, 2, 1]" :key="myBlindBet" @click="bettingBlind(myBlindBet)"><a class="dropdown-item" href="#">{{ interfaceData.blind_bet_button[0] }} {{ this.textNumber(this.game.min_bet * myBlindBet) }} ({{ interfaceData.blind_bet_button[1] }} {{ this.textNumber(this.game.min_bet * myBlindBet * 2) }})</a></li>
                                                </ul>
                                        </div>
                                        <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;" >
                                            <button type="button" @click="bettingBlindCheck" class="btn btn-secondary flex-grow-1 m-1 w-100">{{ interfaceData.button_blind_off }}</button>
                                        </div>                                            
                                    </div>

                                    <!--  Кнопки для ставок -->
                                    <div v-if="game.stage === 4 && game.status[playerIndex] === 2 && game.speaker === playerIndex" class="container" style="height: 100%; width: 100%;">
                                        <div class="row align-items-center, main" style="height: 50%; display: grid; place-items: center;" >
                                            <div style="height: 50%; display: flex; justify-content: center; align-items: center;">
                                                <div class="d-flex flex-wrap align-items-center justify-content-center w-100">
                                                    <div v-if="(game.players_bet.every(item => item === 0)) && (!game.top_bet)" class="btn-group dropup flex-grow-1">
                                                        <button type="button" class="btn btn-primary dropdown-toggle flex-grow-1 m-1" data-bs-toggle="dropdown" aria-expanded="false">{{ interfaceData.button_bet }}</button>
                                                        <ul class="dropdown-menu">
                                                            <li v-for="myBet in [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]" :key="myBet" @click="bettingBet(myBet)"><a class="dropdown-item" href="#">{{ this.textNumber(this.game.min_bet * myBet) }}</a></li>
                                                        </ul>
                                                    </div>
                                                    <div v-if="(!game.players_bet.every(item => item === 0)) && (!game.top_bet)" class="btn-group dropup flex-grow-1">
                                                        <button type="button" class="btn btn-primary dropdown-toggle flex-grow-1 m-1" data-bs-toggle="dropdown" aria-expanded="false">{{ interfaceData.button_raise }}</button>
                                                        <ul class="dropdown-menu">
                                                            <li v-for="myRaise in [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]" :key="myRaise" @click="bettingRaise(myRaise)"><a class="dropdown-item" href="#">{{ this.textNumber(this.game.min_bet * myRaise) }}</a></li>
                                                        </ul>
                                                    </div>
                                                    <div v-if="(Math.max(...game.players_bet) > game.players_bet[playerIndex])" class="btn-group dropup flex-grow-1">
                                                        <button type="button" @click="bettingCall" class="btn btn-dark flex-grow-1 m-1">{{ interfaceData.button_call }}: {{ textNumber(Math.max(...game.players_bet) - game.players_bet[playerIndex]) }}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>                                
                                        <!--  Кнопки для паса, поддержки и сбрасывания  -->
                                        <div class="row align-items-center, main" style="height: 50%; display: grid; place-items: center;" >
                                            <div style="height: 50%; display: flex; justify-content: center; align-items: center;">
                                                <div class="d-flex flex-wrap align-items-center justify-content-center w-100">
                                                    <button v-if="Math.max(...game.players_bet) === 0" type="button" @click="bettingCheck" class="btn btn-secondary flex-grow-1 m-1">{{ interfaceData.button_check }}</button>
                                                    <button type="button" @click="bettingFold" class="btn btn-warning flex-grow-1 m-1">{{ interfaceData.button_fold }}</button>
                                                </div>                                            
                                            </div>
                                        </div>                                            
                                    </div>
                                    <!--  Кнопки врезки в АЗИ и отказа от него  -->
                                    <div v-if="game.stage === 10 && (game.status[playerIndex] === 8 || game.status[playerIndex] === 11)" class="container" style="height: 100%; width: 100%;">
                                        <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;" >
                                            <button type="button" @click="bettingAziHalfPot" class="btn btn-dark flex-grow-1 m-1 w-100">{{ interfaceData.button_azi_in }} {{ textNumber(game.azi_price) }}</button>
                                        </div>
                                        <div class="btn-group dropup flex-grow-1 w-100" style="height: 50%; display: grid; place-items: center;" >
                                            <button type="button" @click="bettingAziDecline" class="btn btn-warning flex-grow-1 m-1 w-100">{{ interfaceData.button_azi_refuse }}</button>
                                        </div>
                                    </div>
                                    


                                    <div class="row align-items-center justify-content-center" style="height: 10%;">
                                    </div>

                                </div>        
                            </div>

                        </div>
                    </div>
                    <!-- /Нижний ряд - панель пользователя -->

                </div>
            </div>
            
            
            <!-- Правая панель с информацией -->
            <div class="col-3" style="height: 100%">
                <div class="rounded-3 mt-2 d-flex justify-content-center" style="background: Honeydew; border: solid 1px darkgreen; height: 98%">
                    <div class="container">
                        <div class="row my-1">
                            <div class="col-7 d-flex align-items-center">
                                <div class="my-1" style="width: 100%;">                                    
                                    <h5>{{ interfaceData.table }}</h5>
                                    <h6 v-if="game.stage !== 0 && game.stage !== 12">{{ interfaceData.game_on }}</h6>
                                    <h6 v-else>{{ interfaceData.game_off }}</h6>
                                </div>
                            </div>
                            <div class="col-5 d-flex justify-content-center align-items-center">
                                <div class="d-flex flex-grow-1" style="width: 100%;">
                                    <button @click="closeTable" class="btn btn-danger flex-grow-1 w-100" :title="interfaceData.hint_close_table">{{ interfaceData.button_close_table }}</button>                                    
                                </div>
                            </div>
                        </div>

                        <hr style="color: green">

                        <div class="row">                            
                            <div class="col-8">
                                <div class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.ante }}</h6> <h6 v-if="game.min_bet !== undefined" class="text-end"><b>{{ game.min_bet }}</b></h6> </div>
                                <div class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData. max_players }}</h6> <h6 v-if="game.max_players !== undefined" class="text-end"><b>{{ game.max_players }}</b></h6> </div>
                                <div v-if="game.blind_game" class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.blindgame }}</h6> <h6 class="text-end"><b>{{ interfaceData.blindgame_true }}</b></h6></div>
                                <div v-else class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.blindgame }}</h6> <h6 class="text-end"><b>{{ interfaceData.blindgame_false }}</b></h6></div>
                                
                                <div class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.cointype }}</h6> 
                                    <span class="badge text-bg-info" style="cursor:default">{{ interfaceData.cointype_demo }}</span>
                                </div>
                                    
                                <div class="d-flex justify-content-between align-items-center"> <h6>{{ interfaceData.dropsuit }}</h6> <h6 v-if="interfaceData.array_dropsuit[game.drop_suit] !== undefined" class="text-end"><b>{{ interfaceData.array_dropsuit[game.drop_suit] || ''}} </b></h6> </div>
                                                                
                            </div>
                            
                            <!-- Сброшенная масть -->

                            <div class="col-4 d-flex justify-content-center align-items-center">
                                <div v-if="game.drop_suit !== 0" style="width: 80%">
                                    
                                    <img :src="dropsuit[game.drop_suit-1]" style="width: 100%;" :draggable="false">
                                    
                                </div>
                            </div>

                        </div>

                        <hr style="color: green">                        

                        <!-- Никнеймы соперников  -->
                        <div class="container">
                            <div class="row">
                                
                                <div v-for="playerN in Array.from({ length: rivalsQuantity + 1 }, (_, index) => index)" :key="playerN" style="padding: 0; margin: 0;">
                                    <div v-if="game.speaker === playerN && game.players[playerN] !== -1" class="d-flex justify-content-between align-items-center rounded-3 mb-1" style="background: blue;">
                                        <b class="ms-2" style="color: aliceblue;">{{ getTruncNickname(game.bot_nicknames[playerN]) }}</b> 
                                        <b v-if="game.dealing == playerN" class="me-2 text-end" style="color: aliceblue;"> - {{ interfaceData.dealer }}</b>
                                    </div>
                                    <div v-if="game.speaker !== playerN && game.players[playerN] !== -1" class="d-flex justify-content-between align-items-center rounded-3 mb-1" style="background: darkgreen;">
                                        <b class="ms-2" style="color: aliceblue;">{{ getTruncNickname(game.bot_nicknames[playerN]) }}</b>
                                        <b v-if="game.dealing == playerN" class="me-2 text-end" style="color: aliceblue;"> - {{ interfaceData.dealer }}</b>
                                    </div>                                    
                                </div>
                                
                            </div>   
                        </div>
                        
                        <hr style="color: green">

                        <!-- Статус игры  -->
                        <div class="d-flex justify-content-center align-items-center rounded-3 my-1">
                            <div class="text-center">
                                <h5>
                                    <b v-if="game.stage !== 0"> {{ interfaceData.gamestages[game.stage] }} </b>
                                    <b v-else> {{ interfaceData.gamestages[0] }} </b>
                                </h5>
                            </div>
                        </div>

                        <hr style="color: green">
                        
                        <div v-if="game.speaker === playerIndex">
                            <div class="d-flex justify-content-center align-items-center rounded-3 my-1" style="background: RoyalBlue">
                                <div class="text-center">                                
                                    <h5 v-if="game.stage === 3 || game.stage === 4" class="ms-2 mt-1 align-self-center text-white" style="color: aliceblue;"><b class="">{{ interfaceData.your_word }}</b></h5>
                                    <h5 v-if="game.stage >= 6 && game.stage <= 8" class="ms-2 mt-1 align-self-center text-white" style="color: aliceblue;"><b class="">{{ interfaceData.your_turn }}</b></h5>
                                </div>
                            </div>
                        </div>
                        <div v-if="game.stage === 0 || game.stage === 12">
                            <div class="d-flex justify-content-center align-items-center rounded-3 my-1">                                
                                <button @click="changeRivals" class="btn btn-dark flex-grow-1 w-100">{{ interfaceData.button_change_rivals }}</button>                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- / Правая панель с информацией -->
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
    cursor: default;
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
    pointer-events: visibleStroke; /* Уберите прозрачность и разрешите взаимодействие с элементом */
    user-select: none; /* Запретите выделение текста внутри элемента */    
}

.opaque {
    opacity: 1 !important; /* Устанавливаем непрозрачность */
}

</style>