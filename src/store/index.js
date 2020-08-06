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
    userGroups: JSON.parse(localStorage.getItem("userGroups")) || [],
    pi: localStorage.getItem('pi') || '',
    da: localStorage.getItem('da') || '',
    dataServers: JSON.parse(localStorage.getItem("names")) || [],
    hostname: location.hostname,
    groups: ["public","certificate_uploader","data_validator"],
    pingStatus: localStorage.getItem('pingStatus') || 'offline',
  },
  getters : {
    isLoggedIn: state => !!state.token,
    isAuthenticated: state => !!state.token,
    authStatus: state => state.status,
    token: state => state.token,
    user: state => state.user,
    userGroups: state => state.userGroups,
    pi: state => state.pi,
    da: state => state.da, 
    dataServers: state => state.dataServers, 
    hostname: state => state.hostname,
    isClientOnline: state => (state.pingStatus == 'online'),
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
      state.userGroups = []
    },
    saveUserGroups(state,params){
      localStorage.setItem("userGroups", JSON.stringify(params))
      Vue.set(state, 'userGroups', params )
    },
    resetUserGroups(state){
      localStorage.removeItem('userGroups')
    },
    savePI(state,params){
      Vue.set(state, 'pi', params )
    },
    saveDA(state,params){
      Vue.set(state, 'da', params )
    },
    saveDataServers(state,params){
      Vue.set(state, 'dataServers', params )
    },
    savePingStatus(state,params){
      Vue.set(state, 'pingStatus', params )
      //localStorage.setItem("pingStatus", params)
    },
  },
  actions: {
    pingServer({commit}, token){
        return new Promise((resolve, reject) => {
          axios({url: `${backend_rest_api}/home`, 
              method: 'GET' ,
              headers: {
                "Authorization": `Bearer ${token}`                
              }
          })
          .then(resp => {
            console.log("Pinged")
            commit('savePingStatus','online')
          })
          .catch(err => {
            commit('savePingStatus','offline')
          })
        })
    },
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
    getUserGroups({commit}, token){
        return new Promise((resolve, reject) => {
          axios({url: `${backend_rest_api}/get_user_groups`, 
              method: 'GET' ,
              headers: {
                "Authorization": `Bearer ${token}`                
              }
          })
          .then(resp => {
            const userGroups = resp.data
            commit('saveUserGroups',userGroups)
            resolve(resp)
          })
          .catch(err => {
            commit('resetUserGroups')
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
      commit('savePI',pi)
    },
    chooseDA({commit},da){
      localStorage.setItem('da', da)
      commit('saveDA',da)
    },
    getDataServers({commit},dataServers){
      localStorage.setItem("names", JSON.stringify(dataServers))
      commit('saveDataServers',dataServers)      
    },
  },
})

