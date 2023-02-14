import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: sessionStorage.getItem('token') || '',
    user: {
      _id: sessionStorage.getItem('_id') || '',
      user_name: sessionStorage.getItem('user_name') || ''
    }
  },
  mutations: {
    LOGIN: (state, data) => {
      state.token = data.token
      sessionStorage.setItem('token', data.token)
    },
    LOGOUT: (state) => {
      state.token = null
      sessionStorage.removeItem('token')
    },
    USERINFO: (state, data) => {
      state.user.user_name = data.user_name
      state.user._id = data._id
      sessionStorage.setItem('_id', data._id)
      sessionStorage.setItem('user_name', data.user_name)
    }
  },
  actions: {
    UserLogin ({ commit }, data) {
      commit('LOGIN', data)
    },
    UserLogout ({ commit }) {
      commit('LOGOUT')
    },
    UserInfo ({ commit }, data) {
      commit('USERINFO', data)
    }
  }
})
