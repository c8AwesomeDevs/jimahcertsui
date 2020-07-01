import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import config from '../mixins/config.js'

const backend_rest_api = config.data().BACKEND_REST_API

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user')) || {},
    pi: localStorage.getItem('pi') || '',
    da: localStorage.getItem('da') || '',
    dataServers: JSON.parse(localStorage.getItem("names")) || [],
  },
  getters : {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    token: state => state.token,
    user: state => state.user,
    pi: state => state.pi,
    da: state => state.da, 
    dataServers: state => state.dataServers, 
  },
  mutations: {
    auth_request(state){
      state.status = 'loading'
    },
    auth_success(state, params){
      state.status = 'success'
      state.token = params.token
      //state.user = params.user
      localStorage.setItem('user', JSON.stringify(params.user))
    },
    auth_error(state){
      state.status = 'error'
    },
    logout(state){
      state.status = ''
      state.token = ''
    },
  },
  actions: {
    login({commit}, user){
        return new Promise((resolve, reject) => {
          commit('auth_request')
          axios({url: `${backend_rest_api}/token/`, data: user, method: 'POST' })
          .then(resp => {
            const token = resp.data.access
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = token
            commit('auth_success', {token:token,user:user})
            resolve(resp)
          })
          .catch(err => {
            commit('auth_error')
            localStorage.removeItem('token')
            reject(err)
          })
        })
    },
    logout({commit}){
      return new Promise((resolve, reject) => {
        commit('logout')
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        resolve()
      })
    },
    choosePI({commit},pi){
      localStorage.setItem('pi', pi)
    },
    chooseDA({commit},da){
      localStorage.setItem('da', da)
    },
    getDataServers({commit},dataServers){
      localStorage.setItem("names", JSON.stringify(dataServers))
    },
  },
})

