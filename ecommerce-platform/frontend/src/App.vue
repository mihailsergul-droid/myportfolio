<template>
  <div>
    <header class="modern-header">
      <div class="container">
        <div class="header-content">
          <router-link to="/" class="logo">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                <path d="M8 8h16l-1.5 9H10l-2-9zm0 0L6 4H2m6 4l2 9m0 0v3a2 2 0 002 2h8a2 2 0 002-2v-3m-12 0h12"/>
              </svg>
            </div>
            <span class="logo-text">E-Shop</span>
          </router-link>
          
          <nav class="main-nav">
            <router-link to="/" class="nav-item">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span>Магазин</span>
            </router-link>
            
            <router-link to="/wishlist" v-if="isAuthenticated" class="nav-item nav-item-with-badge">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
              <span>Избранное</span>
              <span v-if="wishlistCount > 0" class="nav-badge">{{ wishlistCount }}</span>
            </router-link>
            
            <router-link to="/cart" v-if="isAuthenticated" class="nav-item nav-item-with-badge">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              </svg>
              <span>Корзина</span>
              <span v-if="cartItemsCount > 0" class="nav-badge">{{ cartItemsCount }}</span>
            </router-link>
            
            <router-link to="/admin" v-if="isAdmin" class="nav-item">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
              </svg>
              <span>Админ</span>
            </router-link>
          </nav>
          
          <div class="header-actions">
            <button 
              @click="forceSync" 
              :disabled="syncInProgress"
              :class="['action-btn', 'sync-btn', { offline: !isOnline, syncing: syncInProgress }]"
              :title="isOnline ? (сyncInProgress ? 'Синхронизация...' : 'Синхронизировать') : 'Оффлайн'"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" :class="{ 'animate-spin': syncInProgress }">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
              </svg>
            </button>
            
            <button @click="toggleTheme" class="action-btn" :title="isDark ? 'Светлая тема' : 'Темная тема'">
              <svg v-if="isDark" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
              </svg>
              <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            </button>
            
            <div v-if="isAuthenticated" class="user-menu">
              <div class="user-avatar">
                {{ currentUser?.email?.charAt(0).toUpperCase() }}
              </div>
              <div class="user-dropdown">
                <router-link to="/profile" class="dropdown-item">Профиль</router-link>
                <button @click="logout" class="dropdown-item">Выйти</button>
              </div>
            </div>
            
            <router-link v-else to="/login" class="btn btn-primary">Войти</router-link>
          </div>
        </div>
      </div>
    </header>
    
    <div class="container">
      <router-view />
    </div>
    
    <NotificationToast />
    <ChatSupport />
    <HotkeyHelper />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import NotificationToast from './components/NotificationToast.vue';
import ChatSupport from './components/ChatSupport.vue';
import HotkeyHelper from './components/HotkeyHelper.vue';
import { useTheme } from './composables/useTheme';
import { useI18n } from './i18n';
import { usePerformance } from './composables/usePerformance';
import { useDataSync } from './composables/useDataSync';

const store = useStore();
const router = useRouter();
const { isDark, toggleTheme } = useTheme();
const { t, currentLang, setLanguage } = useI18n();
const { measureLoadTime, measureMemoryUsage, logMetrics } = usePerformance();
const { isOnline, lastSync, syncInProgress, forceSync } = useDataSync();

const cartItemsCount = computed(() => store.getters.cartItemsCount);
const wishlistCount = computed(() => store.getters.wishlistCount);
const compareCount = computed(() => store.getters.compareCount);
const isAuthenticated = computed(() => store.getters.isAuthenticated);
const isAdmin = computed(() => store.getters.isAdmin);
const currentUser = computed(() => store.getters.currentUser);

const logout = () => {
  store.dispatch('logout');
  router.push('/');
};

const changeLanguage = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  setLanguage(target.value);
};

// Мониторинг производительности
onMounted(() => {
  measureLoadTime();
  measureMemoryUsage();
  
  // Логирование метрик в dev режиме
  if (import.meta.env.DEV) {
    setTimeout(logMetrics, 2000);
  }
});
</script>

<style>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  text-decoration: none;
  color: inherit;
}

.logo:hover {
  text-decoration: none;
}

.nav-link-with-badge {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
}

.badge {
  background: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.8rem;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-link {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-link:hover {
  background: rgba(255,255,255,0.1);
  text-decoration: none;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.9rem;
}

.theme-lang-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.lang-select {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.lang-select option {
  background: #333;
  color: white;
}

/* Dark theme styles */
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --card-bg: #2d2d2d;
  --border-color: #404040;
}

[data-theme="dark"] body {
  background-color: var(--bg-color);
  color: var(--text-color);
}

[data-theme="dark"] .container {
  background-color: var(--bg-color);
}

[data-theme="dark"] .product-card,
[data-theme="dark"] .admin-section,
[data-theme="dark"] .step {
  background-color: var(--card-bg);
  border-color: var(--border-color);
}

.modern-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: var(--transition);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.25rem;
  transition: var(--transition);
}

.logo:hover {
  color: var(--primary);
  text-decoration: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  transition: var(--transition);
  position: relative;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  text-decoration: none;
}

.nav-item.router-link-active {
  background: var(--primary);
  color: white;
}

.nav-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--danger);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid var(--bg-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.sync-btn.offline {
  color: var(--danger);
}

.sync-btn.syncing {
  color: var(--primary);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: var(--transition);
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-primary);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  text-decoration: none;
}

@media (max-width: 768px) {
  .header-content {
    height: auto;
    flex-direction: column;
    padding: 16px 0;
    gap: 16px;
  }
  
  .main-nav {
    order: 2;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .header-actions {
    order: 1;
  }
}
</style>