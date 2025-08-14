<template>
  <div class="settings">
    <h2>Настройки системы</h2>
    
    <div class="settings-sections">
      <div class="settings-section">
        <h3>Общие настройки</h3>
        <div class="setting-item">
          <label>Название магазина</label>
          <input v-model="settings.storeName" class="input">
        </div>
        <div class="setting-item">
          <label>Email для уведомлений</label>
          <input v-model="settings.notificationEmail" type="email" class="input">
        </div>
        <div class="setting-item">
          <label>Валюта по умолчанию</label>
          <select v-model="settings.defaultCurrency" class="input">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="RUB">RUB</option>
          </select>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Настройки доставки</h3>
        <div class="setting-item">
          <label>Бесплатная доставка от</label>
          <input v-model.number="settings.freeShippingThreshold" type="number" class="input">
        </div>
        <div class="setting-item">
          <label>Стоимость доставки</label>
          <input v-model.number="settings.shippingCost" type="number" class="input">
        </div>
        <div class="setting-item">
          <label>
            <input v-model="settings.enableShipping" type="checkbox">
            Включить доставку
          </label>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Настройки налогов</h3>
        <div class="setting-item">
          <label>Налоговая ставка (%)</label>
          <input v-model.number="settings.taxRate" type="number" step="0.01" class="input">
        </div>
        <div class="setting-item">
          <label>
            <input v-model="settings.includeTaxInPrice" type="checkbox">
            Включать налог в цену
          </label>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Настройки безопасности</h3>
        <div class="setting-item">
          <label>
            <input v-model="settings.requireEmailVerification" type="checkbox">
            Требовать подтверждение email
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input v-model="settings.enableTwoFactor" type="checkbox">
            Двухфакторная аутентификация
          </label>
        </div>
        <div class="setting-item">
          <label>Время сессии (минуты)</label>
          <input v-model.number="settings.sessionTimeout" type="number" class="input">
        </div>
      </div>
    </div>
    
    <div class="settings-actions">
      <button @click="resetSettings" class="btn btn-secondary">Сбросить</button>
      <button @click="saveSettings" class="btn btn-primary">Сохранить настройки</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useStore } from 'vuex';

interface SystemSettings {
  storeName: string;
  notificationEmail: string;
  defaultCurrency: string;
  freeShippingThreshold: number;
  shippingCost: number;
  enableShipping: boolean;
  taxRate: number;
  includeTaxInPrice: boolean;
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  sessionTimeout: number;
}

const store = useStore();

const settings = reactive<SystemSettings>({
  storeName: 'E-commerce Platform',
  notificationEmail: 'admin@example.com',
  defaultCurrency: 'USD',
  freeShippingThreshold: 100,
  shippingCost: 10,
  enableShipping: true,
  taxRate: 10,
  includeTaxInPrice: false,
  requireEmailVerification: true,
  enableTwoFactor: false,
  sessionTimeout: 60
});

const saveSettings = () => {
  localStorage.setItem('systemSettings', JSON.stringify(settings));
  store.dispatch('addNotification', {
    type: 'success',
    message: 'Настройки сохранены успешно'
  });
};

const resetSettings = () => {
  Object.assign(settings, {
    storeName: 'E-commerce Platform',
    notificationEmail: 'admin@example.com',
    defaultCurrency: 'USD',
    freeShippingThreshold: 100,
    shippingCost: 10,
    enableShipping: true,
    taxRate: 10,
    includeTaxInPrice: false,
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 60
  });
};

onMounted(() => {
  const saved = localStorage.getItem('systemSettings');
  if (saved) {
    Object.assign(settings, JSON.parse(saved));
  }
});
</script>

<style scoped>
.settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings h2 {
  margin-bottom: 32px;
  color: var(--text-primary);
}

.settings-sections {
  display: grid;
  gap: 32px;
  margin-bottom: 32px;
}

.settings-section {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-item label input[type="checkbox"] {
  margin-right: 8px;
}

.settings-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .settings {
    padding: 16px;
  }
  
  .settings-section {
    padding: 16px;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>