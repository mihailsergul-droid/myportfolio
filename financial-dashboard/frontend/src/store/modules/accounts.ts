import { Module } from 'vuex'
import { Account } from '@/types'
import { accountService } from '@/services/accounts'

interface AccountsState {
  accounts: Account[]
  selectedAccount: Account | null
  isLoading: boolean
}

const accounts: Module<AccountsState, any> = {
  namespaced: true,
  
  state: {
    accounts: [],
    selectedAccount: null,
    isLoading: false
  },
  
  getters: {
    totalBalance: (state) => state.accounts.reduce((sum, acc) => sum + acc.balance, 0),
    activeAccounts: (state) => state.accounts.filter(acc => acc.isActive),
    accountsByType: (state) => (type: string) => state.accounts.filter(acc => acc.type === type)
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_ACCOUNTS(state, accounts: Account[]) {
      state.accounts = accounts
    },
    ADD_ACCOUNT(state, account: Account) {
      state.accounts.push(account)
    },
    UPDATE_ACCOUNT(state, updatedAccount: Account) {
      const index = state.accounts.findIndex(acc => acc.id === updatedAccount.id)
      if (index !== -1) {
        state.accounts.splice(index, 1, updatedAccount)
      }
    },
    DELETE_ACCOUNT(state, accountId: string) {
      state.accounts = state.accounts.filter(acc => acc.id !== accountId)
    },
    SET_SELECTED_ACCOUNT(state, account: Account | null) {
      state.selectedAccount = account
    }
  },
  
  actions: {
    async fetchAccounts({ commit }) {
      commit('SET_LOADING', true)
      try {
        const accounts = await accountService.getAccounts()
        commit('SET_ACCOUNTS', accounts)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createAccount({ commit }, accountData: Partial<Account>) {
      const account = await accountService.createAccount(accountData)
      commit('ADD_ACCOUNT', account)
      return account
    },
    
    async updateAccount({ commit }, { id, data }: { id: string; data: Partial<Account> }) {
      const account = await accountService.updateAccount(id, data)
      commit('UPDATE_ACCOUNT', account)
      return account
    },
    
    async deleteAccount({ commit }, accountId: string) {
      await accountService.deleteAccount(accountId)
      commit('DELETE_ACCOUNT', accountId)
    }
  }
}

export default accounts