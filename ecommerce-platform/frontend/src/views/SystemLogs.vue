<template>
  <div class="system-logs">
    <div class="logs-header">
      <h2>Системные логи</h2>
      <div class="logs-controls">
        <select v-model="levelFilter" class="input">
          <option value="">Все уровни</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <button @click="clearLogs" class="btn btn-secondary">Очистить логи</button>
        <button @click="refreshLogs" class="btn btn-primary">Обновить</button>
      </div>
    </div>
    
    <div class="logs-container">
      <div 
        v-for="log in filteredLogs" 
        :key="log.id" 
        :class="['log-entry', log.level]"
      >
        <div class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</div>
        <div class="log-level">{{ log.level.toUpperCase() }}</div>
        <div class="log-message">{{ log.message }}</div>
        <div v-if="log.details" class="log-details">
          <pre>{{ JSON.stringify(log.details, null, 2) }}</pre>
        </div>
      </div>
      
      <div v-if="filteredLogs.length === 0" class="no-logs">
        <p>Логи отсутствуют</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
}

const logs = ref<LogEntry[]>([]);
const levelFilter = ref('');

const filteredLogs = computed(() => {
  if (!levelFilter.value) return logs.value;
  return logs.value.filter(log => log.level === levelFilter.value);
});

const addLog = (level: LogEntry['level'], message: string, details?: any) => {
  logs.value.unshift({
    id: Date.now().toString(),
    timestamp: Date.now(),
    level,
    message,
    details
  });
  
  // Keep only last 100 logs
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100);
  }
};

const clearLogs = () => {
  logs.value = [];
};

const refreshLogs = () => {
  // Simulate fetching new logs
  addLog('info', 'Логи обновлены', { timestamp: new Date().toISOString() });
};

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('ru-RU');
};

onMounted(() => {
  // Mock logs
  addLog('info', 'Система запущена');
  addLog('info', 'Пользователь admin@example.com вошел в систему');
  addLog('warning', 'Низкий остаток товара: Laptop Pro (осталось: 2)');
  addLog('error', 'Ошибка подключения к базе данных', { 
    error: 'Connection timeout',
    retries: 3 
  });
  addLog('info', 'Создан новый заказ #12345');
  
  // Listen for new logs from other parts of the app
  window.addEventListener('system-log', (event: any) => {
    const { level, message, details } = event.detail;
    addLog(level, message, details);
  });
});
</script>

<style scoped>
.system-logs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.logs-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.logs-controls .input {
  min-width: 150px;
}

.logs-container {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  max-height: 600px;
  overflow-y: auto;
}

.log-entry {
  display: grid;
  grid-template-columns: 150px 80px 1fr;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-family: monospace;
  font-size: 0.875rem;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.info {
  background: rgba(59, 130, 246, 0.05);
}

.log-entry.warning {
  background: rgba(245, 158, 11, 0.05);
}

.log-entry.error {
  background: rgba(239, 68, 68, 0.05);
}

.log-timestamp {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.log-level {
  font-weight: 600;
  text-transform: uppercase;
}

.log-entry.info .log-level {
  color: #3b82f6;
}

.log-entry.warning .log-level {
  color: #f59e0b;
}

.log-entry.error .log-level {
  color: #ef4444;
}

.log-message {
  color: var(--text-primary);
}

.log-details {
  grid-column: 1 / -1;
  margin-top: 8px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 0.75rem;
}

.log-details pre {
  margin: 0;
  white-space: pre-wrap;
  color: var(--text-secondary);
}

.no-logs {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .logs-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .logs-controls {
    justify-content: space-between;
  }
  
  .log-entry {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .log-details {
    grid-column: 1;
  }
}
</style>