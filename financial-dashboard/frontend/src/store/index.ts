import { createStore } from 'vuex'
import auth from './modules/auth'
import app from './modules/app'
import accounts from './modules/accounts'
import transactions from './modules/transactions'
import budgets from './modules/budgets'
import investments from './modules/investments'
import goals from './modules/goals'
import alerts from './modules/alerts'
import dashboard from './modules/dashboard'
import predictions from './modules/predictions'

export const store = createStore({
  modules: {
    auth,
    app,
    accounts,
    transactions,
    budgets,
    investments,
    goals,
    alerts,
    dashboard,
    predictions
  },
  strict: process.env.NODE_ENV !== 'production'
})