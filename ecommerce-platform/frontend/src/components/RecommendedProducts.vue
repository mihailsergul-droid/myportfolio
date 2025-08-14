<template>
  <div v-if="recommendations.length > 0" class="recommendations">
    <h3>{{ title }}</h3>
    <div class="products-slider">
      <div class="products-grid">
        <ProductCard 
          v-for="product in recommendations" 
          :key="product.id" 
          :product="product"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import ProductCard from './ProductCard.vue';
import { Product } from '../types';

const props = defineProps<{
  type: 'similar' | 'popular' | 'recent';
  productId?: number;
  title?: string;
}>();

defineEmits<{
  'add-to-cart': [product: Product];
}>();

const store = useStore();
const recommendations = ref<Product[]>([]);

const getRecommendations = () => {
  const allProducts = store.state.products;
  
  switch (props.type) {
    case 'similar':
      if (props.productId) {
        const currentProduct = allProducts.find(p => p.id === props.productId);
        if (currentProduct) {
          return allProducts
            .filter(p => p.id !== props.productId && p.category === currentProduct.category)
            .slice(0, 4);
        }
      }
      return [];
    
    case 'popular':
      return allProducts.slice(0, 4);
    
    case 'recent':
      return allProducts.slice(-4).reverse();
    
    default:
      return [];
  }
};

onMounted(() => {
  recommendations.value = getRecommendations();
});
</script>

<style scoped>
.recommendations {
  margin: 30px 0;
}

.recommendations h3 {
  margin-bottom: 20px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
}
</style>