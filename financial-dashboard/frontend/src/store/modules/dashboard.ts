import { Module } from 'vuex'
import { apiService } from '@/services/api'

interface DashboardState {
  monthlyIncome: number
  monthlyExpenses: number
  monthlyChange: number
  balanceChange: number
  incomeChange: number
  expensesChange: number
  goalsChange: number
  isLoading: boolean
}

const dashboard: Module<DashboardState, any> = {
  namespaced: true,
  
  state: {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyChange: 0,
    balanceChange: 0,
    incomeChange: 0,
    expensesChange: 0,
    goalsChange: 0,
    isLoading: false
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_DASHBOARD_DATA(state, data: any) {
      Object.assign(state, data)
    }
  },
  
  actions: {
    async fetchDashboardData({ commit }) {
      commit('SET_LOADING', true)
      try {
        const data = await apiService.get('/dashboard/summary')
        commit('SET_DASHBOARD_DATA', data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchBalanceHistory({ commit }, period: string) {
      const data = await apiService.get(`/dashboard/balance-history?period=${period}`)
      return data
    },
    
    async fetchExpensesByCategory({ commit }, period: string) {
      const data = await apiService.get(`/dashboard/expenses-by-category?period=${period}`)
      return data
    }
  }
}

export default dashboard