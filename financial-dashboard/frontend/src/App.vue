<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <div v-if="isLoading" class="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div class="text-center">
        <div class="loading-spinner w-8 h-8 mb-4"></div>
        <p class="text-gray-600">Загрузка...</p>
      </div>
    </div>
    
    <template v-else>
      <Sidebar v-if="isAuthenticated" />
      <Header v-if="isAuthenticated" />
      
      <main :class="{ 'ml-64 pt-16': isAuthenticated }">
        <router-view />
      </main>
      
      <NotificationCenter />
      <AlertModal />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import NotificationCenter from '@/components/notifications/NotificationCenter.vue'
import AlertModal from '@/components/modals/AlertModal.vue'

const store = useStore()
const router = useRouter()

const isLoading = computed(() => store.state.app.isLoading)
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

onMounted(async () => {
  try {
    await store.dispatch('app/initialize')
    
    if (isAuthenticated.value) {
      await Promise.all([
        store.dispatch('accounts/fetchAccounts'),
        store.dispatch('transactions/fetchRecentTransactions'),
        store.dispatch('alerts/fetchAlerts'),
      ])
    } else {
      router.push('/login')
    }
  } catch (error) {
    console.error('App initialization error:', error)
  }
})
</script>