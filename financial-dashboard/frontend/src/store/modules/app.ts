import { Module } from 'vuex'

interface AppState {
  isLoading: boolean
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: any[]
}

const app: Module<AppState, any> = {
  namespaced: true,
  
  state: {
    isLoading: true,
    sidebarOpen: true,
    theme: 'light',
    notifications: []
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    TOGGLE_SIDEBAR(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    SET_THEME(state, theme: 'light' | 'dark') {
      state.theme = theme
    },
    ADD_NOTIFICATION(state, notification: any) {
      state.notifications.push(notification)
    },
    REMOVE_NOTIFICATION(state, id: string) {
      state.notifications = state.notifications.filter(n => n.id !== id)
    }
  },
  
  actions: {
    async initialize({ commit, dispatch }) {
      commit('SET_LOADING', true)
      try {
        await dispatch('auth/fetchUser', null, { root: true })
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    showNotification({ commit }, notification: any) {
      const id = Date.now().toString()
      commit('ADD_NOTIFICATION', { ...notification, id })
      
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', id)
      }, 5000)
    }
  }
}

export default app