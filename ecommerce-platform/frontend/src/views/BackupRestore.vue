<template>
  <div class="backup-restore">
    <div class="page-header">
      <h2>Резервное копирование</h2>
    </div>

    <div class="backup-grid">
      <div class="backup-card">
        <div class="card-header">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
          </svg>
          <h3>Создать резервную копию</h3>
        </div>
        
        <div class="backup-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="backupOptions.products">
            <span>Товары ({{ productsCount }})</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="backupOptions.orders">
            <span>Заказы ({{ ordersCount }})</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="backupOptions.users">
            <span>Пользователи ({{ usersCount }})</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="backupOptions.settings">
            <span>Настройки системы</span>
          </label>
        </div>
        
        <div class="backup-actions">
          <button @click="createBackup" :disabled="!hasSelectedOptions || creating" class="btn btn-primary">
            {{ creating ? 'Создание...' : 'Создать резервную копию' }}
          </button>
        </div>
      </div>

      <div class="backup-card">
        <div class="card-header">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 4.414V13a1 1 0 11-2 0V4.414L7.707 5.707a1 1 0 01-1.414 0z"/>
          </svg>
          <h3>Восстановление</h3>
        </div>
        
        <div class="restore-section">
          <input 
            ref="restoreInput" 
            type="file" 
            accept=".json" 
            @change="handleRestoreFile" 
            class="file-input"
          >
          <button @click="$refs.restoreInput.click()" class="btn btn-secondary">
            Выбрать файл резервной копии
          </button>
          
          <div v-if="restorePreview" class="restore-preview">
            <h4>Содержимое резервной копии:</h4>
            <div class="backup-info">
              <div class="info-item">
                <span class="label">Дата создания:</span>
                <span class="value">{{ formatDate(restorePreview.timestamp) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Версия:</span>
                <span class="value">{{ restorePreview.version }}</span>
              </div>
            </div>
            
            <div class="restore-options">
              <label v-for="(count, key) in restorePreview.data" :key="key" class="checkbox-label">
                <input type="checkbox" v-model="restoreOptions[key]">
                <span>{{ getDataLabel(key) }} ({{ Array.isArray(count) ? count.length : 'есть' }})</span>
              </label>
            </div>
            
            <div class="restore-actions">
              <button @click="restoreBackup" :disabled="!hasSelectedRestoreOptions || restoring" class="btn btn-warning">
                {{ restoring ? 'Восстановление...' : 'Восстановить данные' }}
              </button>
              <button @click="clearRestore" class="btn btn-secondary">Отмена</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="backups-history">
      <h3>История резервных копий</h3>
      <div class="history-list">
        <div v-for="backup in backupHistory" :key="backup.id" class="history-item">
          <div class="backup-info">
            <div class="backup-name">{{ backup.name }}</div>
            <div class="backup-details">
              <span>{{ formatDate(backup.timestamp) }}</span>
              <span>{{ formatFileSize(backup.size) }}</span>
            </div>
          </div>
          <div class="backup-actions">
            <button @click="downloadBackup(backup)" class="btn btn-sm">Скачать</button>
            <button @click="deleteBackup(backup)" class="btn btn-sm btn-danger">Удалить</button>
          </div>
        </div>
        
        <div v-if="backupHistory.length === 0" class="no-backups">
          <p>История резервных копий пуста</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { migrateData, rollbackData, migrations } from '../utils/migrations';

interface BackupData {
  timestamp: string;
  version: string;
  data: {
    products?: any[];
    orders?: any[];
    users?: any[];
    settings?: any;
  };
}

interface BackupHistoryItem {
  id: string;
  name: string;
  timestamp: string;
  size: number;
}

const store = useStore();
const restoreInput = ref<HTMLInputElement>();
const creating = ref(false);
const restoring = ref(false);
const restorePreview = ref<BackupData | null>(null);

const backupOptions = reactive({
  products: true,
  orders: true,
  users: false,
  settings: true
});

const restoreOptions = reactive({
  products: false,
  orders: false,
  users: false,
  settings: false
});

const backupHistory = ref<BackupHistoryItem[]>([]);

const productsCount = computed(() => store.state.products.length);
const ordersCount = computed(() => store.state.orders.length);
const usersCount = computed(() => 5); // Mock count

const hasSelectedOptions = computed(() => 
  Object.values(backupOptions).some(Boolean)
);

const hasSelectedRestoreOptions = computed(() => 
  Object.values(restoreOptions).some(Boolean)
);

const createBackup = async () => {
  creating.value = true;
  
  try {
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      data: {}
    };
    
    if (backupOptions.products) {
      backupData.data.products = store.state.products;
    }
    if (backupOptions.orders) {
      backupData.data.orders = store.state.orders;
    }
    if (backupOptions.users) {
      backupData.data.users = []; // Mock users
    }
    if (backupOptions.settings) {
      backupData.data.settings = JSON.parse(localStorage.getItem('systemSettings') || '{}');
    }
    
    // Download backup
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `backup_${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
    
    // Add to history
    const historyItem: BackupHistoryItem = {
      id: Date.now().toString(),
      name: filename,
      timestamp: new Date().toISOString(),
      size: blob.size
    };
    backupHistory.value.unshift(historyItem);
    saveBackupHistory();
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Резервная копия создана успешно'
    });
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Ошибка создания резервной копии'
    });
  } finally {
    creating.value = false;
  }
};

const handleRestoreFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target?.result as string);
        
        // Auto-migrate data to current version
        if (data.version && data.version !== '1.1.0') {
          data = migrateData(data, '1.1.0');
          store.dispatch('addNotification', {
            type: 'info',
            message: `Данные автоматически обновлены с версии ${data.version} до 1.1.0`
          });
        }
        
        restorePreview.value = data;
        
        // Reset restore options
        Object.keys(restoreOptions).forEach(key => {
          restoreOptions[key] = false;
        });
      } catch (error) {
        store.dispatch('addNotification', {
          type: 'error',
          message: 'Ошибка чтения файла резервной копии'
        });
      }
    };
    reader.readAsText(file);
  }
};

const restoreBackup = async () => {
  if (!restorePreview.value) return;
  
  restoring.value = true;
  
  try {
    const data = restorePreview.value.data;
    
    if (restoreOptions.products && data.products) {
      // Clear existing products and add from backup
      store.commit('SET_PRODUCTS', data.products);
    }
    
    if (restoreOptions.orders && data.orders) {
      store.commit('SET_ORDERS', data.orders);
    }
    
    if (restoreOptions.settings && data.settings) {
      localStorage.setItem('systemSettings', JSON.stringify(data.settings));
    }
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Данные восстановлены успешно'
    });
    
    clearRestore();
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Ошибка восстановления данных'
    });
  } finally {
    restoring.value = false;
  }
};

const clearRestore = () => {
  restorePreview.value = null;
  if (restoreInput.value) {
    restoreInput.value.value = '';
  }
};

const getDataLabel = (key: string) => {
  const labels = {
    products: 'Товары',
    orders: 'Заказы',
    users: 'Пользователи',
    settings: 'Настройки'
  };
  return labels[key] || key;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU');
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const downloadBackup = (backup: BackupHistoryItem) => {
  store.dispatch('addNotification', {
    type: 'info',
    message: `Скачивание ${backup.name}`
  });
};

const deleteBackup = (backup: BackupHistoryItem) => {
  const index = backupHistory.value.indexOf(backup);
  if (index > -1) {
    backupHistory.value.splice(index, 1);
    saveBackupHistory();
    store.dispatch('addNotification', {
      type: 'info',
      message: 'Резервная копия удалена'
    });
  }
};

const saveBackupHistory = () => {
  localStorage.setItem('backupHistory', JSON.stringify(backupHistory.value));
};

const loadBackupHistory = () => {
  const saved = localStorage.getItem('backupHistory');
  if (saved) {
    backupHistory.value = JSON.parse(saved);
  }
};

onMounted(() => {
  loadBackupHistory();
  store.dispatch('fetchProducts');
  store.dispatch('fetchOrders');
});
</script>

<style scoped>
.backup-restore {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
}

.backup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.backup-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header svg {
  color: var(--primary);
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.backup-options,
.restore-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: var(--transition);
}

.checkbox-label:hover {
  background: var(--bg-secondary);
}

.backup-actions,
.restore-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.file-input {
  display: none;
}

.restore-preview {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.backup-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.label {
  color: var(--text-secondary);
}

.value {
  font-weight: 500;
}

.backups-history {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.backups-history h3 {
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.backup-name {
  font-weight: 500;
  color: var(--text-primary);
}

.backup-details {
  display: flex;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 4px;
}

.backup-actions {
  display: flex;
  gap: 8px;
}

.no-backups {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .backup-grid {
    grid-template-columns: 1fr;
  }
  
  .backup-actions,
  .restore-actions {
    flex-direction: column;
  }
  
  .history-item {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .backup-actions {
    justify-content: center;
  }
}
</style>