import { apiService } from './api'
import { Account, APIResponse } from '@/types'

class AccountService {
  async getAccounts(): Promise<Account[]> {
    const response = await apiService.get<APIResponse<Account[]>>('/accounts')
    return response.data
  }

  async getAccount(id: string): Promise<Account> {
    const response = await apiService.get<APIResponse<Account>>(`/accounts/${id}`)
    return response.data
  }

  async createAccount(accountData: Partial<Account>): Promise<Account> {
    const response = await apiService.post<APIResponse<Account>>('/accounts', accountData)
    return response.data
  }

  async updateAccount(id: string, accountData: Partial<Account>): Promise<Account> {
    const response = await apiService.patch<APIResponse<Account>>(`/accounts/${id}`, accountData)
    return response.data
  }

  async deleteAccount(id: string): Promise<void> {
    await apiService.delete(`/accounts/${id}`)
  }

  async syncAccount(id: string): Promise<Account> {
    const response = await apiService.post<APIResponse<Account>>(`/accounts/${id}/sync`)
    return response.data
  }

  async getAccountBalance(id: string): Promise<{ balance: number; lastUpdated: string }> {
    const response = await apiService.get<APIResponse<{ balance: number; lastUpdated: string }>>(`/accounts/${id}/balance`)
    return response.data
  }

  async connectBankAccount(bankData: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: string
  }): Promise<Account> {
    const response = await apiService.post<APIResponse<Account>>('/accounts/connect-bank', bankData)
    return response.data
  }
}

export const accountService = new AccountService()