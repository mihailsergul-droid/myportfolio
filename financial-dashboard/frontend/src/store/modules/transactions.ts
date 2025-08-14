import { Module } from 'vuex'
import { Transaction, PaginatedResponse, FilterOptions } from '@/types'
import { apiService } from '@/services/api'

interface TransactionsState {
  transactions: Transaction[]
  recentTransactions: Transaction[]
  currentPage: number
  totalPages: number
  totalCount: number
  isLoading: boolean
  filters: FilterOptions
}

const transactions: Module<TransactionsState, any> = {
  namespaced: true,
  
  state: {
    transactions: [],
    recentTransactions: [],
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    isLoading: false,
    filters: {}
  },
  
  getters: {
    expenseTransactions: (state) => state.transactions.filter(t => t.type === 'expense'),
    incomeTransactions: (state) => state.transactions.filter(t => t.type === 'income'),
    transactionsByCategory: (state) => (category: string) => 
      state.transactions.filter(t => t.category === category)
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_TRANSACTIONS(state, data: PaginatedResponse<Transaction>) {
      state.transactions = data.data
      state.currentPage = data.page
      state.totalPages = data.totalPages
      state.totalCount = data.total
    },
    SET_RECENT_TRANSACTIONS(state, transactions: Transaction[]) {
      state.recentTransactions = transactions
    },
    ADD_TRANSACTION(state, transaction: Transaction) {
      state.transactions.unshift(transaction)
      state.recentTransactions.unshift(transaction)
      if (state.recentTransactions.length > 10) {
        state.recentTransactions.pop()
      }
    },
    UPDATE_TRANSACTION(state, updatedTransaction: Transaction) {
      const index = state.transactions.findIndex(t => t.id === updatedTransaction.id)
      if (index !== -1) {
        state.transactions.splice(index, 1, updatedTransaction)
      }
      
      const recentIndex = state.recentTransactions.findIndex(t => t.id === updatedTransaction.id)
      if (recentIndex !== -1) {
        state.recentTransactions.splice(recentIndex, 1, updatedTransaction)
      }
    },
    DELETE_TRANSACTION(state, transactionId: string) {
      state.transactions = state.transactions.filter(t => t.id !== transactionId)
      state.recentTransactions = state.recentTransactions.filter(t => t.id !== transactionId)
    },
    SET_FILTERS(state, filters: FilterOptions) {
      state.filters = filters
    }
  },
  
  actions: {
    async fetchTransactions({ commit, state }, { page = 1, limit = 20 } = {}) {
      commit('SET_LOADING', true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...Object.entries(state.filters).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              if (typeof value === 'object') {
                acc[key] = JSON.stringify(value)
              } else {
                acc[key] = value.toString()
              }
            }
            return acc
          }, {} as Record<string, string>)
        })
        
        const data = await apiService.get<PaginatedResponse<Transaction>>(`/transactions?${params}`)
        commit('SET_TRANSACTIONS', data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchRecentTransactions({ commit }, limit = 10) {
      const data = await apiService.get<Transaction[]>(`/transactions/recent?limit=${limit}`)
      commit('SET_RECENT_TRANSACTIONS', data)
    },
    
    async createTransaction({ commit }, transactionData: Partial<Transaction>) {
      const transaction = await apiService.post<Transaction>('/transactions', transactionData)
      commit('ADD_TRANSACTION', transaction)
      return transaction
    },
    
    async updateTransaction({ commit }, { id, data }: { id: string; data: Partial<Transaction> }) {
      const transaction = await apiService.patch<Transaction>(`/transactions/${id}`, data)
      commit('UPDATE_TRANSACTION', transaction)
      return transaction
    },
    
    async deleteTransaction({ commit }, transactionId: string) {
      await apiService.delete(`/transactions/${transactionId}`)
      commit('DELETE_TRANSACTION', transactionId)
    },
    
    async importTransactions({ dispatch }, file: File) {
      const formData = new FormData()
      formData.append('file', file)
      
      await apiService.post('/transactions/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Refresh transactions after import
      await dispatch('fetchTransactions')
    },
    
    setFilters({ commit, dispatch }, filters: FilterOptions) {
      commit('SET_FILTERS', filters)
      dispatch('fetchTransactions', { page: 1 })
    }
  }
}

export default transactions