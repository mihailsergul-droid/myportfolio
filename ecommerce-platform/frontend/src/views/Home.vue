<template>
  <div class="home-page">
    <!-- Хлебные крошки -->
    <Breadcrumbs :items="breadcrumbItems" />
    
    <!-- Заголовок страницы -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Каталог товаров
          <span class="hero-accent">премиум качества</span>
        </h1>
        <p class="hero-subtitle">
          Откройте для себя тщательно отобранную коллекцию товаров высочайшего качества
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalProducts }}+</span>
            <span class="stat-label">товаров</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalCategories }}+</span>
            <span class="stat-label">категорий</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">4.8</span>
            <span class="stat-label">рейтинг</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Поиск и фильтры -->
    <section class="search-section">
      <SearchFilter @search="handleSearch" />
    </section>
    
    <!-- Основной контент -->
    <section class="catalog-section">
      <div class="catalog-container">
        <!-- Боковая панель с фильтрами -->
        <aside class="filters-sidebar" :class="{ 'mobile-hidden': !showMobileFilters }">
          <div class="filters-header">
            <h3 class="filters-title">Фильтры</h3>
            <button 
              @click="clearAllFilters" 
              class="btn btn-ghost btn-sm clear-filters-btn"
              v-if="hasActiveFilters"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Очистить
            </button>
          </div>
          <ProductFilters @filters-changed="applyFilters" />
        </aside>
        
        <!-- Основная область с товарами -->
        <main class="products-main">
          <!-- Заголовок каталога -->
          <div class="catalog-header">
            <div class="catalog-info">
              <h2 class="catalog-title">Все товары</h2>
              <p class="catalog-count">
                {{ filteredProducts.length }} 
                {{ getProductsWord(filteredProducts.length) }}
                <span v-if="hasActiveFilters" class="filter-indicator">
                  с применёнными фильтрами
                </span>
              </p>
            </div>
            
            <div class="catalog-controls">
              <!-- Мобильная кнопка фильтров -->
              <button 
                @click="toggleMobileFilters" 
                class="btn btn-secondary mobile-filters-btn"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                Фильтры
                <span v-if="activeFiltersCount > 0" class="filter-count">{{ activeFiltersCount }}</span>
              </button>
              
              <!-- Переключатель вида -->
              <div class="view-toggle-group">
                <button 
                  @click="setViewMode('grid')" 
                  :class="['view-toggle-btn', { active: viewMode === 'grid' }]"
                  title="Сетка"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                  </svg>
                </button>
                <button 
                  @click="setViewMode('list')" 
                  :class="['view-toggle-btn', { active: viewMode === 'list' }]"
                  title="Список"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                  </svg>
                </button>
              </div>
              
              <!-- Сортировка -->
              <select 
                v-model="sortBy" 
                @change="handleSortChange"
                class="sort-select"
              >
                <option value="">По умолчанию</option>
                <option value="name-asc">По названию (А-Я)</option>
                <option value="name-desc">По названию (Я-А)</option>
                <option value="price-asc">По цене (возрастание)</option>
                <option value="price-desc">По цене (убывание)</option>
                <option value="rating-desc">По рейтингу</option>
              </select>
            </div>
          </div>
          
          <!-- Состояния загрузки и пустого результата -->
          <div v-if="loading" class="loading-state">
            <SkeletonLoader type="product-grid" :count="8" />
          </div>
          
          <div v-else-if="paginatedProducts.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
            </div>
            <h3 class="empty-title">Товары не найдены</h3>
            <p class="empty-description">
              К сожалению, по вашему запросу ничего не найдено.
              Попробуйте изменить параметры поиска или фильтры.
            </p>
            <div class="empty-actions">
              <button @click="clearAllFilters" class="btn btn-primary">
                Очистить все фильтры
              </button>
              <button @click="resetSearch" class="btn btn-secondary">
                Сбросить поиск
              </button>
            </div>
          </div>
          
          <!-- Сетка товаров -->
          <div v-else class="products-container">
            <transition-group 
              name="product-fade" 
              tag="div" 
              :class="['products-grid', `view-${viewMode}`]"
            >
              <ProductCard 
                v-for="product in paginatedProducts" 
                :key="product.id" 
                :product="product"
                @add-to-cart="addToCart"
                @quick-view="openQuickView"
                class="product-item"
              />
            </transition-group>
            
            <!-- Пагинация -->
            <div class="pagination-wrapper">
              <Pagination 
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredProducts.length"
                :items-per-page="itemsPerPage"
                @page-change="handlePageChange"
              />
            </div>
          </div>
        </main>
      </div>
    </section>
    
    <!-- Дополнительные секции -->
    <section class="additional-sections">
      <PersonalizedSection 
        @add-to-cart="addToCart"
        @quick-view="openQuickView"
      />
      
      <RecommendedProducts 
        v-if="isVariant('homepage_layout', 'with_popular')"
        type="popular" 
        title="Популярные товары"
        @add-to-cart="addToCart"
        @quick-view="openQuickView"
      />
    </section>
    
    <!-- Модальное окно быстрого просмотра -->
    <QuickView 
      :is-open="quickViewOpen" 
      :product="quickViewProduct"
      @close="closeQuickView"
    />
    
    <!-- Мобильный оверлей для фильтров -->
    <div 
      v-if="showMobileFilters" 
      class="mobile-filters-overlay"
      @click="closeMobileFilters"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { Product } from '../types';
import ProductCard from '../components/ProductCard.vue';
import SearchFilter from '../components/SearchFilter.vue';
import ProductFilters from '../components/ProductFilters.vue';
import RecommendedProducts from '../components/RecommendedProducts.vue';
import QuickView from '../components/QuickView.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import Pagination from '../components/Pagination.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import PersonalizedSection from '../components/PersonalizedSection.vue';
import { useHotkeys } from '../composables/useHotkeys';
import { useABTest } from '../composables/useABTest';
import { useAnalytics } from '../composables/useAnalytics';

const store = useStore();
const { getVariant, isVariant } = useABTest();
const { trackPageView, trackAddToCart } = useAnalytics();

const viewMode = ref('grid');
const quickViewOpen = ref(false);
const quickViewProduct = ref(null);
const currentFilters = ref({});
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = 12;
const sortBy = ref('');
const searchQuery = ref('');
const showMobileFilters = ref(false);

const breadcrumbItems = [
  { label: 'Главная', to: '/' },
  { label: 'Каталог' }
];

// Вычисляемые свойства для статистики
const totalProducts = computed(() => products.value.length);
const totalCategories = computed(() => {
  const categories = new Set(products.value.map(p => p.category));
  return categories.size;
});

const hasActiveFilters = computed(() => {
  return Object.keys(currentFilters.value).some(key => {
    const value = currentFilters.value[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
    }
    return value !== null && value !== undefined && value !== '';
  }) || searchQuery.value.trim() !== '';
});

const activeFiltersCount = computed(() => {
  let count = 0;
  Object.keys(currentFilters.value).forEach(key => {
    const value = currentFilters.value[key];
    if (Array.isArray(value) && value.length > 0) count++;
    else if (typeof value === 'object' && value !== null) {
      if (Object.values(value).some(v => v !== null && v !== undefined && v !== '')) count++;
    }
    else if (value !== null && value !== undefined && value !== '') count++;
  });
  if (searchQuery.value.trim() !== '') count++;
  return count;
});

const products = computed(() => store.getters.filteredProducts);
const filteredProducts = computed(() => {
  let result = [...products.value];
  
  // Применяем поиск
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }
  
  // Применяем фильтры
  if (currentFilters.value.priceRange?.min) {
    result = result.filter(p => p.price >= currentFilters.value.priceRange.min);
  }
  if (currentFilters.value.priceRange?.max) {
    result = result.filter(p => p.price <= currentFilters.value.priceRange.max);
  }
  if (currentFilters.value.categories?.length > 0) {
    result = result.filter(p => currentFilters.value.categories.includes(p.category));
  }
  if (currentFilters.value.brands?.length > 0) {
    result = result.filter(p => currentFilters.value.brands.includes(p.brand));
  }
  if (currentFilters.value.inStockOnly) {
    result = result.filter(p => p.stock > 0);
  }
  if (currentFilters.value.rating) {
    result = result.filter(p => (p.rating || 0) >= currentFilters.value.rating);
  }
  
  // Применяем сортировку
  if (sortBy.value) {
    const [field, order] = sortBy.value.split('-');
    result.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }
  
  return result;
});

const totalPages = computed(() => 
  Math.ceil(filteredProducts.value.length / itemsPerPage)
);

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProducts.value.slice(start, end);
});

// Обработчики событий
const handlePageChange = (page: number) => {
  currentPage.value = page;
  // Плавная прокрутка к началу каталога
  const catalogSection = document.querySelector('.catalog-section');
  if (catalogSection) {
    catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const clearAllFilters = () => {
  currentFilters.value = {};
  searchQuery.value = '';
  sortBy.value = '';
  currentPage.value = 1;
  
  store.dispatch('addNotification', {
    type: 'info',
    message: 'Все фильтры очищены'
  });
};

const resetSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
};

const setViewMode = (mode: 'grid' | 'list') => {
  viewMode.value = mode;
  // Сохраняем предпочтение пользователя
  localStorage.setItem('catalog-view-mode', mode);
};

const applyFilters = (filters) => {
  currentFilters.value = filters;
  currentPage.value = 1; // Сбрасываем на первую страницу при изменении фильтров
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
  currentPage.value = 1;
};

const handleSortChange = () => {
  currentPage.value = 1;
};

// Мобильные фильтры
const toggleMobileFilters = () => {
  showMobileFilters.value = !showMobileFilters.value;
  // Блокируем скролл при открытых фильтрах
  document.body.style.overflow = showMobileFilters.value ? 'hidden' : '';
};

const closeMobileFilters = () => {
  showMobileFilters.value = false;
  document.body.style.overflow = '';
};

// Утилиты
const getProductsWord = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'товаров';
  }
  
  switch (lastDigit) {
    case 1: return 'товар';
    case 2:
    case 3:
    case 4: return 'товара';
    default: return 'товаров';
  }
};

const openQuickView = (product: Product) => {
  quickViewProduct.value = product;
  quickViewOpen.value = true;
};

const closeQuickView = () => {
  quickViewOpen.value = false;
  quickViewProduct.value = null;
};

const addToCart = (product: Product) => {
  if (!store.getters.isAuthenticated) {
    store.dispatch('addNotification', { 
      type: 'error', 
      message: 'Для добавления в корзину необходимо войти в систему' 
    });
    return;
  }
  store.commit('ADD_TO_CART', product);
  trackAddToCart(product.id.toString(), product.name);
  store.dispatch('addNotification', { 
    type: 'success', 
    message: `${product.name} добавлен в корзину` 
  });
};

// Горячие клавиши
useHotkeys([
  {
    key: 'k',
    ctrl: true,
    callback: () => {
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      searchInput?.focus();
    },
    description: 'Фокус на поиске'
  },
  {
    key: 'g',
    callback: () => {
      viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
    },
    description: 'Переключить вид'
  },
  {
    key: 'r',
    ctrl: true,
    callback: () => {
      clearAllFilters();
    },
    description: 'Сбросить фильтры'
  }
]);

// A/B тест для макета главной страницы
getVariant({
  id: 'homepage_layout',
  variants: ['with_popular', 'without_popular'],
  weights: [0.5, 0.5]
});

onMounted(() => {
  trackPageView('Home');
  store.dispatch('fetchProducts');
  
  // Восстанавливаем предпочтения пользователя
  const savedViewMode = localStorage.getItem('catalog-view-mode');
  if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
    viewMode.value = savedViewMode as 'grid' | 'list';
  }
  
  // Закрываем мобильные фильтры при изменении размера экрана
  const handleResize = () => {
    if (window.innerWidth >= 1024 && showMobileFilters.value) {
      closeMobileFilters();
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  // Очистка при размонтировании
  return () => {
    window.removeEventListener('resize', handleResize);
    document.body.style.overflow = '';
  };
});
</script>

<style scoped>
/* Основная страница */
.home-page {
  min-height: 100vh;
}

/* Геройская секция */
.hero-section {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--bg-accent) 100%);
  padding: var(--space-16) 0 var(--space-12);
  margin-bottom: var(--space-8);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23000" opacity="0.02"/><circle cx="75" cy="75" r="1" fill="%23000" opacity="0.02"/><circle cx="50" cy="10" r="1" fill="%23000" opacity="0.02"/><circle cx="10" cy="60" r="1" fill="%23000" opacity="0.02"/><circle cx="90" cy="40" r="1" fill="%23000" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-4) 0;
  line-height: var(--line-height-tight);
}

.hero-accent {
  display: block;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 0.8em;
  margin-top: var(--space-2);
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--space-8) 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-relaxed);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-8);
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  min-width: 120px;
}

.stat-number {
  display: block;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--space-1);
}

/* Поисковая секция */
.search-section {
  margin-bottom: var(--space-8);
}

/* Каталог */
.catalog-section {
  margin-bottom: var(--space-16);
}

.catalog-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-8);
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* Боковая панель фильтров */
.filters-sidebar {
  position: sticky;
  top: var(--space-6);
  height: fit-content;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.filters-sidebar:hover {
  box-shadow: var(--shadow-md);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
}

.filters-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.clear-filters-btn {
  font-size: var(--font-size-xs);
}

/* Основная область */
.products-main {
  min-height: 600px;
}

/* Заголовок каталога */
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
  gap: var(--space-4);
  flex-wrap: wrap;
}

.catalog-info {
  flex: 1;
  min-width: 200px;
}

.catalog-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.catalog-count {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.filter-indicator {
  color: var(--primary);
  font-weight: var(--font-weight-medium);
}

.catalog-controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

/* Мобильная кнопка фильтров */
.mobile-filters-btn {
  display: none;
  position: relative;
}

.filter-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--danger);
  color: var(--text-inverse);
  border-radius: var(--radius-full);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

/* Переключатель вида */
.view-toggle-group {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-toggle-btn {
  padding: var(--space-3);
  border: none;
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.view-toggle-btn.active {
  background: var(--primary);
  color: var(--text-inverse);
}

.view-toggle-btn + .view-toggle-btn {
  border-left: 1px solid var(--border);
}

/* Сортировка */
.sort-select {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition);
  min-width: 200px;
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgb(99 102 241 / 0.1);
}

/* Состояния */
.loading-state {
  margin: var(--space-8) 0;
}

.empty-state {
  text-align: center;
  padding: var(--space-16) var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  margin: var(--space-8) 0;
}

.empty-icon {
  margin-bottom: var(--space-6);
  color: var(--text-tertiary);
  opacity: 0.6;
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-4) 0;
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--space-6) 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-relaxed);
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

/* Сетка товаров */
.products-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.products-grid {
  display: grid;
  gap: var(--space-6);
}

.products-grid.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.products-grid.view-list {
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

.product-item {
  transition: var(--transition-slow);
}

/* Пагинация */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--space-8);
}

/* Дополнительные секции */
.additional-sections {
  margin-top: var(--space-16);
}

/* Мобильные фильтры */
.mobile-filters-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* Анимации */
.product-fade-enter-active,
.product-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.product-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.product-fade-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .catalog-container {
    grid-template-columns: 280px 1fr;
    gap: var(--space-6);
  }
  
  .products-grid.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 1024px) {
  .catalog-container {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .filters-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 320px;
    height: 100vh;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
    border-radius: 0;
  }
  
  .filters-sidebar:not(.mobile-hidden) {
    transform: translateX(0);
  }
  
  .mobile-filters-btn {
    display: flex;
  }
  
  .catalog-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .catalog-controls {
    justify-content: space-between;
  }
  
  .products-grid.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--space-12) 0 var(--space-8);
  }
  
  .hero-stats {
    gap: var(--space-6);
  }
  
  .stat-item {
    min-width: 100px;
  }
  
  .catalog-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-toggle-group {
    order: 2;
  }
  
  .sort-select {
    order: 1;
    min-width: auto;
  }
  
  .mobile-filters-btn {
    order: 0;
  }
  
  .products-grid.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 0 var(--space-3);
  }
  
  .hero-stats {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .catalog-container {
    padding: 0 var(--space-3);
  }
  
  .filters-sidebar {
    width: 100vw;
  }
  
  .products-grid.view-grid {
    grid-template-columns: 1fr;
  }
}
</style>