<template>
  <article 
    class="product-card" 
    @mouseenter="handleMouseEnter" 
    @mouseleave="handleMouseLeave"
    :class="{ 'is-hovered': isHovered, 'out-of-stock': product.stock === 0 }"
  >
    <!-- Изображение товара -->
    <div class="product-image-wrapper">
      <div class="product-image-container">
        <img 
          :src="product.image || '/api/placeholder/300/300'" 
          :alt="product.name" 
          class="product-image"
          loading="lazy"
        >
        
        <!-- Оверлей с действиями -->
        <div class="product-overlay">
          <div class="overlay-actions">
            <button 
              @click="$emit('quick-view', product)" 
              class="overlay-btn"
              title="Быстрый просмотр"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span class="sr-only">Быстрый просмотр</span>
            </button>
            
            <button 
              @click="toggleWishlist" 
              :class="['overlay-btn', { active: isInWishlist }]"
              :title="isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  :d="isInWishlist ? 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' : 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'"
                  :fill="isInWishlist ? 'currentColor' : 'none'"
                />
              </svg>
              <span class="sr-only">{{ isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное' }}</span>
            </button>
          </div>
        </div>
        
        <!-- Бейджи -->
        <div class="product-badges">
          <span v-if="product.isNew" class="badge badge-new">Новинка</span>
          <span v-if="product.discount" class="badge badge-sale">-{{ product.discount }}%</span>
          <span v-if="product.stock === 0" class="badge badge-out-of-stock">Нет в наличии</span>
          <span v-else-if="product.stock < 5" class="badge badge-low-stock">Осталось {{ product.stock }}</span>
        </div>
      </div>
    </div>
    
    <!-- Информация о товаре -->
    <div class="product-content">
      <!-- Категория и рейтинг -->
      <div class="product-header">
        <span class="product-category">{{ product.category }}</span>
        <div class="product-rating" v-if="product.rating">
          <div class="stars">
            <span 
              v-for="star in 5" 
              :key="star"
              class="star"
              :class="{ filled: star <= Math.floor(product.rating), half: star === Math.ceil(product.rating) && product.rating % 1 !== 0 }"
            >
              ★
            </span>
          </div>
          <span class="rating-text">{{ product.rating }} ({{ product.reviewCount || 0 }})</span>
        </div>
      </div>
      
      <!-- Название товара -->
      <h3 class="product-title">
        <router-link :to="`/product/${product.id}`" class="product-link">
          {{ product.name }}
        </router-link>
      </h3>
      
      <!-- Описание -->
      <p class="product-description">{{ product.description }}</p>
      
      <!-- Цена -->
      <div class="product-pricing">
        <div class="price-current">
          {{ formatPrice(product.price) }}
        </div>
        <div v-if="product.oldPrice" class="price-old">
          {{ formatPrice(product.oldPrice) }}
        </div>
        <div v-if="product.discount" class="price-savings">
          Экономия {{ formatPrice(product.oldPrice - product.price) }}
        </div>
      </div>
      
      <!-- Действия -->
      <div class="product-actions">
        <button 
          @click="handleAddToCart" 
          :disabled="product.stock === 0 || isAddingToCart"
          class="btn btn-primary add-to-cart-btn"
        >
          <svg v-if="!isAddingToCart" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
          </svg>
          <div v-else class="spinner"></div>
          <span>{{ product.stock === 0 ? 'Нет в наличии' : (isAddingToCart ? 'Добавление...' : 'В корзину') }}</span>
        </button>
        
        <button 
          @click="toggleCompare" 
          :class="['btn', 'btn-secondary', 'compare-btn', { active: isInCompare }]"
          :title="isInCompare ? 'Удалить из сравнения' : 'Добавить к сравнению'"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span class="sr-only">{{ isInCompare ? 'Удалить из сравнения' : 'Добавить к сравнению' }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { Product } from '../types';

const props = defineProps<{
  product: Product;
}>();

const emit = defineEmits<{
  'add-to-cart': [product: Product];
  'quick-view': [product: Product];
}>();

const store = useStore();
const isHovered = ref(false);
const isAddingToCart = ref(false);

const isInWishlist = computed(() => store.getters.isInWishlist(props.product.id));
const isInCompare = computed(() => store.getters.isInCompare(props.product.id));

// Форматирование цены
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price);
};

// Обработчики событий мыши
const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
};

// Добавление в корзину с анимацией
const handleAddToCart = async () => {
  if (props.product.stock === 0 || isAddingToCart.value) return;
  
  isAddingToCart.value = true;
  
  try {
    // Имитация задержки для UX
    await new Promise(resolve => setTimeout(resolve, 500));
    emit('add-to-cart', props.product);
  } finally {
    isAddingToCart.value = false;
  }
};

// Переключение избранного
const toggleWishlist = () => {
  if (!store.getters.isAuthenticated) {
    store.dispatch('addNotification', { 
      type: 'warning', 
      message: 'Войдите в систему для добавления в избранное' 
    });
    return;
  }
  
  if (isInWishlist.value) {
    store.commit('REMOVE_FROM_WISHLIST', props.product.id);
    store.dispatch('addNotification', { 
      type: 'info', 
      message: `${props.product.name} удален из избранного` 
    });
  } else {
    store.commit('ADD_TO_WISHLIST', props.product);
    store.dispatch('addNotification', { 
      type: 'success', 
      message: `${props.product.name} добавлен в избранное` 
    });
  }
};

// Переключение сравнения
const toggleCompare = () => {
  if (isInCompare.value) {
    store.commit('REMOVE_FROM_COMPARE', props.product.id);
    store.dispatch('addNotification', { 
      type: 'info', 
      message: `${props.product.name} удален из сравнения` 
    });
  } else {
    if (store.getters.compareCount >= 4) {
      store.dispatch('addNotification', { 
        type: 'error', 
        message: 'Можно сравнивать не более 4 товаров' 
      });
      return;
    }
    store.commit('ADD_TO_COMPARE', props.product);
    store.dispatch('addNotification', { 
      type: 'success', 
      message: `${props.product.name} добавлен к сравнению` 
    });
  }
};
</script>

<style scoped>
/* Основная карточка товара */
.product-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: var(--transition-slow);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-2xl);
  border-color: var(--border-strong);
}

.product-card.out-of-stock {
  opacity: 0.7;
}

.product-card.out-of-stock .product-image {
  filter: grayscale(0.5);
}

/* Контейнер изображения */
.product-image-wrapper {
  position: relative;
  overflow: hidden;
}

.product-image-container {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-slow);
}

.product-card.is-hovered .product-image {
  transform: scale(1.08);
}

/* Оверлей с действиями */
.product-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
  backdrop-filter: blur(2px);
}

.product-card.is-hovered .product-overlay {
  opacity: 1;
  visibility: visible;
}

.overlay-actions {
  display: flex;
  gap: var(--space-3);
  transform: translateY(20px);
  transition: var(--transition);
}

.product-card.is-hovered .overlay-actions {
  transform: translateY(0);
}

.overlay-btn {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-bounce);
  backdrop-filter: blur(10px);
}

.overlay-btn:hover {
  transform: scale(1.1);
  background: var(--white);
  box-shadow: var(--shadow-lg);
}

.overlay-btn.active {
  background: var(--primary);
  color: var(--text-inverse);
}

.overlay-btn.active:hover {
  background: var(--primary-dark);
}

/* Бейджи */
.product-badges {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 10;
}

.badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-new {
  background: linear-gradient(135deg, var(--success), #059669);
  color: var(--text-inverse);
}

.badge-sale {
  background: linear-gradient(135deg, var(--danger), #dc2626);
  color: var(--text-inverse);
}

.badge-out-of-stock {
  background: rgba(107, 114, 128, 0.9);
  color: var(--text-inverse);
}

.badge-low-stock {
  background: linear-gradient(135deg, var(--warning), #d97706);
  color: var(--text-inverse);
}

/* Контент карточки */
.product-content {
  padding: var(--space-6);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Заголовок с категорией и рейтингом */
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.product-category {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: var(--bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
}

.product-rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  color: var(--gray-300);
  font-size: var(--font-size-sm);
  transition: var(--transition-fast);
}

.star.filled {
  color: #fbbf24;
}

.star.half {
  background: linear-gradient(90deg, #fbbf24 50%, var(--gray-300) 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rating-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-weight-medium);
}

/* Название товара */
.product-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.product-link {
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-link:hover {
  color: var(--primary);
  text-decoration: none;
}

/* Описание */
.product-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Цены */
.product-pricing {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.price-current {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
  line-height: 1;
}

.price-old {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  text-decoration: line-through;
  font-weight: var(--font-weight-medium);
}

.price-savings {
  font-size: var(--font-size-xs);
  color: var(--success);
  font-weight: var(--font-weight-medium);
}

/* Действия */
.product-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: auto;
}

.add-to-cart-btn {
  flex: 1;
  font-weight: var(--font-weight-semibold);
  position: relative;
}

.add-to-cart-btn:disabled {
  background: var(--gray-200);
  color: var(--text-tertiary);
  border-color: var(--gray-200);
}

.compare-btn {
  width: 48px;
  height: 48px;
  padding: 0;
  flex-shrink: 0;
}

.compare-btn.active {
  background: var(--primary);
  color: var(--text-inverse);
  border-color: var(--primary);
}

/* Адаптивность */
@media (max-width: 768px) {
  .product-image-container {
    height: 240px;
  }
  
  .product-content {
    padding: var(--space-4);
    gap: var(--space-3);
  }
  
  .product-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .compare-btn {
    width: 100%;
    height: 44px;
  }
  
  .overlay-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .product-image-container {
    height: 200px;
  }
  
  .product-content {
    padding: var(--space-3);
  }
  
  .product-badges {
    top: var(--space-2);
    left: var(--space-2);
  }
}

/* Анимации загрузки */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.add-to-cart-btn .spinner {
  width: 16px;
  height: 16px;
}
</style>