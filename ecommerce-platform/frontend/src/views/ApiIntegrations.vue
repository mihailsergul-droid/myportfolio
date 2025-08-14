<template>
  <div class="api-integrations">
    <div class="page-header">
      <h2>API Интеграции</h2>
      <button @click="testAllConnections" class="btn btn-primary" :disabled="testing">
        {{ testing ? 'Тестирование...' : 'Тест всех подключений' }}
      </button>
    </div>

    <div class="integrations-grid">
      <div v-for="integration in integrations" :key="integration.id" class="integration-card">
        <div class="integration-header">
          <div class="integration-info">
            <div class="integration-icon" :class="integration.status">
              <svg v-if="integration.type === 'payment'" width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
              </svg>
              <svg v-else-if="integration.type === 'shipping'" width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L15 6.586A1 1 0 0014.414 6H14z"/>
              </svg>
              <svg v-else width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z"/>
              </svg>
            </div>
            <div>
              <h3>{{ integration.name }}</h3>
              <p>{{ integration.description }}</p>
            </div>
          </div>
          <div class="integration-status">
            <span :class="['status-badge', integration.status]">
              {{ getStatusText(integration.status) }}
            </span>
          </div>
        </div>

        <div class="integration-config">
          <div v-for="field in integration.config" :key="field.key" class="config-field">
            <label>{{ field.label }}</label>
            <input 
              v-if="field.type === 'password'"
              v-model="field.value"
              type="password"
              :placeholder="field.placeholder"
              class="input"
            >
            <input 
              v-else-if="field.type === 'url'"
              v-model="field.value"
              type="url"
              :placeholder="field.placeholder"
              class="input"
            >
            <input 
              v-else
              v-model="field.value"
              type="text"
              :placeholder="field.placeholder"
              class="input"
            >
          </div>
        </div>

        <div class="integration-actions">
          <button @click="testConnection(integration)" class="btn btn-secondary" :disabled="integration.testing">
            {{ integration.testing ? 'Тестирование...' : 'Тест подключения' }}
          </button>
          <button @click="saveIntegration(integration)" class="btn btn-primary">
            Сохранить
          </button>
          <button 
            @click="toggleIntegration(integration)" 
            :class="['btn', integration.enabled ? 'btn-danger' : 'btn-success']"
          >
            {{ integration.enabled ? 'Отключить' : 'Включить' }}
          </button>
        </div>

        <div v-if="integration.lastTest" class="integration-test-result">
          <div class="test-info">
            <span class="test-time">Последний тест: {{ formatDate(integration.lastTest.timestamp) }}</span>
            <span :class="['test-status', integration.lastTest.success ? 'success' : 'error']">
              {{ integration.lastTest.success ? 'Успешно' : 'Ошибка' }}
            </span>
          </div>
          <div v-if="integration.lastTest.message" class="test-message">
            {{ integration.lastTest.message }}
          </div>
        </div>
      </div>
    </div>

    <div class="webhooks-section">
      <h3>Webhook URLs</h3>
      <div class="webhooks-list">
        <div v-for="webhook in webhooks" :key="webhook.event" class="webhook-item">
          <div class="webhook-info">
            <span class="webhook-event">{{ webhook.event }}</span>
            <code class="webhook-url">{{ webhook.url }}</code>
          </div>
          <button @click="copyWebhookUrl(webhook.url)" class="btn btn-sm">Копировать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  value: string;
  placeholder: string;
}

interface TestResult {
  timestamp: string;
  success: boolean;
  message?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'payment' | 'shipping' | 'analytics';
  status: 'connected' | 'disconnected' | 'error';
  enabled: boolean;
  testing?: boolean;
  config: ConfigField[];
  lastTest?: TestResult;
}

const store = useStore();
const testing = ref(false);

const integrations = ref<Integration[]>([
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Платежная система для приема онлайн-платежей',
    type: 'payment',
    status: 'disconnected',
    enabled: false,
    config: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', value: '', placeholder: 'pk_test_...' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', value: '', placeholder: 'sk_test_...' },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', value: '', placeholder: 'whsec_...' }
    ]
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Популярная платежная система',
    type: 'payment',
    status: 'disconnected',
    enabled: false,
    config: [
      { key: 'clientId', label: 'Client ID', type: 'text', value: '', placeholder: 'AYSq3RDGsmBLJE-otTkBtM-jBRd1TCQwFf9RGfwddNXWz0uFU9ztymylOhRS' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', value: '', placeholder: 'EGnHDxD_qRPdaLdHgGYQfBSqpDMvA6ET2y5iLiGdP0NdqQzjrxOgzQbVjdSK' }
    ]
  },
  {
    id: 'dhl',
    name: 'DHL',
    description: 'Международная служба доставки',
    type: 'shipping',
    status: 'disconnected',
    enabled: false,
    config: [
      { key: 'apiKey', label: 'API Key', type: 'password', value: '', placeholder: 'demo-key' },
      { key: 'accountNumber', label: 'Account Number', type: 'text', value: '', placeholder: '123456789' }
    ]
  },
  {
    id: 'analytics',
    name: 'Google Analytics',
    description: 'Веб-аналитика для отслеживания посетителей',
    type: 'analytics',
    status: 'disconnected',
    enabled: false,
    config: [
      { key: 'trackingId', label: 'Tracking ID', type: 'text', value: '', placeholder: 'GA_MEASUREMENT_ID' },
      { key: 'apiSecret', label: 'API Secret', type: 'password', value: '', placeholder: 'API_SECRET' }
    ]
  }
]);

const webhooks = ref([
  { event: 'order.created', url: `${window.location.origin}/api/webhooks/order-created` },
  { event: 'payment.completed', url: `${window.location.origin}/api/webhooks/payment-completed` },
  { event: 'shipping.updated', url: `${window.location.origin}/api/webhooks/shipping-updated` }
]);

const getStatusText = (status: string) => {
  const statusMap = {
    connected: 'Подключено',
    disconnected: 'Отключено',
    error: 'Ошибка'
  };
  return statusMap[status] || status;
};

const testConnection = async (integration: Integration) => {
  integration.testing = true;
  
  try {
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const hasRequiredFields = integration.config.every(field => 
      field.key.includes('secret') || field.value.trim() !== ''
    );
    
    const success = hasRequiredFields && Math.random() > 0.3;
    
    integration.lastTest = {
      timestamp: new Date().toISOString(),
      success,
      message: success ? 'Подключение успешно' : 'Проверьте настройки API'
    };
    
    integration.status = success ? 'connected' : 'error';
    
    store.dispatch('addNotification', {
      type: success ? 'success' : 'error',
      message: `${integration.name}: ${integration.lastTest.message}`
    });
  } catch (error) {
    integration.status = 'error';
    integration.lastTest = {
      timestamp: new Date().toISOString(),
      success: false,
      message: 'Ошибка подключения'
    };
  } finally {
    integration.testing = false;
  }
};

const testAllConnections = async () => {
  testing.value = true;
  
  for (const integration of integrations.value.filter(i => i.enabled)) {
    await testConnection(integration);
  }
  
  testing.value = false;
};

const saveIntegration = (integration: Integration) => {
  const configData = integration.config.reduce((acc, field) => {
    acc[field.key] = field.value;
    return acc;
  }, {} as Record<string, string>);
  
  localStorage.setItem(`integration_${integration.id}`, JSON.stringify(configData));
  
  store.dispatch('addNotification', {
    type: 'success',
    message: `Настройки ${integration.name} сохранены`
  });
};

const toggleIntegration = (integration: Integration) => {
  integration.enabled = !integration.enabled;
  
  if (!integration.enabled) {
    integration.status = 'disconnected';
  }
  
  store.dispatch('addNotification', {
    type: 'info',
    message: `${integration.name} ${integration.enabled ? 'включен' : 'отключен'}`
  });
};

const copyWebhookUrl = (url: string) => {
  navigator.clipboard.writeText(url);
  store.dispatch('addNotification', {
    type: 'success',
    message: 'URL скопирован в буфер обмена'
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU');
};

const loadSavedConfigs = () => {
  integrations.value.forEach(integration => {
    const saved = localStorage.getItem(`integration_${integration.id}`);
    if (saved) {
      const config = JSON.parse(saved);
      integration.config.forEach(field => {
        if (config[field.key]) {
          field.value = config[field.key];
        }
      });
    }
  });
};

onMounted(() => {
  loadSavedConfigs();
});
</script>

<style scoped>
.api-integrations {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.integration-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.integration-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.integration-info {
  display: flex;
  gap: 16px;
}

.integration-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.integration-icon.connected {
  background: rgb(16 185 129 / 0.1);
  color: var(--success);
}

.integration-icon.disconnected {
  background: rgb(156 163 175 / 0.1);
  color: var(--text-secondary);
}

.integration-icon.error {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger);
}

.integration-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.integration-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.connected {
  background: rgb(16 185 129 / 0.1);
  color: var(--success);
}

.status-badge.disconnected {
  background: rgb(156 163 175 / 0.1);
  color: var(--text-secondary);
}

.status-badge.error {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger);
}

.integration-config {
  margin-bottom: 20px;
}

.config-field {
  margin-bottom: 16px;
}

.config-field label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--text-primary);
}

.integration-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.integration-test-result {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 0.875rem;
}

.test-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.test-time {
  color: var(--text-secondary);
}

.test-status.success {
  color: var(--success);
  font-weight: 500;
}

.test-status.error {
  color: var(--danger);
  font-weight: 500;
}

.test-message {
  color: var(--text-primary);
}

.webhooks-section {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.webhooks-section h3 {
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.webhooks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.webhook-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.webhook-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webhook-event {
  font-weight: 500;
  color: var(--text-primary);
}

.webhook-url {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 2px 4px;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .integrations-grid {
    grid-template-columns: 1fr;
  }
  
  .integration-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .integration-actions {
    flex-direction: column;
  }
  
  .webhook-item {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>