<script>
import axios from 'axios';
import { serverUrl } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';

export default {
    name: 'CreateTable',  

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
            interfaceData: {},
            globalInterfaceData: [],
            userData: {
                is_auth: false,
                is_auth_web3: false,
                django_name: '',
                user_id: 0,
                nickname: '',
                wallet: '',
                active_table: 0
            },
            createTable: {
                user_id: 0,
                max_players: 6,
                min_bet: 1,
                drop_suit: 0,
                cointype: 0,
                blind_game: true,
                interval: 20,
                password: ''
            },
            max_players: 6,
            min_bet: 1,
            drop_suit: 0,
            cointype: 0,
            blind_game: 1,
            interval: 20,
            password: '',
            suits: ['','','','',''],
            cointypes: ['','',''],
            blindgames: ['','',''] 
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
        this.$socket.on('new_game_created', (data) => {
            this.newGameCreated(data);
        });
    },



    methods: {
        ...mapActions(['setGlobalModalErrorOn', 'setGlobalError', 'setActiveTable']),

        async getInterface() {      
            try {        
                const response = await axios.get(`${serverUrl}/api/get_createtable_interface`);        
                try {
                    this.globalInterfaceData = response.data;
                    if (response.data[this.getCurrentLanguage-1]['label']) {
                        this.interfaceData = response.data[this.getCurrentLanguage-1]['form'];
                        this.suits = this.interfaceData.suits;
                        this.cointypes = this.interfaceData.cointypes;
                        this.blindgames = this.interfaceData.blindgames; 
                    } 
                } catch {
                    this.interfaceData = response.data[0]['form'];
                    this.suits = this.interfaceData.suits;
                    this.cointypes = this.interfaceData.cointypes;
                    this.blindgames = this.interfaceData.blindgames; 
                }        
            } catch (error) {
                console.error('TABLES HALL GET INTERFACE error :', error);
            }
        },

        async update(newLanguage) {
        try {
            if (this.globalInterfaceData[newLanguage-1]['label']) {
                this.interfaceData = this.globalInterfaceData[newLanguage-1]['form'];
                this.suits = this.interfaceData.suits;
                this.cointypes = this.interfaceData.cointypes;
                this.blindgames = this.interfaceData.blindgames; 
            } 
            } catch {
                this.interfaceData = this.globalInterfaceData[0]['form'];
                this.suits = this.interfaceData.suits;
                this.cointypes = this.interfaceData.cointypes;
                this.blindgames = this.interfaceData.blindgames; 
            }
        },

        goToAccessDenied() {
            this.$router.push('/access_denied');
        },

        createNewTable() {
            this.createTable.user_id = this.userData.user_id;
            this.createTable.max_players = Number(this.max_players);
            this.createTable.min_bet = Number(this.min_bet);
            this.createTable.drop_suit = Number(this.drop_suit);
            this.createTable.cointype = Number(this.cointype);
            if (Number(this.blind_game) !== 0) {
                this.createTable.blind_game = true
            } else {
                this.createTable.blind_game = false
            }            
            this.createTable.interval = Number(this.interval);
            this.createTable.password = this.password;
            if (!(this.createTable.min_bet > 0 && Number.isInteger(this.createTable.min_bet))) {
                this.setGlobalError(725);
                this.setGlobalModalErrorOn();
            } else if (!(this.createTable.interval >= 10 && this.createTable.interval <= 60 && Number.isInteger(this.createTable.interval))) {
                this.setGlobalError(902);
                this.setGlobalModalErrorOn();
            } else {
                this.$socket.emit('create_new_table', { user_id: this.userData.user_id, new_table: this.createTable });
            }        
        },

        newGameCreated(data) {            
            console.log('NEW GAME CREATED', data);
            const createdTable = data.table_created
            if (createdTable['status']) {                
                this.$router.push(`/table/${createdTable['table_id']}`);
            } else {
                this.setGlobalError(createdTable['error']);
                this.setGlobalModalErrorOn();
            }
            
        }
    },

}

</script>

<template>
    <div class="mainbox">        
        <div class="container my-5">
            {{ userData }}
                <div class="bg-body-tertiary p-5 rounded">
                    <h2>{{ interfaceData.title }}</h2>
                    <hr>
                    
                    <form @submit.prevent="createNewTable" style="cursor: default;">
                        
                        <div class="container">                            
                            <div class="row">

                                <div class="col-3" :title="interfaceData.hint_max_players">
                                    <label for="maxplayers">{{interfaceData.max_players}}</label>
                                    <select class="form-select" v-model="max_players">
                                        <option selected value= 6 >6</option>                                        
                                        <option value= 5 >5</option>
                                        <option value= 4 >4</option>
                                        <option value= 3 >3</option>
                                        <option value= 2 >2</option>
                                    </select>
                                </div>
                            
                                <div class="col-3" :title="interfaceData.hint_drop_suit">
                                    <label for="dropped">{{ interfaceData.drop_suit }}</label>
                                    <select class="form-select" v-model="drop_suit">
                                        <option selected value = 0 >{{suits[0]}}</option>                                        
                                        <option value = 1 >{{suits[1]}} <span>&#9824;</span></option>
                                        <option value = 2 >{{suits[2]}} <span>&#9827;</span></option>
                                        <option value = 3 >{{suits[3]}} <span>&#9830;</span></option>
                                        <option value = 4 >{{suits[4]}} <span>&#9829;</span></option>
                                    </select>
                                </div>

                                <div class="col-3" :title="interfaceData.hint_cointype">
                                    <label for="cointype">{{ interfaceData.cointype }}</label>
                                    <select class="form-select" v-model="cointype">
                                        <option selected value = 0 > {{ cointypes[0] }} </option>
                                        <option value = 1 >{{ cointypes[1] }}</option>
                                        <option value = 2 >{{ cointypes[2] }}</option>
                                    </select>
                                </div>

                                <div class="col-3" :title="interfaceData.hint_blind">
                                    <label for="blind">{{ interfaceData.blind }}</label>
                                    <select class="form-select" aria-label="Default select example" v-model="blind_game">
                                        <option selected value = 1>{{ blindgames[0] }}</option>
                                        <option value = 0>{{ blindgames[1] }}</option>
                                    </select>
                                </div>
                                
                            </div>
                        
                            <hr>
                            <div class="row">
                                
                                <div class="col-4">
                                    <div class="input-group mb-3" :title="interfaceData.hint_min_bet">
                                        <span class="input-group-text">{{ interfaceData.min_bet }}</span>
                                        <input type="number" class="form-control" v-model="min_bet">
                                    </div>
                                    <input type="range" class="form-range" min="1" max="1000" id="customRange2" v-model="min_bet">
                                    <span :title="interfaceData.hint_max_bet">{{ interfaceData.max_bet }} {{ min_bet*10 }}</span>
                                </div>
                                
                                <div class="col-4" :title="interfaceData.hint_interval">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text">{{ interfaceData.interval }}</span>                                        
                                        <input type="number" class="form-control" v-model="interval">
                                    </div>
                                    <input type="range" class="form-range" min="10" max="60" id="customRange2" v-model="interval">
                                    {{ interfaceData.interval_under }}
                                </div>
                                
                                <div class="col-4" :title="interfaceData.hint_password">
                                    <div class="form-floating">
                                        <input type="text" class="form-control" id="floatingPassword" placeholder="Not required" v-model="password">
                                        <label for="floatingPassword">{{ interfaceData.password }}</label>                                        
                                    </div>
                                </div>
                                
                            </div>                            
                        </div>
                        <hr>
                        
                        <button type="submit" class="btn btn-success">{{ interfaceData.button_create }}</button>
                    </form>
                
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
}

</style>