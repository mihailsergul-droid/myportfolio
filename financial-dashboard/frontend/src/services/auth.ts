import { apiService } from './api'
import { User, APIResponse } from '@/types'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  user: User
  token: string
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<APIResponse<LoginResponse>>('/auth/login', credentials)
    return response.data
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout')
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<APIResponse<User>>('/auth/me')
    return response.data
  }

  async register(userData: {
    email: string
    password: string
    name: string
  }): Promise<LoginResponse> {
    const response = await apiService.post<APIResponse<LoginResponse>>('/auth/register', userData)
    return response.data
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, password })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.patch<APIResponse<User>>('/auth/profile', userData)
    return response.data
  }
}

export const authService = new AuthService()