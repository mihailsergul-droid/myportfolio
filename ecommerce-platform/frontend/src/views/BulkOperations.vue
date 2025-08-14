<template>
  <div class="bulk-operations">
    <div class="page-header">
      <h2>Массовые операции</h2>
    </div>

    <div class="operations-grid">
      <div class="operation-card">
        <div class="card-header">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
          </svg>
          <h3>Импорт товаров</h3>
        </div>
        <p>Загрузите JSON файл с товарами для массового добавления</p>
        
        <div class="file-upload">
          <input 
            ref="fileInput" 
            type="file" 
            accept=".json" 
            @change="handleFileUpload" 
            class="file-input"
          >
          <button @click="$refs.fileInput.click()" class="btn btn-primary">
            Выбрать файл
          </button>
          <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
        </div>
        
        <div v-if="importPreview.length > 0" class="import-preview">
          <h4>Предварительный просмотр ({{ importPreview.length }} товаров):</h4>
          <div class="preview-table">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Категория</th>
                  <th>Остаток</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in importPreview.slice(0, 5)" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>${{ item.price }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.stock }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="importPreview.length > 5" class="more-items">
              И еще {{ importPreview.length - 5 }} товаров...
            </div>
          </div>
          
          <div class="import-actions">
            <button @click="importProducts" class="btn btn-success" :disabled="importing">
              {{ importing ? 'Импорт...' : 'Импортировать товары' }}
            </button>
            <button @click="clearPreview" class="btn btn-secondary">Отмена</button>
          </div>
        </div>
      </div>

      <div class="operation-card">
        <div class="card-header">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"/>
          </svg>
          <h3>Экспорт данных</h3>
        </div>
        <p>Экспортируйте данные в различных форматах</p>
        
        <div class="export-options">
          <div class="export-section">
            <h4>Товары</h4>
            <div class="export-buttons">
              <button @click="exportData('products', 'json')" class="btn btn-primary">JSON</button>
              <button @click="exportData('products', 'csv')" class="btn btn-primary">CSV</button>
              <button @click="exportData('products', 'xlsx')" class="btn btn-primary">Excel</button>
            </div>
          </div>
          
          <div class="export-section">
            <h4>Заказы</h4>
            <div class="export-buttons">
              <button @click="exportData('orders', 'json')" class="btn btn-primary">JSON</button>
              <button @click="exportData('orders', 'csv')" class="btn btn-primary">CSV</button>
            </div>
          </div>
          
          <div class="export-section">
            <h4>Пользователи</h4>
            <div class="export-buttons">
              <button @click="exportData('users', 'json')" class="btn btn-primary">JSON</button>
              <button @click="exportData('users', 'csv')" class="btn btn-primary">CSV</button>
            </div>
          </div>
        </div>
      </div>

      <div class="operation-card">
        <div class="card-header">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2V3a2 2 0 012-2 2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
          </svg>
          <h3>Массовые операции</h3>
        </div>
        <p>Выполните операции над несколькими товарами</p>
        
        <div class="bulk-actions">
          <select v-model="bulkAction" class="input">
            <option value="">Выберите действие</option>
            <option value="price-increase">Увеличить цены на %</option>
            <option value="price-decrease">Уменьшить цены на %</option>
            <option value="category-change">Изменить категорию</option>
            <option value="stock-update">Обновить остатки</option>
            <option value="delete">Удалить товары</option>
          </select>
          
          <input 
            v-if="bulkAction && bulkAction !== 'delete'" 
            v-model="bulkValue" 
            :placeholder="getBulkPlaceholder()"
            class="input"
          >
          
          <button 
            @click="executeBulkAction" 
            :disabled="!bulkAction || selectedProducts.length === 0"
            class="btn btn-warning"
          >
            Применить к {{ selectedProducts.length }} товарам
          </button>
        </div>
        
        <div class="product-selection">
          <h4>Выберите товары:</h4>
          <div class="products-list">
            <label v-for="product in products" :key="product.id" class="product-checkbox">
              <input 
                type="checkbox" 
                :value="product.id" 
                v-model="selectedProducts"
              >
              <span>{{ product.name }} - ${{ product.price }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { Product } from '../types';

const store = useStore();
const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const importPreview = ref<Product[]>([]);
const importing = ref(false);
const bulkAction = ref('');
const bulkValue = ref('');
const selectedProducts = ref<number[]>([]);

const products = computed(() => store.state.products);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    selectedFile.value = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          importPreview.value = data;
        } else {
          throw new Error('Invalid format');
        }
      } catch (error) {
        store.dispatch('addNotification', {
          type: 'error',
          message: 'Ошибка чтения файла. Проверьте формат JSON.'
        });
      }
    };
    
    reader.readAsText(file);
  }
};

const importProducts = async () => {
  importing.value = true;
  
  try {
    for (const product of importPreview.value) {
      await store.dispatch('addProduct', product);
    }
    
    store.dispatch('addNotification', {
      type: 'success',
      message: `Успешно импортировано ${importPreview.value.length} товаров`
    });
    
    clearPreview();
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Ошибка при импорте товаров'
    });
  } finally {
    importing.value = false;
  }
};

const clearPreview = () => {
  importPreview.value = [];
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const exportData = (type: string, format: string) => {
  let data: any[] = [];
  let filename = '';
  
  switch (type) {
    case 'products':
      data = products.value;
      filename = 'products';
      break;
    case 'orders':
      data = store.state.orders;
      filename = 'orders';
      break;
    case 'users':
      data = []; // Mock users data
      filename = 'users';
      break;
  }
  
  if (format === 'json') {
    downloadJSON(data, filename);
  } else if (format === 'csv') {
    downloadCSV(data, filename);
  } else if (format === 'xlsx') {
    downloadExcel(data, filename);
  }
  
  store.dispatch('addNotification', {
    type: 'success',
    message: `Данные экспортированы в формате ${format.toUpperCase()}`
  });
};

const downloadJSON = (data: any[], filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
};

const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadBlob(blob, `${filename}.csv`);
};

const downloadExcel = (data: any[], filename: string) => {
  // Simplified Excel export (would need a library like xlsx for full support)
  downloadCSV(data, filename);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

const getBulkPlaceholder = () => {
  switch (bulkAction.value) {
    case 'price-increase':
    case 'price-decrease':
      return 'Процент (например, 10)';
    case 'category-change':
      return 'Новая категория';
    case 'stock-update':
      return 'Новое количество';
    default:
      return '';
  }
};

const executeBulkAction = () => {
  if (!bulkAction.value || selectedProducts.value.length === 0) return;
  
  selectedProducts.value.forEach(productId => {
    const product = products.value.find(p => p.id === productId);
    if (!product) return;
    
    switch (bulkAction.value) {
      case 'price-increase':
        product.price = Math.round(product.price * (1 + parseFloat(bulkValue.value) / 100) * 100) / 100;
        break;
      case 'price-decrease':
        product.price = Math.round(product.price * (1 - parseFloat(bulkValue.value) / 100) * 100) / 100;
        break;
      case 'category-change':
        product.category = bulkValue.value;
        break;
      case 'stock-update':
        product.stock = parseInt(bulkValue.value);
        break;
      case 'delete':
        store.dispatch('deleteProduct', productId);
        break;
    }
    
    if (bulkAction.value !== 'delete') {
      store.dispatch('updateProduct', product);
    }
  });
  
  store.dispatch('addNotification', {
    type: 'success',
    message: `Массовая операция применена к ${selectedProducts.value.length} товарам`
  });
  
  // Reset
  selectedProducts.value = [];
  bulkAction.value = '';
  bulkValue.value = '';
};

onMounted(() => {
  store.dispatch('fetchProducts');
});
</script>

<style scoped>
.bulk-operations {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
}

.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.operation-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-header svg {
  color: var(--primary);
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.file-input {
  display: none;
}

.file-name {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.import-preview {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.preview-table th,
.preview-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.preview-table th {
  background: var(--bg-primary);
  font-weight: 600;
}

.more-items {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 8px;
}

.import-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-section h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
}

.export-buttons {
  display: flex;
  gap: 8px;
}

.export-buttons .btn {
  font-size: 0.875rem;
  padding: 8px 16px;
}

.bulk-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.product-selection {
  max-height: 300px;
  overflow-y: auto;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.product-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition);
}

.product-checkbox:hover {
  background: var(--bg-secondary);
}

.product-checkbox input {
  margin: 0;
}

@media (max-width: 768px) {
  .operations-grid {
    grid-template-columns: 1fr;
  }
  
  .file-upload {
    flex-direction: column;
    align-items: stretch;
  }
  
  .export-buttons {
    flex-direction: column;
  }
  
  .import-actions {
    flex-direction: column;
  }
}
</style>