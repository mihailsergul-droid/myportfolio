export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  currency: string
  language: string
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  alerts: boolean
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  bankName: string
  accountNumber: string
  isActive: boolean
}

export interface Transaction {
  id: string
  accountId: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string
  description: string
  date: string
  merchant?: string
  tags: string[]
}

export interface Budget {
  id: string
  name: string
  category: string
  amount: number
  spent: number
  period: 'monthly' | 'yearly'
  startDate: string
  endDate: string
  alerts: BudgetAlert[]
}

export interface BudgetAlert {
  threshold: number
  type: 'percentage' | 'amount'
  triggered: boolean
}

export interface Investment {
  id: string
  symbol: string
  name: string
  quantity: number
  purchasePrice: number
  currentPrice: number
  change: number
  changePercent: number
  marketValue: number
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: 'low' | 'medium' | 'high'
}

export interface Alert {
  id: string
  type: 'budget' | 'transaction' | 'investment' | 'goal'
  severity: 'info' | 'warning' | 'error'
  title: string
  message: string
  date: string
  read: boolean
  actionUrl?: string
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'list' | 'table'
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: Record<string, any>
  visible: boolean
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
}

export interface MLPrediction {
  id: string
  type: 'expense' | 'income' | 'investment'
  period: string
  predictions: PredictionPoint[]
  confidence: number
  model: string
  createdAt: string
}

export interface PredictionPoint {
  date: string
  value: number
  confidence: number
}

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv'
  dateRange: {
    start: string
    end: string
  }
  accounts: string[]
  categories: string[]
  includeCharts: boolean
}

export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FilterOptions {
  dateRange?: {
    start: string
    end: string
  }
  accounts?: string[]
  categories?: string[]
  types?: string[]
  amountRange?: {
    min: number
    max: number
  }
}