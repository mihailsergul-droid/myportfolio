<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="notificationClasses(notification.type)"
        class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component
                :is="getIcon(notification.type)"
                :class="iconClasses(notification.type)"
                class="h-6 w-6"
              />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">
                {{ notification.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ notification.message }}
              </p>
              <div v-if="notification.actions" class="mt-3 flex space-x-2">
                <button
                  v-for="action in notification.actions"
                  :key="action.label"
                  @click="handleAction(action, notification)"
                  :class="action.primary ? 'btn-primary' : 'btn-secondary'"
                  class="btn text-xs"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="notification.autoClose !== false"
          class="h-1 bg-gray-200"
        >
          <div
            :class="progressClasses(notification.type)"
            class="h-full transition-all duration-100 ease-linear"
            :style="{ width: `${getProgress(notification)}%` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface NotificationAction {
  label: string
  handler: () => void
  primary?: boolean
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  actions?: NotificationAction[]
  autoClose?: boolean
  duration?: number
  createdAt: number
}

const store = useStore()

const notifications = computed(() => store.state.app.notifications)

let progressInterval: NodeJS.Timeout | null = null

const getIcon = (type: string) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type as keyof typeof icons] || InformationCircleIcon
}

const notificationClasses = (type: string) => {
  const classes = {
    success: 'border-l-4 border-green-400',
    error: 'border-l-4 border-red-400',
    warning: 'border-l-4 border-yellow-400',
    info: 'border-l-4 border-blue-400'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const iconClasses = (type: string) => {
  const classes = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const progressClasses = (type: string) => {
  const classes = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    warning: 'bg-yellow-400',
    info: 'bg-blue-400'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getProgress = (notification: Notification) => {
  if (notification.autoClose === false) return 0
  
  const duration = notification.duration || 5000
  const elapsed = Date.now() - notification.createdAt
  const progress = Math.max(0, 100 - (elapsed / duration) * 100)
  
  return progress
}

const removeNotification = (id: string) => {
  store.commit('app/REMOVE_NOTIFICATION', id)
}

const handleAction = (action: NotificationAction, notification: Notification) => {
  action.handler()
  removeNotification(notification.id)
}

const updateProgress = () => {
  notifications.value.forEach((notification: Notification) => {
    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000
      const elapsed = Date.now() - notification.createdAt
      
      if (elapsed >= duration) {
        removeNotification(notification.id)
      }
    }
  })
}

onMounted(() => {
  progressInterval = setInterval(updateProgress, 100)
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>