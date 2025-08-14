<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p class="text-gray-600">Добро пожаловать, {{ currentUser?.name }}!</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="refreshData"
          :disabled="isRefreshing"
          class="btn btn-secondary"
        >
          <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRefreshing }" />
          Обновить
        </button>
        <button
          @click="openCustomizeModal"
          class="btn btn-primary"
        >
          <Cog6ToothIcon class="w-4 h-4 mr-2" />
          Настроить
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Общий баланс"
        :value="formatCurrency(totalBalance)"
        :change="balanceChange"
        icon="CurrencyDollarIcon"
        color="blue"
      />
      <MetricCard
        title="Доходы за месяц"
        :value="formatCurrency(monthlyIncome)"
        :change="incomeChange"
        icon="ArrowTrendingUpIcon"
        color="green"
      />
      <MetricCard
        title="Расходы за месяц"
        :value="formatCurrency(monthlyExpenses)"
        :change="expensesChange"
        icon="ArrowTrendingDownIcon"
        color="red"
      />
      <MetricCard
        title="Активные цели"
        :value="activeGoals.toString()"
        :change="goalsChange"
        icon="TrophyIcon"
        color="purple"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="chart-container">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Баланс по времени</h3>
          <select v-model="balanceChartPeriod" class="text-sm border border-gray-300 rounded px-3 py-1">
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="1y">1 год</option>
          </select>
        </div>
        <BalanceChart :period="balanceChartPeriod" />
      </div>

      <div class="chart-container">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Расходы по категориям</h3>
          <select v-model="expenseChartPeriod" class="text-sm border border-gray-300 rounded px-3 py-1">
            <option value="current">Текущий месяц</option>
            <option value="last">Прошлый месяц</option>
            <option value="quarter">Квартал</option>
          </select>
        </div>
        <ExpenseCategoryChart :period="expenseChartPeriod" />
      </div>
    </div>

    <!-- Recent Activity & Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Последние транзакции</h3>
          <router-link to="/transactions" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Показать все
          </router-link>
        </div>
        <RecentTransactions :limit="5" />
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Уведомления</h3>
          <router-link to="/alerts" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Все уведомления
          </router-link>
        </div>
        <AlertsList :limit="3" />
      </div>
    </div>

    <!-- Budget Progress -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Прогресс бюджетов</h3>
        <router-link to="/budgets" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Управление бюджетами
        </router-link>
      </div>
      <BudgetProgress />
    </div>

    <!-- Investment Portfolio -->
    <div class="card" v-if="hasInvestments">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Инвестиционный портфель</h3>
        <router-link to="/investments" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Подробнее
        </router-link>
      </div>
      <InvestmentSummary />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  ArrowPathIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import BalanceChart from '@/components/charts/BalanceChart.vue'
import ExpenseCategoryChart from '@/components/charts/ExpenseCategoryChart.vue'
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
import AlertsList from '@/components/dashboard/AlertsList.vue'
import BudgetProgress from '@/components/dashboard/BudgetProgress.vue'
import InvestmentSummary from '@/components/dashboard/InvestmentSummary.vue'

const store = useStore()

const isRefreshing = ref(false)
const balanceChartPeriod = ref('30d')
const expenseChartPeriod = ref('current')

const currentUser = computed(() => store.getters['auth/currentUser'])
const totalBalance = computed(() => store.getters['accounts/totalBalance'])
const monthlyIncome = computed(() => store.state.dashboard.monthlyIncome)
const monthlyExpenses = computed(() => store.state.dashboard.monthlyExpenses)
const activeGoals = computed(() => store.state.goals.activeGoals.length)
const hasInvestments = computed(() => store.state.investments.investments.length > 0)

const balanceChange = computed(() => store.state.dashboard.balanceChange)
const incomeChange = computed(() => store.state.dashboard.incomeChange)
const expensesChange = computed(() => store.state.dashboard.expensesChange)
const goalsChange = computed(() => store.state.dashboard.goalsChange)

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      store.dispatch('dashboard/fetchDashboardData'),
      store.dispatch('accounts/fetchAccounts'),
      store.dispatch('transactions/fetchRecentTransactions'),
      store.dispatch('alerts/fetchAlerts')
    ])
  } finally {
    isRefreshing.value = false
  }
}

const openCustomizeModal = () => {
  store.dispatch('modals/openModal', 'customizeDashboard')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}

onMounted(() => {
  store.dispatch('dashboard/fetchDashboardData')
})
</script>