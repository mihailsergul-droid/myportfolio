<template>
  <div class="notification-center">
    <div class="page-header">
      <h2>Центр уведомлений</h2>
      <div class="header-actions">
        <button @click="markAllAsRead" class="btn btn-secondary">Отметить все как прочитанные</button>
        <button @click="createNotification" class="btn btn-primary">Создать уведомление</button>
      </div>
    </div>

    <div class="notification-stats">
      <div class="stat-item">
        <span class="stat-value">{{ unreadCount }}</span>
        <span class="stat-label">Непрочитанные</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ todayCount }}</span>
        <span class="stat-label">Сегодня</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ totalCount }}</span>
        <span class="stat-label">Всего</span>
      </div>
    </div>

    <div class="notification-filters">
      <select v-model="typeFilter" class="input">
        <option value="">Все типы</option>
        <option value="system">Системные</option>
        <option value="order">Заказы</option>
        <option value="inventory">Склад</option>
        <option value="user">Пользователи</option>
      </select>
      <select v-model="statusFilter" class="input">
        <option value="">Все статусы</option>
        <option value="unread">Непрочитанные</option>
        <option value="read">Прочитанные</option>
      </select>
    </div>

    <div class="notifications-list">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        :class="['notification-item', notification.type, { unread: !notification.read }]"
        @click="markAsRead(notification)"
      >
        <div class="notification-icon">
          <svg v-if="notification.type === 'system'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
          </svg>
          <svg v-else-if="notification.type === 'order'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          <svg v-else-if="notification.type === 'inventory'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 12a3 3 0 100-6 3 3 0 000 6z"/>
          </svg>
          <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
          </svg>
        </div>
        
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-meta">
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            <span :class="['notification-priority', notification.priority]">{{ notification.priority }}</span>
          </div>
        </div>
        
        <div class="notification-actions">
          <button v-if="!notification.read" @click.stop="markAsRead(notification)" class="action-btn">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          </button>
          <button @click.stop="deleteNotification(notification)" class="action-btn delete">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 6.707 8.293a1 1 0 00-1.414 1.414L8.586 12l-3.293 3.293a1 1 0 101.414 1.414L10 13.414l3.293 3.293a1 1 0 001.414-1.414L11.414 12l3.293-3.293z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="filteredNotifications.length === 0" class="no-notifications">
        <p>Уведомления отсутствуют</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

interface AdminNotification {
  id: number;
  type: 'system' | 'order' | 'inventory' | 'user';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: string;
}

const store = useStore();
const notifications = ref<AdminNotification[]>([]);
const typeFilter = ref('');
const statusFilter = ref('');

const filteredNotifications = computed(() => {
  let items = notifications.value;
  
  if (typeFilter.value) {
    items = items.filter(n => n.type === typeFilter.value);
  }
  
  if (statusFilter.value) {
    items = items.filter(n => statusFilter.value === 'read' ? n.read : !n.read);
  }
  
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);
const todayCount = computed(() => {
  const today = new Date().toDateString();
  return notifications.value.filter(n => new Date(n.createdAt).toDateString() === today).length;
});
const totalCount = computed(() => notifications.value.length);

const markAsRead = (notification: AdminNotification) => {
  notification.read = true;
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true);
  store.dispatch('addNotification', {
    type: 'success',
    message: 'Все уведомления отмечены как прочитанные'
  });
};

const deleteNotification = (notification: AdminNotification) => {
  const index = notifications.value.indexOf(notification);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const createNotification = () => {
  const newNotification: AdminNotification = {
    id: Date.now(),
    type: 'system',
    title: 'Тестовое уведомление',
    message: 'Это тестовое уведомление, созданное вручную',
    priority: 'medium',
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.value.unshift(newNotification);
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}д назад`;
  if (hours > 0) return `${hours}ч назад`;
  if (minutes > 0) return `${minutes}м назад`;
  return 'Только что';
};

onMounted(() => {
  // Mock notifications
  notifications.value = [
    {
      id: 1,
      type: 'order',
      title: 'Новый заказ',
      message: 'Получен новый заказ #12345 на сумму $299',
      priority: 'high',
      read: false,
      createdAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Низкий остаток',
      message: 'Товар "Smartphone X" заканчивается на складе (осталось: 3)',
      priority: 'medium',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      type: 'system',
      title: 'Обновление системы',
      message: 'Система была успешно обновлена до версии 2.1.0',
      priority: 'low',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
});
</script>

<style scoped>
.notification-center {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.notification-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.notification-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.notification-filters .input {
  max-width: 200px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
}

.notification-item:hover {
  background: var(--bg-secondary);
}

.notification-item.unread {
  border-left: 4px solid var(--primary);
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-item.system .notification-icon {
  background: rgb(59 130 246 / 0.1);
  color: var(--primary);
}

.notification-item.order .notification-icon {
  background: rgb(16 185 129 / 0.1);
  color: var(--success);
}

.notification-item.inventory .notification-icon {
  background: rgb(245 158 11 / 0.1);
  color: var(--warning);
}

.notification-item.user .notification-icon {
  background: rgb(139 92 246 / 0.1);
  color: #8b5cf6;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.notification-message {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.notification-priority {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.notification-priority.high {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger);
}

.notification-priority.medium {
  background: rgb(245 158 11 / 0.1);
  color: var(--warning);
}

.notification-priority.low {
  background: rgb(156 163 175 / 0.1);
  color: var(--text-secondary);
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.action-btn:hover {
  background: var(--primary);
  color: white;
}

.action-btn.delete:hover {
  background: var(--danger);
}

.no-notifications {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .notification-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .notification-filters {
    flex-direction: column;
  }
  
  .notification-filters .input {
    max-width: none;
  }
  
  .notification-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .notification-actions {
    align-self: flex-end;
  }
}
</style>