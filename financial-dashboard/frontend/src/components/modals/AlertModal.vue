<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <div :class="iconWrapperClasses" class="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <component :is="modalIcon" :class="iconClasses" class="h-6 w-6" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    {{ modalData.title }}
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      {{ modalData.message }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  v-if="modalData.confirmText"
                  @click="handleConfirm"
                  :disabled="isLoading"
                  :class="confirmButtonClasses"
                  class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:col-start-2 disabled:opacity-50"
                >
                  <div v-if="isLoading" class="loading-spinner w-4 h-4 mr-2"></div>
                  {{ modalData.confirmText }}
                </button>
                <button
                  @click="closeModal"
                  :disabled="isLoading"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 disabled:opacity-50"
                >
                  {{ modalData.cancelText || 'Отмена' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

const store = useStore()
const isLoading = ref(false)

const isOpen = computed(() => store.state.modals?.alertModal?.isOpen || false)
const modalData = computed(() => store.state.modals?.alertModal?.data || {})

const modalIcon = computed(() => {
  const icons = {
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    success: CheckCircleIcon,
    error: XCircleIcon
  }
  return icons[modalData.value.type as keyof typeof icons] || InformationCircleIcon
})

const iconWrapperClasses = computed(() => {
  const classes = {
    warning: 'bg-yellow-100',
    info: 'bg-blue-100',
    success: 'bg-green-100',
    error: 'bg-red-100'
  }
  return classes[modalData.value.type as keyof typeof classes] || classes.info
})

const iconClasses = computed(() => {
  const classes = {
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600'
  }
  return classes[modalData.value.type as keyof typeof classes] || classes.info
})

const confirmButtonClasses = computed(() => {
  const classes = {
    warning: 'bg-yellow-600 text-white hover:bg-yellow-500 focus-visible:outline-yellow-600',
    info: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600',
    success: 'bg-green-600 text-white hover:bg-green-500 focus-visible:outline-green-600',
    error: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600'
  }
  return classes[modalData.value.type as keyof typeof classes] || classes.info
})

const closeModal = () => {
  if (!isLoading.value) {
    store.commit('modals/CLOSE_ALERT_MODAL')
  }
}

const handleConfirm = async () => {
  if (modalData.value.onConfirm) {
    isLoading.value = true
    try {
      await modalData.value.onConfirm()
      closeModal()
    } catch (error) {
      console.error('Modal confirm error:', error)
    } finally {
      isLoading.value = false
    }
  } else {
    closeModal()
  }
}
</script>