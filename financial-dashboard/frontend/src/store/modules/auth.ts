import { Module } from 'vuex'
import { User } from '@/types'
import { authService } from '@/services/auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

const auth: Module<AuthState, any> = {
  namespaced: true,
  
  state: {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false
  },
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_USER(state, user: User) {
      state.user = user
    },
    SET_TOKEN(state, token: string) {
      state.token = token
      localStorage.setItem('token', token)
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    }
  },
  
  actions: {
    async login({ commit }, credentials: { email: string; password: string }) {
      commit('SET_LOADING', true)
      try {
        const response = await authService.login(credentials)
        commit('SET_TOKEN', response.token)
        commit('SET_USER', response.user)
        return response
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async logout({ commit }) {
      try {
        await authService.logout()
      } finally {
        commit('CLEAR_AUTH')
      }
    },
    
    async fetchUser({ commit, state }) {
      if (!state.token) return
      
      try {
        const user = await authService.getCurrentUser()
        commit('SET_USER', user)
      } catch (error) {
        commit('CLEAR_AUTH')
        throw error
      }
    }
  }
}

export default auth