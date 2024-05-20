import Vuex from 'vuex';

export default new Vuex.Store({
  state: {
    currentLanguage: parseInt(localStorage.getItem('currentLanguage')) || 1,
    authUser: false,    
    authByWeb3: false,
    globalModalError: false,
    globalErrorNumber: 0,
    globalErrorCustomText: '',
    currentActiveTable: parseInt(localStorage.getItem('currentActiveTable')) || 0,
    user: {
      id: 0,
      nickname: '',
      django_name: '',
      wallet: '',
      active_table: 0
    },
    airdropCoins: [0, 0, 0],
    referalCoins: [0, 0, 0]
  },
  mutations: {
    setCurrentLanguage(state, newLanguage) {
      state.currentLanguage = newLanguage;
    },
    setStatusLoggedIn(state) {
      state.authUser = true;
    },
    setStatusLoggedOut(state) {
      state.authUser = false;
    },
    setStatusWeb3In(state) {
      state.authByWeb3 = true;
    },
    setStatusWeb3Out(state) {
      state.authByWeb3 = false;
    },    
    setGlobalModalErrorFalse(state) {
      state.globalModalError = false;      
    },
    setGlobalModalErrorTrue(state) {
      state.globalModalError = true;      
    },
    setGlobalErrorNumber(state, newNumber) {
      state.globalErrorNumber = newNumber;
    },
    setUser(state, user) {
      state.user = user;
    },
    setActiveTable(state, newActiveTable) {
      state.currentActiveTable = newActiveTable;
    },
    setGlobalErrorCustomText(state, newCustomText) {
      state.globalErrorCustomText = newCustomText;
    },
    setAirdropCoins(state, newValue) {
      state.airdropCoins = newValue
    },
    setReferalCoins(state, newValue) {
      state.referalCoins = newValue
    }
  },
  actions: {
    changeLanguage({ commit }, newLanguage) {              
      localStorage.setItem('currentLanguage', newLanguage);
      commit('setCurrentLanguage', newLanguage);
    },
    setGlobalError({ commit }, newNumber) {
      // console.log('VUEX: SET GLOBAL ERROR NEW NUMBER - ', newNumber)
      commit('setGlobalErrorNumber', newNumber);
    },
    changeStatusLoggedIn({ commit }) {
      localStorage.setItem('authUser', true);      
      commit('setStatusLoggedIn');
    },
    changeStatusLoggedOut({ commit }) {
      localStorage.setItem('authUser', false);      
      localStorage.setItem('authToken', '');
      commit('setStatusLoggedOut');
    },
    changeStatusWeb3In({ commit }) {
      localStorage.setItem('authUserWeb3', true);
      commit('setStatusWeb3In');
    },
    changeStatusWeb3Out({ commit }) {
      localStorage.setItem('authUserWeb3', false);
      commit('setStatusWeb3Out');
    },
    setGlobalModalErrorOn({ commit }) {
      //console.log('VUEX: setGlobalModalErrorOn')
      commit('setGlobalModalErrorTrue');
    },
    setGlobalModalErrorOff({ commit }) {
      //console.log('VUEX: setGlobalModalErrorOff')
      commit('setGlobalModalErrorFalse');
    },
    setUser({ commit }, user) {
      commit('setUser', user);
    },
    setActiveTable({ commit }, newActiveTable) {
      localStorage.setItem('currentActiveTable', newActiveTable);
      commit('setActiveTable', newActiveTable)    
    },
    setGlobalErrorCustomText({ commit }, newCustomText) {
      localStorage.setItem('globalErrorCustomText', newCustomText);
      commit('setGlobalErrorCustomText', newCustomText);      
    },
    setAirdropCoins({ commit }, newValue) {
      commit('setAirdropCoins', newValue);      
    },
    setReferalCoins({ commit }, newValue) {
      commit('setReferalCoins', newValue);      
    }
  },
  getters: {
    getCurrentLanguage: (state) => state.currentLanguage,
    isAuth: (state) => state.authUser,    
    isAuthWeb3: (state) => state.authByWeb3,
    globalModalError: (state) => state.globalModalError,
    globalErrorNumber: (state) => state.globalErrorNumber,
    getUser: (state) => state.user,
    getActiveTable: (state) => state.currentActiveTable,
    getGlobalErrorCustomText: (state) => state.globalErrorCustomText,
    getAirdropCoins: (state) => state.airdropCoins,
    getReferalCoins: (state) => state.referalCoins,
  },
});

