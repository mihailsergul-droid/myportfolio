<template>
  <teleport to="body">
    <transition-group name="notification" tag="div" class="notifications-container">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
      >
        <div class="notification-icon">
          <svg v-if="notification.type === 'success'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <svg v-else-if="notification.type === 'error'" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
          </svg>
          <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
          </svg>
        </div>
        <div class="notification-content">
          <p class="notification-message">{{ notification.message }}</p>
        </div>
        <button @click="removeNotification(notification.id)" class="notification-close">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const notifications = computed(() => store.state.notifications);

const removeNotification = (id: string) => {
  store.commit('REMOVE_NOTIFICATION', id);
};
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  min-width: 320px;
  max-width: 400px;
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.notification-success {
  border-left: 4px solid var(--success);
}

.notification-error {
  border-left: 4px solid var(--danger);
}

.notification-info {
  border-left: 4px solid var(--primary);
}

.notification-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.notification-success .notification-icon {
  color: var(--success);
}

.notification-error .notification-icon {
  color: var(--danger);
}

.notification-info .notification-icon {
  color: var(--primary);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 500;
}

.notification-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.notification-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-move {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@media (max-width: 640px) {
  .notifications-container {
    left: 20px;
    right: 20px;
    top: 20px;
  }
  
  .notification {
    min-width: auto;
    max-width: none;
  }
}
</style>