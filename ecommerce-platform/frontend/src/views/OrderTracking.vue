<template>
  <div class="order-tracking">
    <h2>Отслеживание заказа</h2>
    
    <div class="tracking-search">
      <input 
        v-model="trackingNumber" 
        placeholder="Введите номер заказа"
        @keyup.enter="trackOrder"
      >
      <button @click="trackOrder" class="btn btn-primary">Отследить</button>
    </div>
    
    <div v-if="order" class="order-details">
      <div class="order-header">
        <h3>Заказ #{{ order.id }}</h3>
        <span :class="['status-badge', order.status]">{{ getStatusText(order.status) }}</span>
      </div>
      
      <div class="tracking-timeline">
        <div 
          v-for="(step, index) in trackingSteps" 
          :key="step.status"
          :class="['timeline-step', { 
            completed: isStepCompleted(step.status),
            current: order.status === step.status 
          }]"
        >
          <div class="step-icon">
            <i :class="step.icon"></i>
          </div>
          <div class="step-content">
            <h4>{{ step.title }}</h4>
            <p>{{ step.description }}</p>
            <span v-if="step.date" class="step-date">{{ formatDate(step.date) }}</span>
          </div>
        </div>
      </div>
      
      <div class="order-items">
        <h4>Товары в заказе:</h4>
        <div v-for="item in order.items" :key="item.id" class="order-item">
          <span>{{ item.name }} x{{ item.quantity }}</span>
          <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
        <div class="order-total">
          <strong>Итого: ${{ order.total }}</strong>
        </div>
      </div>
      
      <div v-if="order.shipping" class="shipping-info">
        <h4>Информация о доставке:</h4>
        <p><strong>Способ:</strong> {{ order.shipping.name }}</p>
        <p><strong>Адрес:</strong> {{ order.shippingInfo?.address }}</p>
        <p><strong>Получатель:</strong> {{ order.shippingInfo?.name }}</p>
      </div>
    </div>
    
    <div v-else-if="searched && !order" class="no-order">
      <p>Заказ не найден. Проверьте номер заказа.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const trackingNumber = ref('');
const order = ref(null);
const searched = ref(false);

const trackingSteps = [
  { 
    status: 'pending', 
    title: 'Заказ получен', 
    description: 'Ваш заказ принят и ожидает обработки',
    icon: 'fas fa-receipt'
  },
  { 
    status: 'processing', 
    title: 'Обработка', 
    description: 'Заказ обрабатывается и готовится к отправке',
    icon: 'fas fa-cog'
  },
  { 
    status: 'shipped', 
    title: 'Отправлен', 
    description: 'Заказ отправлен и находится в пути',
    icon: 'fas fa-truck'
  },
  { 
    status: 'delivered', 
    title: 'Доставлен', 
    description: 'Заказ успешно доставлен',
    icon: 'fas fa-check-circle'
  }
];

const trackOrder = () => {
  searched.value = true;
  const orders = store.state.orders;
  const foundOrder = orders.find(o => o.id.toString() === trackingNumber.value);
  
  if (foundOrder) {
    order.value = {
      ...foundOrder,
      items: foundOrder.items || [],
      shipping: foundOrder.shipping || { name: 'Стандартная доставка' },
      shippingInfo: foundOrder.shippingInfo || {}
    };
  } else {
    order.value = null;
  }
};

const isStepCompleted = (status: string) => {
  const currentIndex = trackingSteps.findIndex(s => s.status === order.value?.status);
  const stepIndex = trackingSteps.findIndex(s => s.status === status);
  return stepIndex <= currentIndex;
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: 'Ожидает',
    processing: 'Обрабатывается',
    shipped: 'Отправлен',
    delivered: 'Доставлен'
  };
  return statusMap[status] || status;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU');
};
</script>

<style scoped>
.order-tracking {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tracking-search {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tracking-search input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.order-details {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.processing { background: #d1ecf1; color: #0c5460; }
.status-badge.shipped { background: #d4edda; color: #155724; }
.status-badge.delivered { background: #d1ecf1; color: #0c5460; }

.tracking-timeline {
  margin-bottom: 30px;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
  position: relative;
}

.timeline-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 20px;
  top: 40px;
  width: 2px;
  height: 40px;
  background: #ddd;
}

.timeline-step.completed::after {
  background: #28a745;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.timeline-step.completed .step-icon {
  background: #28a745;
}

.timeline-step.current .step-icon {
  background: #007bff;
  animation: pulse 2s infinite;
}

.step-content h4 {
  margin-bottom: 5px;
  color: #333;
}

.step-content p {
  color: #666;
  margin-bottom: 5px;
}

.step-date {
  font-size: 0.9rem;
  color: #999;
}

.order-items {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.order-total {
  border-top: 1px solid #ddd;
  padding-top: 10px;
  text-align: right;
}

.shipping-info {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.shipping-info h4 {
  margin-bottom: 10px;
}

.shipping-info p {
  margin-bottom: 5px;
}

.no-order {
  text-align: center;
  padding: 40px;
  color: #666;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .tracking-search {
    flex-direction: column;
  }
  
  .order-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>