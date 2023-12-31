import Vuex from 'vuex';

export default new Vuex.Store({
  state: {
    currentLanguage: parseInt(localStorage.getItem('currentLanguage')) || 1,
  },
  mutations: {
    setCurrentLanguage(state, newLanguage) {
      state.currentLanguage = newLanguage;
    },
  },
  actions: {
    changeLanguage({ commit }, newLanguage) {              
      localStorage.setItem('currentLanguage', newLanguage);
      commit('setCurrentLanguage', newLanguage);
    },
  },
  getters: {
    getCurrentLanguage: (state) => state.currentLanguage,
  },
});

