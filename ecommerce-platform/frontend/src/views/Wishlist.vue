<template>
  <div>
    <h2>Избранное</h2>
    
    <div v-if="wishlist.length === 0" class="empty-wishlist">
      <p>Список избранного пуст</p>
      <router-link to="/" class="btn">Перейти к покупкам</router-link>
    </div>
    
    <div v-else class="wishlist-content">
      <div class="products">
        <ProductCard 
          v-for="product in wishlist" 
          :key="product.id" 
          :product="product"
          @add-to-cart="addToCart"
        >
          <template #actions>
            <button @click="removeFromWishlist(product.id)" class="btn btn-danger btn-sm">
              Удалить из избранного
            </button>
          </template>
        </ProductCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import ProductCard from '../components/ProductCard.vue';
import { Product } from '../types';

const store = useStore();
const wishlist = computed(() => store.state.wishlist);

const addToCart = (product: Product) => {
  store.commit('ADD_TO_CART', product);
  store.dispatch('addNotification', { type: 'success', message: 'Товар добавлен в корзину' });
};

const removeFromWishlist = (productId: number) => {
  store.commit('REMOVE_FROM_WISHLIST', productId);
  store.dispatch('addNotification', { type: 'info', message: 'Товар удален из избранного' });
};
</script>

<style scoped>
.empty-wishlist {
  text-align: center;
  padding: 60px 20px;
}

.wishlist-content {
  margin-top: 20px;
}
</style>