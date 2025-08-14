<template>
  <Modal 
    :is-open="isOpen" 
    :title="product?.name" 
    size="lg"
    @close="close"
  >
      
    <div v-if="product" class="quick-view-content">
      <div class="product-image">
        <img :src="product.image || '/placeholder.jpg'" :alt="product.name">
      </div>
      
      <div class="product-details">
        <p class="category">{{ product.category }}</p>
        <p class="price">${{ product.price }}</p>
        <p class="stock">В наличии: {{ product.stock }}</p>
        <p class="description">{{ product.description }}</p>
        
        <div class="quick-actions">
          <div class="quantity-selector">
            <button @click="quantity > 1 && quantity--">-</button>
            <span>{{ quantity }}</span>
            <button @click="quantity < product.stock && quantity++">+</button>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="quick-view-footer">
        <router-link :to="`/product/${product?.id}`" class="btn btn-secondary">
          Подробнее
        </router-link>
        <button @click="addToCart" class="btn btn-primary">
          Добавить в корзину
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { Product } from '../types';
import Modal from './Modal.vue';

const props = defineProps<{
  isOpen: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const store = useStore();
const quantity = ref(1);

const close = () => {
  emit('close');
  quantity.value = 1;
};

const addToCart = () => {
  if (!props.product) return;
  
  for (let i = 0; i < quantity.value; i++) {
    store.commit('ADD_TO_CART', props.product);
  }
  
  store.dispatch('addNotification', {
    type: 'success',
    message: `${props.product.name} добавлен в корзину`
  });
  
  close();
};
</script>

<style scoped>
.quick-view-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.product-image {
  background: var(--bg-secondary);
  border-radius: 12px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price {
  font-size: 1.75rem;
  color: var(--primary);
  font-weight: 700;
  margin: 0;
}

.category {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  margin: 0;
}

.stock {
  color: var(--success);
  font-weight: 500;
  margin: 0;
}

.description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.quantity-selector button {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--primary);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: var(--transition);
}

.quantity-selector button:hover {
  background: var(--primary-dark);
}

.quantity-selector span {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
}

.quick-view-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .quick-view-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .product-image {
    height: 240px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quick-view-footer {
    flex-direction: column;
  }
}
</style>