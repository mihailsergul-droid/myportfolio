import { Module } from 'vuex'
import { Alert } from '@/types'
import { apiService } from '@/services/api'

interface AlertsState {
  alerts: Alert[]
  unreadCount: number
  isLoading: boolean
}

const alerts: Module<AlertsState, any> = {
  namespaced: true,
  
  state: {
    alerts: [],
    unreadCount: 0,
    isLoading: false
  },
  
  getters: {
    unreadAlerts: (state) => state.alerts.filter(alert => !alert.read),
    alertsByType: (state) => (type: string) => state.alerts.filter(alert => alert.type === type),
    criticalAlerts: (state) => state.alerts.filter(alert => alert.severity === 'error')
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_ALERTS(state, alerts: Alert[]) {
      state.alerts = alerts
      state.unreadCount = alerts.filter(alert => !alert.read).length
    },
    ADD_ALERT(state, alert: Alert) {
      state.alerts.unshift(alert)
      if (!alert.read) {
        state.unreadCount++
      }
    },
    MARK_AS_READ(state, alertId: string) {
      const alert = state.alerts.find(a => a.id === alertId)
      if (alert && !alert.read) {
        alert.read = true
        state.unreadCount--
      }
    },
    MARK_ALL_AS_READ(state) {
      state.alerts.forEach(alert => {
        alert.read = true
      })
      state.unreadCount = 0
    },
    DELETE_ALERT(state, alertId: string) {
      const index = state.alerts.findIndex(a => a.id === alertId)
      if (index !== -1) {
        const alert = state.alerts[index]
        if (!alert.read) {
          state.unreadCount--
        }
        state.alerts.splice(index, 1)
      }
    }
  },
  
  actions: {
    async fetchAlerts({ commit }) {
      commit('SET_LOADING', true)
      try {
        const alerts = await apiService.get<Alert[]>('/alerts')
        commit('SET_ALERTS', alerts)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async markAsRead({ commit }, alertId: string) {
      await apiService.patch(`/alerts/${alertId}/read`)
      commit('MARK_AS_READ', alertId)
    },
    
    async markAllAsRead({ commit }) {
      await apiService.patch('/alerts/read-all')
      commit('MARK_ALL_AS_READ')
    },
    
    async deleteAlert({ commit }, alertId: string) {
      await apiService.delete(`/alerts/${alertId}`)
      commit('DELETE_ALERT', alertId)
    },
    
    async createAlert({ commit }, alertData: Partial<Alert>) {
      const alert = await apiService.post<Alert>('/alerts', alertData)
      commit('ADD_ALERT', alert)
      return alert
    }
  }
}

export default alerts