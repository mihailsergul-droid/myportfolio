<template>
  <header class="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-30">
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center space-x-4">
        <button
          @click="toggleSidebar"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <Bars3Icon class="w-5 h-5 text-gray-600" />
        </button>
        
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск транзакций, счетов..."
            class="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- Quick Stats -->
        <div class="hidden lg:flex items-center space-x-6 mr-6">
          <div class="text-center">
            <p class="text-xs text-gray-500">Общий баланс</p>
            <p class="text-sm font-semibold text-gray-900">
              {{ formatCurrency(totalBalance) }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500">За месяц</p>
            <p class="text-sm font-semibold" :class="monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(monthlyChange) }}
            </p>
          </div>
        </div>
        
        <!-- Notifications -->
        <div class="relative">
          <button
            @click="toggleNotifications"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
          >
            <BellIcon class="w-5 h-5 text-gray-600" />
            <span
              v-if="unreadNotifications > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ unreadNotifications }}
            </span>
          </button>
          
          <NotificationDropdown
            v-if="showNotifications"
            @close="showNotifications = false"
          />
        </div>
        
        <!-- User Menu -->
        <div class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <img
              :src="currentUser?.avatar || '/default-avatar.png'"
              :alt="currentUser?.name"
              class="w-8 h-8 rounded-full"
            />
            <span class="text-sm font-medium text-gray-700">{{ currentUser?.name }}</span>
            <ChevronDownIcon class="w-4 h-4 text-gray-400" />
          </button>
          
          <UserDropdown
            v-if="showUserMenu"
            @close="showUserMenu = false"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import NotificationDropdown from '@/components/notifications/NotificationDropdown.vue'
import UserDropdown from '@/components/layout/UserDropdown.vue'

const store = useStore()

const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)

const currentUser = computed(() => store.getters['auth/currentUser'])
const totalBalance = computed(() => store.getters['accounts/totalBalance'])
const monthlyChange = computed(() => store.state.dashboard.monthlyChange)
const unreadNotifications = computed(() => store.state.alerts.unreadCount)

const toggleSidebar = () => {
  store.commit('app/TOGGLE_SIDEBAR')
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    store.dispatch('search/performSearch', searchQuery.value)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}
</script>