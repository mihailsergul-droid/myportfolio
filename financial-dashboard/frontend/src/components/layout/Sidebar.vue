<template>
  <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
    <div class="flex items-center justify-center h-16 border-b border-gray-200">
      <h1 class="text-xl font-bold text-gray-900">FinDashboard</h1>
    </div>
    
    <nav class="mt-8">
      <div class="px-4 space-y-2">
        <router-link
          v-for="item in menuItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200"
          :class="isActive(item.path) ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
          <span v-if="item.badge" class="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
            {{ item.badge }}
          </span>
        </router-link>
      </div>
      
      <div class="mt-8 px-4">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Быстрые действия
        </h3>
        <div class="space-y-2">
          <button
            v-for="action in quickActions"
            :key="action.name"
            @click="action.handler"
            class="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <component :is="action.icon" class="w-4 h-4 mr-3" />
            {{ action.name }}
          </button>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import {
  HomeIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  TrophyIcon,
  BanknotesIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  BellIcon,
  CogIcon,
  UserIcon,
  PlusIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const store = useStore()

const alertsCount = computed(() => store.state.alerts.unreadCount)

const menuItems = [
  { name: 'Дашборд', path: '/', icon: HomeIcon },
  { name: 'Счета', path: '/accounts', icon: CreditCardIcon },
  { name: 'Транзакции', path: '/transactions', icon: ArrowsRightLeftIcon },
  { name: 'Бюджеты', path: '/budgets', icon: ChartBarIcon },
  { name: 'Инвестиции', path: '/investments', icon: BanknotesIcon },
  { name: 'Цели', path: '/goals', icon: TrophyIcon },
  { name: 'Аналитика', path: '/analytics', icon: ChartPieIcon },
  { name: 'Прогнозы', path: '/predictions', icon: DocumentChartBarIcon },
  { name: 'Уведомления', path: '/alerts', icon: BellIcon, badge: alertsCount.value || undefined },
  { name: 'Настройки', path: '/settings', icon: CogIcon },
  { name: 'Профиль', path: '/profile', icon: UserIcon }
]

const quickActions = [
  {
    name: 'Добавить транзакцию',
    icon: PlusIcon,
    handler: () => store.dispatch('modals/openModal', 'addTransaction')
  },
  {
    name: 'Экспорт данных',
    icon: ArrowUpTrayIcon,
    handler: () => store.dispatch('modals/openModal', 'exportData')
  }
]

const isActive = (path: string) => {
  return route.path === path
}
</script>