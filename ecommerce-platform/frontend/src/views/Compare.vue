<template>
  <div class="compare">
    <h2>Сравнение товаров</h2>
    
    <div v-if="compareItems.length === 0" class="empty-compare">
      <p>Нет товаров для сравнения</p>
      <router-link to="/" class="btn">Перейти к покупкам</router-link>
    </div>
    
    <div v-else class="compare-table">
      <div class="table-header">
        <div class="header-cell"></div>
        <div v-for="item in compareItems" :key="item.id" class="header-cell">
          <div class="product-header">
            <img :src="item.image || '/placeholder.jpg'" :alt="item.name">
            <h4>{{ item.name }}</h4>
            <button @click="removeFromCompare(item.id)" class="remove-btn">×</button>
          </div>
        </div>
      </div>
      
      <div class="table-row">
        <div class="row-label">Цена</div>
        <div v-for="item in compareItems" :key="item.id" class="table-cell">
          <span class="price">${{ item.price }}</span>
        </div>
      </div>
      
      <div class="table-row">
        <div class="row-label">Категория</div>
        <div v-for="item in compareItems" :key="item.id" class="table-cell">
          {{ item.category }}
        </div>
      </div>
      
      <div class="table-row">
        <div class="row-label">В наличии</div>
        <div v-for="item in compareItems" :key="item.id" class="table-cell">
          <span :class="['stock', { available: item.stock > 0 }]">
            {{ item.stock > 0 ? `${item.stock} шт.` : 'Нет в наличии' }}
          </span>
        </div>
      </div>
      
      <div class="table-row">
        <div class="row-label">Описание</div>
        <div v-for="item in compareItems" :key="item.id" class="table-cell">
          {{ item.description || 'Нет описания' }}
        </div>
      </div>
      
      <div class="table-row">
        <div class="row-label">Действия</div>
        <div v-for="item in compareItems" :key="item.id" class="table-cell">
          <div class="action-buttons">
            <button @click="addToCart(item)" class="btn btn-primary btn-sm">В корзину</button>
            <router-link :to="`/product/${item.id}`" class="btn btn-sm">Подробнее</router-link>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="compareItems.length > 0" class="compare-actions">
      <button @click="clearCompare" class="btn btn-danger">Очистить сравнение</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { Product } from '../types';

const store = useStore();
const compareItems = computed(() => store.state.compareItems || []);

const addToCart = (product: Product) => {
  if (!store.getters.isAuthenticated) {
    store.dispatch('addNotification', { type: 'error', message: 'Войдите для добавления в корзину' });
    return;
  }
  store.commit('ADD_TO_CART', product);
  store.dispatch('addNotification', { type: 'success', message: 'Товар добавлен в корзину' });
};

const removeFromCompare = (productId: number) => {
  store.commit('REMOVE_FROM_COMPARE', productId);
  store.dispatch('addNotification', { type: 'info', message: 'Товар удален из сравнения' });
};

const clearCompare = () => {
  store.commit('CLEAR_COMPARE');
  store.dispatch('addNotification', { type: 'info', message: 'Сравнение очищено' });
};
</script>

<style scoped>
.compare {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.empty-compare {
  text-align: center;
  padding: 60px 20px;
}

.compare-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 200px repeat(auto-fit, minmax(250px, 1fr));
  background: #f8f9fa;
  border-bottom: 2px solid #ddd;
}

.header-cell {
  padding: 15px;
  border-right: 1px solid #ddd;
}

.header-cell:last-child {
  border-right: none;
}

.product-header {
  text-align: center;
  position: relative;
}

.product-header img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.product-header h4 {
  margin-bottom: 0;
  font-size: 1rem;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-row {
  display: grid;
  grid-template-columns: 200px repeat(auto-fit, minmax(250px, 1fr));
  border-bottom: 1px solid #ddd;
}

.table-row:last-child {
  border-bottom: none;
}

.row-label {
  padding: 15px;
  background: #f8f9fa;
  font-weight: bold;
  border-right: 1px solid #ddd;
  display: flex;
  align-items: center;
}

.table-cell {
  padding: 15px;
  border-right: 1px solid #ddd;
  display: flex;
  align-items: center;
}

.table-cell:last-child {
  border-right: none;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #007bff;
}

.stock.available {
  color: #28a745;
}

.stock:not(.available) {
  color: #dc3545;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.action-buttons .btn {
  width: 100%;
}

.compare-actions {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .compare-table {
    overflow-x: auto;
  }
  
  .table-header,
  .table-row {
    min-width: 800px;
  }
}
</style>