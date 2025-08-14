<template>
  <div class="hotkey-helper">
    <button @click="showHelp = !showHelp" class="help-trigger" title="Горячие клавиши">
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"/>
      </svg>
    </button>
    
    <transition name="fade">
      <div v-if="showHelp" class="help-overlay" @click="showHelp = false">
        <div class="help-modal" @click.stop>
          <div class="help-header">
            <h3>Горячие клавиши</h3>
            <button @click="showHelp = false" class="close-btn">×</button>
          </div>
          
          <div class="help-content">
            <div class="hotkey-group">
              <h4>Навигация</h4>
              <div class="hotkey-item">
                <div class="hotkey-combo">
                  <kbd>Ctrl</kbd> + <kbd>K</kbd>
                </div>
                <span>Фокус на поиске</span>
              </div>
              <div class="hotkey-item">
                <div class="hotkey-combo">
                  <kbd>G</kbd>
                </div>
                <span>Переключить вид</span>
              </div>
              <div class="hotkey-item">
                <div class="hotkey-combo">
                  <kbd>Ctrl</kbd> + <kbd>R</kbd>
                </div>
                <span>Сбросить фильтры</span>
              </div>
            </div>
            
            <div class="hotkey-group">
              <h4>Общие</h4>
              <div class="hotkey-item">
                <div class="hotkey-combo">
                  <kbd>Esc</kbd>
                </div>
                <span>Закрыть модальные окна</span>
              </div>
              <div class="hotkey-item">
                <div class="hotkey-combo">
                  <kbd>?</kbd>
                </div>
                <span>Показать эту справку</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHotkeys } from '../composables/useHotkeys';

const showHelp = ref(false);

useHotkeys([
  {
    key: '?',
    callback: () => {
      showHelp.value = !showHelp.value;
    }
  }
]);
</script>

<style scoped>
.hotkey-helper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.help-trigger {
  width: 48px;
  height: 48px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: var(--transition);
}

.help-trigger:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
}

.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.help-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border);
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.help-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: var(--transition);
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.help-content {
  padding: 24px;
}

.hotkey-group {
  margin-bottom: 24px;
}

.hotkey-group:last-child {
  margin-bottom: 0;
}

.hotkey-group h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.hotkey-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.hotkey-combo {
  display: flex;
  align-items: center;
  gap: 4px;
}

kbd {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.hotkey-item span {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .hotkey-helper {
    bottom: 80px;
  }
  
  .help-modal {
    width: 95%;
    max-height: 70vh;
  }
  
  .help-header,
  .help-content {
    padding: 16px;
  }
}
</style>