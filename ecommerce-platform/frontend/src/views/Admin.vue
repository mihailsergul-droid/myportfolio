<template>
  <div>
    <h2>Админ панель</h2>
    
    <div class="admin-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Управление товарами -->
    <div v-if="activeTab === 'products'" class="admin-section">
      <div class="section-header">
        <h3>Управление товарами</h3>
        <button @click="showAddForm = !showAddForm" class="btn">
          {{ showAddForm ? 'Отмена' : 'Добавить товар' }}
        </button>
      </div>
      
      <div v-if="showAddForm" class="add-product-form">
        <h4>Добавить новый товар</h4>
        <form @submit.prevent="addProduct" class="form">
          <div class="form-row">
            <input v-model="newProduct.name" placeholder="Название" required>
            <input v-model.number="newProduct.price" type="number" step="0.01" placeholder="Цена" required>
          </div>
          <div class="form-row">
            <input v-model="newProduct.category" placeholder="Категория" required>
            <input v-model.number="newProduct.stock" type="number" placeholder="Количество" required>
          </div>
          <textarea v-model="newProduct.description" placeholder="Описание" rows="3"></textarea>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Добавление...' : 'Добавить' }}
          </button>
        </form>
      </div>

      <div class="products-table">
        <div class="table-header">
          <span>Название</span>
          <span>Цена</span>
          <span>Категория</span>
          <span>Остаток</span>
          <span>Действия</span>
        </div>
        <div v-for="product in products" :key="product.id" class="table-row">
          <span class="product-name">{{ product.name }}</span>
          <span class="product-price">${{ product.price }}</span>
          <span class="product-category">{{ product.category }}</span>
          <span class="product-stock">{{ product.stock }}</span>
          <div class="product-actions">
            <button @click="editProduct(product)" class="btn btn-sm">Редактировать</button>
            <button @click="deleteProduct(product.id)" class="btn btn-sm btn-danger">Удалить</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Заказы -->
    <div v-if="activeTab === 'orders'" class="admin-section">
      <h3>Управление заказами</h3>
      <div class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <h4>Заказ #{{ order.id }}</h4>
            <span :class="['status', order.status]">{{ getStatusText(order.status) }}</span>
          </div>
          <div class="order-details">
            <p>Сумма: ${{ order.total }}</p>
            <p>Дата: {{ formatDate(order.created_at) }}</p>
            <p>Пользователь ID: {{ order.user_id }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Склад -->
    <div v-if="activeTab === 'inventory'" class="admin-section">
      <InventoryManagement />
    </div>
    
    <!-- Купоны -->
    <div v-if="activeTab === 'coupons'" class="admin-section">
      <CouponManagement />
    </div>
    
    <!-- Пользователи -->
    <div v-if="activeTab === 'users'" class="admin-section">
      <UserManagement />
    </div>
    
    <!-- API Интеграции -->
    <div v-if="activeTab === 'integrations'" class="admin-section">
      <ApiIntegrations />
    </div>
    
    <!-- Массовые операции -->
    <div v-if="activeTab === 'bulk'" class="admin-section">
      <BulkOperations />
    </div>
    
    <!-- Резервные копии -->
    <div v-if="activeTab === 'backup'" class="admin-section">
      <BackupRestore />
    </div>
    
    <!-- Уведомления -->
    <div v-if="activeTab === 'notifications'" class="admin-section">
      <NotificationCenter />
    </div>
    
    <!-- Аналитика -->
    <div v-if="activeTab === 'analytics'" class="admin-section">
      <Analytics />
    </div>
    
    <!-- Логи -->
    <div v-if="activeTab === 'logs'" class="admin-section">
      <SystemLogs />
    </div>
    
    <!-- Настройки -->
    <div v-if="activeTab === 'settings'" class="admin-section">
      <Settings />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { Product } from '../types';
import Analytics from './Analytics.vue';
import UserManagement from './UserManagement.vue';
import SystemLogs from './SystemLogs.vue';
import Settings from './Settings.vue';
import InventoryManagement from './InventoryManagement.vue';
import CouponManagement from './CouponManagement.vue';
import NotificationCenter from './NotificationCenter.vue';
import ApiIntegrations from './ApiIntegrations.vue';
import BulkOperations from './BulkOperations.vue';
import BackupRestore from './BackupRestore.vue';

const store = useStore();
const products = computed(() => store.state.products);
const orders = computed(() => store.state.orders);
const totalRevenue = computed(() => orders.value.reduce((sum, order) => sum + order.total, 0));

const activeTab = ref('products');
const showAddForm = ref(false);
const loading = ref(false);

const tabs = [
  { id: 'products', name: 'Товары' },
  { id: 'orders', name: 'Заказы' },
  { id: 'inventory', name: 'Склад' },
  { id: 'coupons', name: 'Купоны' },
  { id: 'users', name: 'Пользователи' },
  { id: 'integrations', name: 'API Интеграции' },
  { id: 'bulk', name: 'Массовые операции' },
  { id: 'backup', name: 'Резервные копии' },
  { id: 'notifications', name: 'Уведомления' },
  { id: 'analytics', name: 'Аналитика' },
  { id: 'logs', name: 'Логи' },
  { id: 'settings', name: 'Настройки' }
];

const newProduct = reactive({
  name: '',
  price: 0,
  category: '',
  stock: 0,
  description: ''
});

const addProduct = async () => {
  loading.value = true;
  try {
    await store.dispatch('addProduct', { ...newProduct });
    Object.assign(newProduct, { name: '', price: 0, category: '', stock: 0, description: '' });
    showAddForm.value = false;
  } catch (error) {
    alert('Ошибка при добавлении товара');
  } finally {
    loading.value = false;
  }
};

const editProduct = (product: Product) => {
  // Простая реализация редактирования
  const newName = prompt('Новое название:', product.name);
  if (newName && newName !== product.name) {
    store.dispatch('updateProduct', { ...product, name: newName });
  }
};

const deleteProduct = async (id: number) => {
  if (confirm('Вы уверены, что хотите удалить этот товар?')) {
    await store.dispatch('deleteProduct', id);
  }
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
  store.dispatch('fetchProducts');
  store.dispatch('fetchOrders');
});
</script>

<style scoped>
.admin-tabs {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-product-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.products-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.table-row:hover {
  background: #f8f9fa;
}

.product-actions {
  display: flex;
  gap: 5px;
}

.orders-list {
  display: grid;
  gap: 15px;
}

.order-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.analytics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.analytics-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-primary {
  background: #007bff;
}

.btn-primary:hover {
  background: #0056b3;
}



@media (max-width: 768px) {
  .admin-tabs {
    flex-wrap: wrap;
  }
  
  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .order-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}
</style>