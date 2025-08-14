<template>
  <div>
    <h2>Корзина</h2>
    
    <div v-if="cart.length === 0" class="empty-cart">
      <p>Корзина пуста</p>
      <router-link to="/" class="btn">Продолжить покупки</router-link>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cart" :key="item.id" class="cart-item">
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-price">Цена: ${{ item.price }}</p>
          </div>
          <div class="item-controls">
            <div class="quantity-controls">
              <button @click="updateQuantity(item.id, item.quantity - 1)" class="btn btn-sm">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button @click="updateQuantity(item.id, item.quantity + 1)" class="btn btn-sm">+</button>
            </div>
            <div class="item-total">
              ${{ (item.price * item.quantity).toFixed(2) }}
            </div>
            <button @click="removeItem(item.id)" class="btn btn-danger btn-sm">Удалить</button>
          </div>
        </div>
      </div>
      
      <div class="cart-summary">
        <div class="summary-row">
          <span>Количество товаров: {{ cartItemsCount }}</span>
        </div>
        <div class="summary-row total">
          <span>Итого: ${{ cartTotal.toFixed(2) }}</span>
        </div>
        <router-link to="/checkout" class="btn btn-primary checkout-btn">
          Оформить заказ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const cart = computed(() => store.state.cart);
const cartTotal = computed(() => store.getters.cartTotal);
const cartItemsCount = computed(() => store.getters.cartItemsCount);

const updateQuantity = (productId: number, quantity: number) => {
  if (quantity <= 0) {
    removeItem(productId);
  } else {
    store.commit('UPDATE_CART_QUANTITY', { productId, quantity });
  }
};

const removeItem = (productId: number) => {
  store.commit('REMOVE_FROM_CART', productId);
};


</script>

<style scoped>
.empty-cart {
  text-align: center;
  padding: 60px 20px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  margin-top: 20px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.item-info h3 {
  margin-bottom: 5px;
}

.item-price {
  color: #666;
  margin: 0;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.item-total {
  font-weight: bold;
  color: #007bff;
  min-width: 80px;
  text-align: right;
}

.cart-summary {
  background: white;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: fit-content;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  border-top: 1px solid #ddd;
  padding-top: 15px;
  margin-top: 15px;
}

.checkout-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  font-size: 1.1rem;
}

.btn-danger {
  background: #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-primary {
  background: #28a745;
}

.btn-primary:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .item-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>