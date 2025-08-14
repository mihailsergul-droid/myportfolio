<template>
  <div class="coupon-management">
    <div class="page-header">
      <h2>Управление купонами</h2>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
        </svg>
        Создать купон
      </button>
    </div>

    <div class="coupons-grid">
      <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
        <div class="coupon-header">
          <div class="coupon-code">{{ coupon.code }}</div>
          <div :class="['coupon-status', coupon.status]">{{ coupon.status }}</div>
        </div>
        
        <div class="coupon-details">
          <div class="detail-item">
            <span class="label">Скидка:</span>
            <span class="value">{{ coupon.type === 'percentage' ? coupon.value + '%' : '$' + coupon.value }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Использовано:</span>
            <span class="value">{{ coupon.usedCount }}/{{ coupon.maxUses || '∞' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Истекает:</span>
            <span class="value">{{ formatDate(coupon.expiresAt) }}</span>
          </div>
        </div>
        
        <div class="coupon-actions">
          <button @click="editCoupon(coupon)" class="btn btn-sm">Изменить</button>
          <button @click="toggleCouponStatus(coupon)" class="btn btn-sm" 
                  :class="coupon.status === 'active' ? 'btn-danger' : 'btn-success'">
            {{ coupon.status === 'active' ? 'Деактивировать' : 'Активировать' }}
          </button>
        </div>
      </div>
    </div>

    <Modal :is-open="showCreateModal" title="Создать купон" @close="showCreateModal = false">
      <form @submit.prevent="createCoupon" class="coupon-form">
        <input v-model="newCoupon.code" placeholder="Код купона" class="input" required>
        <select v-model="newCoupon.type" class="input" required>
          <option value="percentage">Процент</option>
          <option value="fixed">Фиксированная сумма</option>
        </select>
        <input v-model.number="newCoupon.value" type="number" placeholder="Значение" class="input" required>
        <input v-model.number="newCoupon.maxUses" type="number" placeholder="Максимум использований" class="input">
        <input v-model="newCoupon.expiresAt" type="date" class="input" required>
      </form>
      <template #footer>
        <button @click="showCreateModal = false" class="btn btn-secondary">Отмена</button>
        <button @click="createCoupon" class="btn btn-primary">Создать</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import Modal from '../components/Modal.vue';

interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses?: number;
  usedCount: number;
  status: 'active' | 'inactive';
  expiresAt: string;
}

const store = useStore();
const coupons = ref<Coupon[]>([]);
const showCreateModal = ref(false);

const newCoupon = reactive({
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 0,
  maxUses: null as number | null,
  expiresAt: ''
});

const createCoupon = () => {
  const coupon: Coupon = {
    id: Date.now(),
    code: newCoupon.code.toUpperCase(),
    type: newCoupon.type,
    value: newCoupon.value,
    maxUses: newCoupon.maxUses || undefined,
    usedCount: 0,
    status: 'active',
    expiresAt: newCoupon.expiresAt
  };
  
  coupons.value.push(coupon);
  showCreateModal.value = false;
  Object.assign(newCoupon, { code: '', type: 'percentage', value: 0, maxUses: null, expiresAt: '' });
  
  store.dispatch('addNotification', {
    type: 'success',
    message: 'Купон создан успешно'
  });
};

const editCoupon = (coupon: Coupon) => {
  console.log('Edit coupon:', coupon);
};

const toggleCouponStatus = (coupon: Coupon) => {
  coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
  store.dispatch('addNotification', {
    type: 'info',
    message: `Купон ${coupon.status === 'active' ? 'активирован' : 'деактивирован'}`
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

onMounted(() => {
  // Mock data
  coupons.value = [
    { id: 1, code: 'SAVE10', type: 'percentage', value: 10, usedCount: 5, maxUses: 100, status: 'active', expiresAt: '2024-12-31' },
    { id: 2, code: 'WELCOME', type: 'fixed', value: 50, usedCount: 12, status: 'active', expiresAt: '2024-06-30' }
  ];
});
</script>

<style scoped>
.coupon-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.coupon-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.coupon-card:hover {
  box-shadow: var(--shadow-md);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.coupon-code {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  font-family: monospace;
}

.coupon-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.coupon-status.active {
  background: rgb(16 185 129 / 0.1);
  color: var(--success);
}

.coupon-status.inactive {
  background: rgb(156 163 175 / 0.1);
  color: var(--text-secondary);
}

.coupon-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.value {
  color: var(--text-primary);
  font-weight: 500;
}

.coupon-actions {
  display: flex;
  gap: 8px;
}

.coupon-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .coupons-grid {
    grid-template-columns: 1fr;
  }
}
</style>