import { Module } from 'vuex'
import { Investment } from '@/types'
import { apiService } from '@/services/api'

interface InvestmentsState {
  investments: Investment[]
  totalValue: number
  totalGainLoss: number
  isLoading: boolean
}

const investments: Module<InvestmentsState, any> = {
  namespaced: true,
  
  state: {
    investments: [],
    totalValue: 0,
    totalGainLoss: 0,
    isLoading: false
  },
  
  getters: {
    portfolioValue: (state) => state.investments.reduce((sum, inv) => sum + inv.marketValue, 0),
    topPerformers: (state) => [...state.investments]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5),
    worstPerformers: (state) => [...state.investments]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5)
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_INVESTMENTS(state, investments: Investment[]) {
      state.investments = investments
      state.totalValue = investments.reduce((sum, inv) => sum + inv.marketValue, 0)
      state.totalGainLoss = investments.reduce((sum, inv) => sum + inv.change, 0)
    },
    ADD_INVESTMENT(state, investment: Investment) {
      state.investments.push(investment)
    },
    UPDATE_INVESTMENT(state, updatedInvestment: Investment) {
      const index = state.investments.findIndex(inv => inv.id === updatedInvestment.id)
      if (index !== -1) {
        state.investments.splice(index, 1, updatedInvestment)
      }
    },
    DELETE_INVESTMENT(state, investmentId: string) {
      state.investments = state.investments.filter(inv => inv.id !== investmentId)
    }
  },
  
  actions: {
    async fetchInvestments({ commit }) {
      commit('SET_LOADING', true)
      try {
        const investments = await apiService.get<Investment[]>('/investments')
        commit('SET_INVESTMENTS', investments)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async addInvestment({ commit }, investmentData: Partial<Investment>) {
      const investment = await apiService.post<Investment>('/investments', investmentData)
      commit('ADD_INVESTMENT', investment)
      return investment
    },
    
    async updateInvestment({ commit }, { id, data }: { id: string; data: Partial<Investment> }) {
      const investment = await apiService.patch<Investment>(`/investments/${id}`, data)
      commit('UPDATE_INVESTMENT', investment)
      return investment
    },
    
    async deleteInvestment({ commit }, investmentId: string) {
      await apiService.delete(`/investments/${investmentId}`)
      commit('DELETE_INVESTMENT', investmentId)
    },
    
    async syncPrices({ dispatch }) {
      await apiService.post('/investments/sync-prices')
      await dispatch('fetchInvestments')
    }
  }
}

export default investments