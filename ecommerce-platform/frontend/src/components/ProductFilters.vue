<template>
  <div class="product-filters">
    <!-- Ценовой диапазон -->
    <div class="filter-section">
      <div class="section-header" @click="toggleSection('price')">
        <div class="section-title">
          <div class="section-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
          </div>
          <span>Ценовой диапазон</span>
          <span v-if="activePriceFilter" class="active-indicator">{{ activePriceFilter }}</span>
        </div>
        <div class="section-toggle">
          <svg 
            :class="['chevron-icon', { expanded: expandedSections.price }]" 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
      
      <transition name="slide-down">
        <div v-show="expandedSections.price" class="section-content">
          <div class="price-inputs">
            <div class="price-input-group">
              <label class="input-label">От</label>
              <div class="input-wrapper">
                <input 
                  v-model.number="filters.priceRange.min" 
                  type="number" 
                  placeholder="0"
                  class="price-input"
                  @input="debouncedApplyFilters"
                  min="0"
                >
                <span class="currency">₽</span>
              </div>
            </div>
            
            <div class="price-separator">—</div>
            
            <div class="price-input-group">
              <label class="input-label">До</label>
              <div class="input-wrapper">
                <input 
                  v-model.number="filters.priceRange.max" 
                  type="number" 
                  placeholder="100000"
                  class="price-input"
                  @input="debouncedApplyFilters"
                  min="0"
                >
                <span class="currency">₽</span>
              </div>
            </div>
          </div>
          
          <!-- Быстрые ценовые фильтры -->
          <div class="quick-price-filters">
            <button 
              v-for="range in priceRanges" 
              :key="range.label"
              @click="setPriceRange(range.min, range.max)"
              :class="['quick-price-btn', { active: isPriceRangeActive(range.min, range.max) }]"
            >
              {{ range.label }}
            </button>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- Категории -->
    <div class="filter-section">
      <div class="section-header" @click="toggleSection('categories')">
        <div class="section-title">
          <div class="section-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <span>Категории</span>
          <span v-if="filters.categories.length > 0" class="active-indicator">
            {{ filters.categories.length }}
          </span>
        </div>
        <div class="section-toggle">
          <svg 
            :class="['chevron-icon', { expanded: expandedSections.categories }]" 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
      
      <transition name="slide-down">
        <div v-show="expandedSections.categories" class="section-content">
          <div class="search-categories">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input 
                v-model="categorySearch" 
                type="text" 
                placeholder="Поиск категорий..."
                class="category-search-input"
              >
            </div>
          </div>
          
          <div class="categories-list">
            <label 
              v-for="category in filteredCategories" 
              :key="category.name"
              class="category-item"
            >
              <div class="category-checkbox">
                <input 
                  v-model="filters.categories" 
                  :value="category.name" 
                  type="checkbox" 
                  @change="applyFilters"
                  class="checkbox-input"
                >
                <div class="checkbox-custom">
                  <svg class="check-icon" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <div class="category-info">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.count }}</span>
              </div>
            </label>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- Бренды -->
    <div class="filter-section" v-if="brands.length > 0">
      <div class="section-header" @click="toggleSection('brands')">
        <div class="section-title">
          <div class="section-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
          </div>
          <span>Бренды</span>
          <span v-if="filters.brands.length > 0" class="active-indicator">
            {{ filters.brands.length }}
          </span>
        </div>
        <div class="section-toggle">
          <svg 
            :class="['chevron-icon', { expanded: expandedSections.brands }]" 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
      
      <transition name="slide-down">
        <div v-show="expandedSections.brands" class="section-content">
          <div class="brands-list">
            <label 
              v-for="brand in brands.slice(0, showAllBrands ? brands.length : 5)" 
              :key="brand.name"
              class="brand-item"
            >
              <div class="brand-checkbox">
                <input 
                  v-model="filters.brands" 
                  :value="brand.name" 
                  type="checkbox" 
                  @change="applyFilters"
                  class="checkbox-input"
                >
                <div class="checkbox-custom">
                  <svg class="check-icon" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <div class="brand-info">
                <span class="brand-name">{{ brand.name }}</span>
                <span class="brand-count">{{ brand.count }}</span>
              </div>
            </label>
          </div>
          
          <button 
            v-if="brands.length > 5" 
            @click="showAllBrands = !showAllBrands"
            class="show-more-btn"
          >
            {{ showAllBrands ? 'Скрыть' : `Показать ещё ${brands.length - 5}` }}
          </button>
        </div>
      </transition>
    </div>
    
    <!-- Рейтинг -->
    <div class="filter-section">
      <div class="section-header" @click="toggleSection('rating')">
        <div class="section-title">
          <div class="section-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
          <span>Рейтинг</span>
          <span v-if="filters.rating > 0" class="active-indicator">
            {{ filters.rating }}+ ★
          </span>
        </div>
        <div class="section-toggle">
          <svg 
            :class="['chevron-icon', { expanded: expandedSections.rating }]" 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
      
      <transition name="slide-down">
        <div v-show="expandedSections.rating" class="section-content">
          <div class="rating-options">
            <label 
              v-for="rating in [5, 4, 3, 2, 1]" 
              :key="rating"
              class="rating-item"
            >
              <input 
                v-model.number="filters.rating" 
                :value="rating" 
                type="radio" 
                @change="applyFilters"
                class="rating-input"
              >
              <div class="rating-display">
                <div class="stars">
                  <span v-for="star in 5" :key="star" :class="['star', { filled: star <= rating }]">
                    ★
                  </span>
                </div>
                <span class="rating-text">от {{ rating }} звёзд</span>
              </div>
            </label>
            
            <label class="rating-item">
              <input 
                v-model.number="filters.rating" 
                :value="0" 
                type="radio" 
                @change="applyFilters"
                class="rating-input"
              >
              <div class="rating-display">
                <span class="rating-text">Любой рейтинг</span>
              </div>
            </label>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- Наличие -->
    <div class="filter-section">
      <div class="section-header" @click="toggleSection('availability')">
        <div class="section-title">
          <div class="section-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <span>Наличие</span>
          <span v-if="filters.inStockOnly" class="active-indicator">В наличии</span>
        </div>
        <div class="section-toggle">
          <svg 
            :class="['chevron-icon', { expanded: expandedSections.availability }]" 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
      
      <transition name="slide-down">
        <div v-show="expandedSections.availability" class="section-content">
          <div class="availability-options">
            <label class="availability-item">
              <div class="availability-checkbox">
                <input 
                  v-model="filters.inStockOnly" 
                  type="checkbox" 
                  @change="applyFilters"
                  class="checkbox-input"
                >
                <div class="checkbox-custom">
                  <svg class="check-icon" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <div class="availability-info">
                <span class="availability-name">Только в наличии</span>
                <span class="availability-desc">Показывать только доступные товары</span>
              </div>
            </label>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { debounce } from 'lodash-es';

interface FilterState {
  priceRange: {
    min: number | null;
    max: number | null;
  };
  categories: string[];
  brands: string[];
  rating: number;
  inStockOnly: boolean;
}

const emit = defineEmits<{
  'filters-changed': [filters: FilterState];
}>>();

const store = useStore();

// Состояние фильтров
const filters = reactive<FilterState>({
  priceRange: {
    min: null,
    max: null
  },
  categories: [],
  brands: [],
  rating: 0,
  inStockOnly: false
});

// Состояние UI
const expandedSections = reactive({
  price: true,
  categories: true,
  brands: false,
  rating: false,
  availability: false
});

const categorySearch = ref('');
const showAllBrands = ref(false);

// Вычисляемые свойства
const products = computed(() => store.getters.products || []);

// Категории с количеством товаров
const categories = computed(() => {
  const categoryMap = new Map();
  
  products.value.forEach(product => {
    const category = product.category;
    if (categoryMap.has(category)) {
      categoryMap.set(category, categoryMap.get(category) + 1);
    } else {
      categoryMap.set(category, 1);
    }
  });
  
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

// Фильтрованные категории
const filteredCategories = computed(() => {
  if (!categorySearch.value) return categories.value;
  
  const query = categorySearch.value.toLowerCase();
  return categories.value.filter(category => 
    category.name.toLowerCase().includes(query)
  );
});

// Бренды с количеством товаров
const brands = computed(() => {
  const brandMap = new Map();
  
  products.value.forEach(product => {
    const brand = product.brand || 'Неизвестный бренд';
    if (brandMap.has(brand)) {
      brandMap.set(brand, brandMap.get(brand) + 1);
    } else {
      brandMap.set(brand, 1);
    }
  });
  
  return Array.from(brandMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

// Быстрые ценовые диапазоны
const priceRanges = [
  { label: 'До 1000 ₽', min: 0, max: 1000 },
  { label: '1000-5000 ₽', min: 1000, max: 5000 },
  { label: '5000-15000 ₽', min: 5000, max: 15000 },
  { label: '15000-50000 ₽', min: 15000, max: 50000 },
  { label: 'От 50000 ₽', min: 50000, max: null }
];

// Активные фильтры
const activePriceFilter = computed(() => {
  if (!filters.priceRange.min && !filters.priceRange.max) return null;
  
  const min = filters.priceRange.min || 0;
  const max = filters.priceRange.max;
  
  if (max) {
    return `${min.toLocaleString()}-${max.toLocaleString()} ₽`;
  } else {
    return `от ${min.toLocaleString()} ₽`;
  }
});

// Методы
const toggleSection = (section: string) => {
  expandedSections[section] = !expandedSections[section];
};

const applyFilters = () => {
  emit('filters-changed', { ...filters });
};

// Debounced применение фильтров для цены
const debouncedApplyFilters = debounce(applyFilters, 500);

const setPriceRange = (min: number | null, max: number | null) => {
  filters.priceRange.min = min;
  filters.priceRange.max = max;
  applyFilters();
};

const isPriceRangeActive = (min: number | null, max: number | null) => {
  return filters.priceRange.min === min && filters.priceRange.max === max;
};

const clearFilters = () => {
  filters.priceRange.min = null;
  filters.priceRange.max = null;
  filters.categories = [];
  filters.brands = [];
  filters.rating = 0;
  filters.inStockOnly = false;
  
  applyFilters();
};

// Наблюдатели
watch(() => filters.priceRange.min, (newValue) => {
  if (newValue !== null && newValue < 0) {
    filters.priceRange.min = 0;
  }
});

watch(() => filters.priceRange.max, (newValue) => {
  if (newValue !== null && newValue < 0) {
    filters.priceRange.max = 0;
  }
  if (newValue !== null && filters.priceRange.min !== null && newValue < filters.priceRange.min) {
    filters.priceRange.max = filters.priceRange.min;
  }
});

// Инициализация
onMounted(() => {
  // Восстанавливаем состояние секций из localStorage
  const savedState = localStorage.getItem('filter-sections-state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      Object.assign(expandedSections, parsed);
    } catch (e) {
      console.warn('Ошибка при восстановлении состояния фильтров:', e);
    }
  }
});

// Сохраняем состояние секций
watch(expandedSections, (newState) => {
  localStorage.setItem('filter-sections-state', JSON.stringify(newState));
}, { deep: true });

// Экспортируем метод очистки для родительского компонента
defineExpose({
  clearFilters
});
</script>

<style scoped>
/* Основной контейнер */
.product-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Секции фильтров */
.filter-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: var(--transition);
}

.filter-section:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}

/* Заголовки секций */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  cursor: pointer;
  transition: var(--transition);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.section-header:hover {
  background: var(--bg-hover);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.section-icon {
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-indicator {
  background: var(--primary);
  color: var(--text-inverse);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  margin-left: var(--space-2);
}

.section-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chevron-icon {
  color: var(--text-tertiary);
  transition: var(--transition);
}

.chevron-icon.expanded {
  transform: rotate(180deg);
}

/* Контент секций */
.section-content {
  padding: var(--space-4);
  background: var(--surface);
}

/* Ценовые фильтры */
.price-inputs {
  display: flex;
  align-items: end;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.price-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
}

.price-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-8) 0 var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: var(--transition);
}

.price-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgb(99 102 241 / 0.1);
}

.price-input::placeholder {
  color: var(--text-tertiary);
}

.currency {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  pointer-events: none;
}

.price-separator {
  color: var(--text-tertiary);
  font-weight: var(--font-weight-bold);
  margin: 0 var(--space-1);
  align-self: center;
}

/* Быстрые ценовые фильтры */
.quick-price-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.quick-price-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.quick-price-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.quick-price-btn.active {
  background: var(--primary);
  color: var(--text-inverse);
  border-color: var(--primary);
}

/* Поиск категорий */
.search-categories {
  margin-bottom: var(--space-4);
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.category-search-input {
  width: 100%;
  height: 36px;
  padding: 0 var(--space-3) 0 var(--space-10);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: var(--transition);
}

.category-search-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface);
}

.category-search-input::placeholder {
  color: var(--text-tertiary);
}

/* Списки категорий и брендов */
.categories-list,
.brands-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-height: 240px;
  overflow-y: auto;
}

.category-item,
.brand-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.category-item:hover,
.brand-item:hover {
  background: var(--bg-hover);
}

/* Чекбоксы */
.category-checkbox,
.brand-checkbox,
.availability-checkbox {
  position: relative;
  flex-shrink: 0;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--primary);
  border-color: var(--primary);
}

.check-icon {
  opacity: 0;
  color: var(--text-inverse);
  transition: var(--transition-fast);
}

.checkbox-input:checked + .checkbox-custom .check-icon {
  opacity: 1;
}

.category-info,
.brand-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.category-name,
.brand-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-count,
.brand-count {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  min-width: 24px;
  text-align: center;
}

/* Кнопка "Показать ещё" */
.show-more-btn {
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
  width: 100%;
}

.show-more-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary);
}

/* Рейтинг */
.rating-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.rating-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.rating-item:hover {
  background: var(--bg-hover);
}

.rating-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.rating-display {
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
  font-size: var(--font-size-base);
  transition: var(--transition-fast);
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.rating-input:checked + .rating-display .rating-text {
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

/* Наличие */
.availability-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.availability-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.availability-item:hover {
  background: var(--bg-hover);
}

.availability-info {
  flex: 1;
}

.availability-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--space-1);
}

.availability-desc {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  line-height: var(--line-height-relaxed);
}

/* Анимации */
.slide-down-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* Скроллбары */
.categories-list::-webkit-scrollbar,
.brands-list::-webkit-scrollbar {
  width: 4px;
}

.categories-list::-webkit-scrollbar-track,
.brands-list::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--radius);
}

.categories-list::-webkit-scrollbar-thumb,
.brands-list::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: var(--radius);
}

.categories-list::-webkit-scrollbar-thumb:hover,
.brands-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

/* Адаптивность */
@media (max-width: 768px) {
  .price-inputs {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .price-separator {
    display: none;
  }
  
  .quick-price-filters {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .categories-list,
  .brands-list {
    max-height: 200px;
  }
}

@media (max-width: 480px) {
  .section-content {
    padding: var(--space-3);
  }
  
  .price-input {
    height: 44px;
  }
  
  .quick-price-btn {
    padding: var(--space-3);
    font-size: var(--font-size-xs);
  }
  
  .category-item,
  .brand-item {
    padding: var(--space-3);
  }
}
</style>