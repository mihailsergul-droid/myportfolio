import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { migrateData } from '../utils/migrations';

export const useDataSync = () => {
  const store = useStore();
  const isOnline = ref(navigator.onLine);
  const lastSync = ref<string | null>(localStorage.getItem('lastSync'));
  const syncInProgress = ref(false);

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
    if (isOnline.value) {
      syncData();
    }
  };

  const syncData = async () => {
    if (syncInProgress.value || !isOnline.value) return;
    
    syncInProgress.value = true;
    
    try {
      // Check for data updates
      const localVersion = localStorage.getItem('dataVersion') || '1.0.0';
      const serverVersion = '1.1.0'; // Would come from API
      
      if (localVersion !== serverVersion) {
        await migrateLocalData(localVersion, serverVersion);
      }
      
      // Sync with server (mock)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      lastSync.value = new Date().toISOString();
      localStorage.setItem('lastSync', lastSync.value);
      localStorage.setItem('dataVersion', serverVersion);
      
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Данные синхронизированы'
      });
    } catch (error) {
      store.dispatch('addNotification', {
        type: 'error',
        message: 'Ошибка синхронизации данных'
      });
    } finally {
      syncInProgress.value = false;
    }
  };

  const migrateLocalData = async (fromVersion: string, toVersion: string) => {
    const products = store.state.products;
    const orders = store.state.orders;
    
    const backupData = {
      version: fromVersion,
      data: { products, orders }
    };
    
    const migratedData = migrateData(backupData, toVersion);
    
    // Update store with migrated data
    if (migratedData.data.products) {
      store.commit('SET_PRODUCTS', migratedData.data.products);
    }
    if (migratedData.data.orders) {
      store.commit('SET_ORDERS', migratedData.data.orders);
    }
    
    store.dispatch('addNotification', {
      type: 'info',
      message: `Данные обновлены с версии ${fromVersion} до ${toVersion}`
    });
  };

  const forceSync = () => {
    syncData();
  };

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Auto sync every 5 minutes
    const syncInterval = setInterval(syncData, 5 * 60 * 1000);
    
    // Initial sync
    if (isOnline.value) {
      syncData();
    }
    
    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(syncInterval);
    });
  });

  return {
    isOnline,
    lastSync,
    syncInProgress,
    forceSync
  };
};