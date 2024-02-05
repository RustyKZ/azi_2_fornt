import Vuex from 'vuex';

export default new Vuex.Store({
  state: {
    currentLanguage: parseInt(localStorage.getItem('currentLanguage')) || 1,
    authByEmail: false,
    authByWeb3: false,
  },
  mutations: {
    setCurrentLanguage(state, newLanguage) {
      state.currentLanguage = newLanguage;
    },
    setStatusLoggedIn(state) {
      state.authByEmail = true;
    },
    setStatusLoggedOut(state) {
      state.authByEmail = false;
    }

  },
  actions: {
    changeLanguage({ commit }, newLanguage) {              
      localStorage.setItem('currentLanguage', newLanguage);
      commit('setCurrentLanguage', newLanguage);
    },
    changeStatusLoggedIn({ commit }) {
      localStorage.setItem('authByEmail', true);
      commit('setStatusLoggedIn');
    },
    changeStatusLoggedOut({ commit }) {
      localStorage.setItem('authByEmail', false);
      commit('setStatusLoggedOut');
    },
  },
  getters: {
    getCurrentLanguage: (state) => state.currentLanguage,
    isAuthEmail: (state) => state.authByEmail,
    isAuthWeb3: (state) => state.authByWeb3,
  },
});

