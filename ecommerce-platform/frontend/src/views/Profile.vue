<template>
  <div class="profile">
    <h2>Профиль пользователя</h2>
    
    <div class="profile-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Личная информация -->
    <div v-if="activeTab === 'info'" class="tab-content">
      <h3>Личная информация</h3>
      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-row">
          <input v-model="profileData.name" placeholder="Имя" required>
          <input v-model="profileData.phone" placeholder="Телефон">
        </div>
        <input v-model="profileData.email" type="email" placeholder="Email" required>
        <textarea v-model="profileData.address" placeholder="Адрес" rows="3"></textarea>
        <button type="submit" class="btn btn-primary">Сохранить</button>
      </form>
    </div>

    <!-- История заказов -->
    <div v-if="activeTab === 'orders'" class="tab-content">
      <h3>История заказов</h3>
      <div class="orders-list">
        <div v-for="order in userOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <h4>Заказ #{{ order.id }}</h4>
            <span :class="['status', order.status]">{{ getStatusText(order.status) }}</span>
          </div>
          <div class="order-details">
            <p>Сумма: ${{ order.total }}</p>
            <p>Дата: {{ formatDate(order.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Настройки -->
    <div v-if="activeTab === 'settings'" class="tab-content">
      <h3>Настройки</h3>
      <div class="settings-form">
        <label class="checkbox-label">
          <input v-model="settings.emailNotifications" type="checkbox">
          Получать уведомления на email
        </label>
        <label class="checkbox-label">
          <input v-model="settings.smsNotifications" type="checkbox">
          Получать SMS уведомления
        </label>
        <button @click="saveSettings" class="btn btn-primary">Сохранить настройки</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const activeTab = ref('info');

const tabs = [
  { id: 'info', name: 'Личная информация' },
  { id: 'orders', name: 'История заказов' },
  { id: 'settings', name: 'Настройки' }
];

const profileData = reactive({
  name: '',
  email: '',
  phone: '',
  address: ''
});

const settings = reactive({
  emailNotifications: true,
  smsNotifications: false
});

const userOrders = computed(() => store.state.orders);

const updateProfile = () => {
  store.dispatch('addNotification', { type: 'success', message: 'Профиль обновлен' });
};

const saveSettings = () => {
  store.dispatch('addNotification', { type: 'success', message: 'Настройки сохранены' });
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
  if (!dateString) return 'Не указано';
  return new Date(dateString).toLocaleDateString('ru-RU');
};

onMounted(() => {
  const user = store.getters.currentUser;
  if (user) {
    profileData.email = user.email;
  }
  store.dispatch('fetchOrders');
});
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-btn.active {
  border-bottom-color: #007bff;
  color: #007bff;
}

.tab-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 500px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.profile-form input, .profile-form textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 400px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input {
  margin: 0;
}

@media (max-width: 768px) {
  .profile-tabs {
    flex-wrap: wrap;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>