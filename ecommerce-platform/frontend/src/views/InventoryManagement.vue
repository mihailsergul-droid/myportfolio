<template>
  <div class="inventory-management">
    <div class="page-header">
      <h2>Управление складом</h2>
      <div class="header-actions">
        <button @click="showBulkModal = true" class="btn btn-secondary">Массовое обновление</button>
        <button @click="generateReport" class="btn btn-primary">Отчет по складу</button>
      </div>
    </div>

    <div class="inventory-stats">
      <div class="stat-card">
        <div class="stat-value">{{ totalProducts }}</div>
        <div class="stat-label">Всего товаров</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ lowStockCount }}</div>
        <div class="stat-label">Мало на складе</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">{{ outOfStockCount }}</div>
        <div class="stat-label">Нет в наличии</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${{ totalValue.toFixed(2) }}</div>
        <div class="stat-label">Общая стоимость</div>
      </div>
    </div>

    <div class="inventory-filters">
      <input v-model="searchQuery" placeholder="Поиск товаров..." class="input">
      <select v-model="stockFilter" class="input">
        <option value="">Все товары</option>
        <option value="in-stock">В наличии</option>
        <option value="low-stock">Мало на складе</option>
        <option value="out-of-stock">Нет в наличии</option>
      </select>
    </div>

    <div class="inventory-table">
      <table>
        <thead>
          <tr>
            <th>Товар</th>
            <th>SKU</th>
            <th>Остаток</th>
            <th>Мин. остаток</th>
            <th>Цена</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredInventory" :key="item.id">
            <td>
              <div class="product-info">
                <img :src="item.image || '/placeholder.jpg'" :alt="item.name" class="product-thumb">
                <span>{{ item.name }}</span>
              </div>
            </td>
            <td class="sku">{{ item.sku }}</td>
            <td>
              <input 
                v-model.number="item.stock" 
                @change="updateStock(item)"
                type="number" 
                min="0" 
                class="stock-input"
              >
            </td>
            <td>{{ item.minStock }}</td>
            <td>${{ item.price }}</td>
            <td>
              <span :class="['stock-status', getStockStatus(item)]">
                {{ getStockStatusText(item) }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button @click="adjustStock(item)" class="btn btn-sm">Корректировка</button>
                <button @click="viewHistory(item)" class="btn btn-sm btn-secondary">История</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :is-open="showBulkModal" title="Массовое обновление" @close="showBulkModal = false">
      <div class="bulk-update-form">
        <select v-model="bulkAction" class="input">
          <option value="increase">Увеличить остатки</option>
          <option value="decrease">Уменьшить остатки</option>
          <option value="set">Установить остатки</option>
        </select>
        <input v-model.number="bulkValue" type="number" placeholder="Значение" class="input">
        <div class="selected-count">Выбрано товаров: {{ selectedItems.length }}</div>
      </div>
      <template #footer>
        <button @click="showBulkModal = false" class="btn btn-secondary">Отмена</button>
        <button @click="applyBulkUpdate" class="btn btn-primary">Применить</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import Modal from '../components/Modal.vue';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  price: number;
  image?: string;
}

const store = useStore();
const inventory = ref<InventoryItem[]>([]);
const searchQuery = ref('');
const stockFilter = ref('');
const showBulkModal = ref(false);
const selectedItems = ref<number[]>([]);
const bulkAction = ref('increase');
const bulkValue = ref(0);

const filteredInventory = computed(() => {
  let items = inventory.value;
  
  if (searchQuery.value) {
    items = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  if (stockFilter.value) {
    items = items.filter(item => {
      switch (stockFilter.value) {
        case 'in-stock': return item.stock > item.minStock;
        case 'low-stock': return item.stock <= item.minStock && item.stock > 0;
        case 'out-of-stock': return item.stock === 0;
        default: return true;
      }
    });
  }
  
  return items;
});

const totalProducts = computed(() => inventory.value.length);
const lowStockCount = computed(() => inventory.value.filter(item => item.stock <= item.minStock && item.stock > 0).length);
const outOfStockCount = computed(() => inventory.value.filter(item => item.stock === 0).length);
const totalValue = computed(() => inventory.value.reduce((sum, item) => sum + (item.stock * item.price), 0));

const getStockStatus = (item: InventoryItem) => {
  if (item.stock === 0) return 'out-of-stock';
  if (item.stock <= item.minStock) return 'low-stock';
  return 'in-stock';
};

const getStockStatusText = (item: InventoryItem) => {
  const status = getStockStatus(item);
  switch (status) {
    case 'out-of-stock': return 'Нет в наличии';
    case 'low-stock': return 'Мало на складе';
    case 'in-stock': return 'В наличии';
    default: return '';
  }
};

const updateStock = (item: InventoryItem) => {
  store.dispatch('addNotification', {
    type: 'info',
    message: `Остаток товара "${item.name}" обновлен`
  });
};

const adjustStock = (item: InventoryItem) => {
  const adjustment = prompt('Введите корректировку остатка (+ или -):');
  if (adjustment) {
    const value = parseInt(adjustment);
    item.stock = Math.max(0, item.stock + value);
    updateStock(item);
  }
};

const viewHistory = (item: InventoryItem) => {
  console.log('View history for:', item);
};

const applyBulkUpdate = () => {
  selectedItems.value.forEach(id => {
    const item = inventory.value.find(i => i.id === id);
    if (item) {
      switch (bulkAction.value) {
        case 'increase':
          item.stock += bulkValue.value;
          break;
        case 'decrease':
          item.stock = Math.max(0, item.stock - bulkValue.value);
          break;
        case 'set':
          item.stock = bulkValue.value;
          break;
      }
    }
  });
  
  showBulkModal.value = false;
  store.dispatch('addNotification', {
    type: 'success',
    message: `Массовое обновление применено к ${selectedItems.value.length} товарам`
  });
};

const generateReport = () => {
  const reportData = inventory.value.map(item => ({
    name: item.name,
    sku: item.sku,
    stock: item.stock,
    minStock: item.minStock,
    status: getStockStatusText(item),
    value: item.stock * item.price
  }));
  
  console.log('Inventory Report:', reportData);
  store.dispatch('addNotification', {
    type: 'success',
    message: 'Отчет по складу сгенерирован'
  });
};

onMounted(() => {
  // Mock data
  inventory.value = [
    { id: 1, name: 'Laptop Pro', sku: 'LP001', stock: 15, minStock: 5, price: 1299 },
    { id: 2, name: 'Smartphone X', sku: 'SP002', stock: 3, minStock: 10, price: 699 },
    { id: 3, name: 'Wireless Headphones', sku: 'WH003', stock: 0, minStock: 5, price: 199 },
    { id: 4, name: 'Programming Book', sku: 'PB004', stock: 25, minStock: 5, price: 49 }
  ];
});
</script>

<style scoped>
.inventory-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.inventory-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-card.warning {
  border-left: 4px solid var(--warning);
}

.stat-card.danger {
  border-left: 4px solid var(--danger);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 4px;
}

.inventory-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.inventory-filters .input {
  max-width: 200px;
}

.inventory-table {
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  background: var(--bg-secondary);
  font-weight: 600;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.sku {
  font-family: monospace;
  color: var(--text-secondary);
}

.stock-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  text-align: center;
}

.stock-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.stock-status.in-stock {
  background: rgb(16 185 129 / 0.1);
  color: var(--success);
}

.stock-status.low-stock {
  background: rgb(245 158 11 / 0.1);
  color: var(--warning);
}

.stock-status.out-of-stock {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger);
}

.actions {
  display: flex;
  gap: 8px;
}

.bulk-update-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-count {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .inventory-filters {
    flex-direction: column;
  }
  
  .inventory-filters .input {
    max-width: none;
  }
  
  .inventory-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 800px;
  }
}
</style>