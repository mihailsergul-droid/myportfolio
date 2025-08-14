import { Module } from 'vuex'
import { Budget } from '@/types'
import { apiService } from '@/services/api'

interface BudgetsState {
  budgets: Budget[]
  isLoading: boolean
}

const budgets: Module<BudgetsState, any> = {
  namespaced: true,
  
  state: {
    budgets: [],
    isLoading: false
  },
  
  getters: {
    activeBudgets: (state) => state.budgets.filter(budget => {
      const now = new Date()
      const endDate = new Date(budget.endDate)
      return endDate >= now
    }),
    budgetsByCategory: (state) => (category: string) => 
      state.budgets.filter(budget => budget.category === category),
    overBudgets: (state) => state.budgets.filter(budget => budget.spent > budget.amount)
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_BUDGETS(state, budgets: Budget[]) {
      state.budgets = budgets
    },
    ADD_BUDGET(state, budget: Budget) {
      state.budgets.push(budget)
    },
    UPDATE_BUDGET(state, updatedBudget: Budget) {
      const index = state.budgets.findIndex(b => b.id === updatedBudget.id)
      if (index !== -1) {
        state.budgets.splice(index, 1, updatedBudget)
      }
    },
    DELETE_BUDGET(state, budgetId: string) {
      state.budgets = state.budgets.filter(b => b.id !== budgetId)
    }
  },
  
  actions: {
    async fetchBudgets({ commit }) {
      commit('SET_LOADING', true)
      try {
        const budgets = await apiService.get<Budget[]>('/budgets')
        commit('SET_BUDGETS', budgets)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createBudget({ commit }, budgetData: Partial<Budget>) {
      const budget = await apiService.post<Budget>('/budgets', budgetData)
      commit('ADD_BUDGET', budget)
      return budget
    },
    
    async updateBudget({ commit }, { id, data }: { id: string; data: Partial<Budget> }) {
      const budget = await apiService.patch<Budget>(`/budgets/${id}`, data)
      commit('UPDATE_BUDGET', budget)
      return budget
    },
    
    async deleteBudget({ commit }, budgetId: string) {
      await apiService.delete(`/budgets/${budgetId}`)
      commit('DELETE_BUDGET', budgetId)
    }
  }
}

export default budgets