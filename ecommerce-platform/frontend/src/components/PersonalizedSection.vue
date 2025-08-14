<template>
  <div v-if="personalizedProducts.length > 0" class="personalized-section">
    <div class="section-header">
      <div class="header-content">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <h3>Рекомендации для вас</h3>
          <p>На основе ваших предпочтений</p>
        </div>
      </div>
      <button @click="refreshRecommendations" class="refresh-btn">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
        </svg>
      </button>
    </div>
    
    <div class="products-carousel">
      <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * slideWidth}px)` }">
        <div 
          v-for="product in personalizedProducts" 
          :key="product.id" 
          class="carousel-item"
        >
          <ProductCard 
            :product="product" 
            @add-to-cart="$emit('add-to-cart', $event)"
            @quick-view="$emit('quick-view', $event)"
          />
        </div>
      </div>
      
      <button 
        v-if="canScrollLeft" 
        @click="scrollLeft" 
        class="carousel-btn carousel-btn-left"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
        </svg>
      </button>
      
      <button 
        v-if="canScrollRight" 
        @click="scrollRight" 
        class="carousel-btn carousel-btn-right"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePersonalization } from '../composables/usePersonalization';
import ProductCard from './ProductCard.vue';
import { Product } from '../types';

defineEmits<{
  'add-to-cart': [product: Product];
  'quick-view': [product: Product];
}>();

const { personalizedProducts } = usePersonalization();
const currentSlide = ref(0);
const slideWidth = ref(280);
const itemsPerView = ref(4);

const maxSlides = computed(() => 
  Math.max(0, personalizedProducts.value.length - itemsPerView.value)
);

const canScrollLeft = computed(() => currentSlide.value > 0);
const canScrollRight = computed(() => currentSlide.value < maxSlides.value);

const scrollLeft = () => {
  if (canScrollLeft.value) {
    currentSlide.value--;
  }
};

const scrollRight = () => {
  if (canScrollRight.value) {
    currentSlide.value++;
  }
};

const refreshRecommendations = () => {
  // Force refresh by clearing cache or triggering re-computation
  currentSlide.value = 0;
};

onMounted(() => {
  const updateItemsPerView = () => {
    const width = window.innerWidth;
    if (width < 640) {
      itemsPerView.value = 1;
      slideWidth.value = width - 40;
    } else if (width < 1024) {
      itemsPerView.value = 2;
      slideWidth.value = 280;
    } else if (width < 1280) {
      itemsPerView.value = 3;
      slideWidth.value = 280;
    } else {
      itemsPerView.value = 4;
      slideWidth.value = 280;
    }
  };
  
  updateItemsPerView();
  window.addEventListener('resize', updateItemsPerView);
});
</script>

<style scoped>
.personalized-section {
  margin: 40px 0;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content svg {
  color: var(--primary);
  flex-shrink: 0;
}

.header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.refresh-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.products-carousel {
  position: relative;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  gap: 20px;
  transition: transform 0.3s ease;
}

.carousel-item {
  flex: 0 0 260px;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  z-index: 10;
}

.carousel-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.carousel-btn-left {
  left: -20px;
}

.carousel-btn-right {
  right: -20px;
}

@media (max-width: 768px) {
  .personalized-section {
    padding: 16px;
    margin: 24px 0;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .carousel-item {
    flex: 0 0 calc(100vw - 80px);
  }
  
  .carousel-btn-left {
    left: 10px;
  }
  
  .carousel-btn-right {
    right: 10px;
  }
}
</style>