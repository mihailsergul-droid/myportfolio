<template>
  <div class="search-filter">
    <div class="search-container">
      <!-- Основное поле поиска -->
      <div class="search-input-group">
        <div class="search-input-wrapper">
          <div class="search-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          
          <input 
            ref="searchInput"
            v-model="searchQuery" 
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown="handleKeydown"
            type="text" 
            :placeholder="searchPlaceholder"
            class="search-input"
            autocomplete="off"
            :class="{ 'has-value': searchQuery, 'is-focused': isFocused }"
          >
          
          <!-- Кнопка очистки -->
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="clear-btn"
            type="button"
            title="Очистить поиск"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <!-- Индикатор загрузки -->
          <div v-if="isSearching" class="search-loading">
            <div class="spinner"></div>
          </div>
        </div>
        
        <!-- Выпадающий список с предложениями -->
        <transition name="dropdown">
          <div 
            v-if="showDropdown && (suggestions.length > 0 || recentSearches.length > 0 || popularSearches.length > 0)" 
            class="search-dropdown"
          >
            <!-- Предложения по поиску -->
            <div v-if="searchQuery && suggestions.length > 0" class="dropdown-section">
              <div class="section-header">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span>Предложения</span>
              </div>
              <div 
                v-for="(suggestion, index) in suggestions" 
                :key="`suggestion-${index}`"
                @mousedown="selectSuggestion(suggestion)"
                :class="['dropdown-item', { active: selectedIndex === index }]"
              >
                <div class="item-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <div class="item-content">
                  <span class="item-text" v-html="highlightMatch(suggestion.text)"></span>
                  <span v-if="suggestion.category" class="item-category">в {{ suggestion.category }}</span>
                </div>
                <div v-if="suggestion.count" class="item-count">{{ suggestion.count }}</div>
              </div>
            </div>
            
            <!-- Недавние поиски -->
            <div v-if="!searchQuery && recentSearches.length > 0" class="dropdown-section">
              <div class="section-header">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Недавние поиски</span>
                <button @click="clearRecentSearches" class="clear-btn-small">
                  Очистить
                </button>
              </div>
              <div 
                v-for="(search, index) in recentSearches" 
                :key="`recent-${index}`"
                @mousedown="selectSuggestion({ text: search, type: 'recent' })"
                class="dropdown-item recent-item"
              >
                <div class="item-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="item-content">
                  <span class="item-text">{{ search }}</span>
                </div>
                <button 
                  @click.stop="removeRecentSearch(search)" 
                  class="remove-btn"
                  title="Удалить из истории"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Популярные поиски -->
            <div v-if="!searchQuery && popularSearches.length > 0" class="dropdown-section">
              <div class="section-header">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <span>Популярные запросы</span>
              </div>
              <div 
                v-for="(search, index) in popularSearches" 
                :key="`popular-${index}`"
                @mousedown="selectSuggestion({ text: search, type: 'popular' })"
                class="dropdown-item popular-item"
              >
                <div class="item-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <div class="item-content">
                  <span class="item-text">{{ search }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
      
      <!-- Быстрые фильтры -->
      <div class="quick-filters">
        <div class="filter-group">
          <label class="filter-label">Категория:</label>
          <div class="select-wrapper">
            <select 
              v-model="selectedCategory" 
              @change="handleCategoryChange"
              class="filter-select"
            >
              <option value="">Все категории</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <div class="select-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Сортировка:</label>
          <div class="select-wrapper">
            <select 
              v-model="sortBy" 
              @change="handleSortChange"
              class="filter-select"
            >
              <option value="">По умолчанию</option>
              <option value="price-asc">Цена: по возрастанию</option>
              <option value="price-desc">Цена: по убыванию</option>
              <option value="name-asc">Название: А-Я</option>
              <option value="name-desc">Название: Я-А</option>
              <option value="rating-desc">По рейтингу</option>
              <option value="newest">Сначала новые</option>
            </select>
            <div class="select-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Активные фильтры -->
    <div v-if="activeFilters.length > 0" class="active-filters">
      <div class="active-filters-label">Активные фильтры:</div>
      <div class="filter-tags">
        <div 
          v-for="filter in activeFilters" 
          :key="filter.key"
          class="filter-tag"
        >
          <span class="filter-tag-text">{{ filter.label }}: {{ filter.value }}</span>
          <button 
            @click="removeFilter(filter.key)" 
            class="filter-tag-remove"
            title="Удалить фильтр"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <button @click="clearAllFilters" class="clear-all-filters">
          Очистить все
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import { debounce } from 'lodash-es';

interface Suggestion {
  text: string;
  type: 'product' | 'category' | 'brand';
  category?: string;
  count?: number;
}

interface Filter {
  key: string;
  label: string;
  value: string;
}

const emit = defineEmits<{
  search: [query: string];
  'category-change': [category: string];
  'sort-change': [sortBy: string];
  'filter-change': [filters: any];
}>>();

const store = useStore();
const searchInput = ref<HTMLInputElement>();

// Состояние компонента
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('');
const isFocused = ref(false);
const showDropdown = ref(false);
const selectedIndex = ref(-1);
const isSearching = ref(false);

// Данные из localStorage
const recentSearches = ref<string[]>(JSON.parse(localStorage.getItem('recentSearches') || '[]'));
const popularSearches = ref<string[]>([
  'iPhone', 'Samsung', 'Наушники', 'Ноутбук', 'Планшет', 'Смартфон'
]);

// Вычисляемые свойства
const categories = computed(() => store.getters.categories || []);
const products = computed(() => store.getters.products || []);

const searchPlaceholder = computed(() => {
  const placeholders = [
    'Поиск товаров...',
    'Найти iPhone, Samsung...',
    'Что вы ищете?',
    'Поиск по каталогу'
  ];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
});

// Предложения для автодополнения
const suggestions = computed((): Suggestion[] => {
  if (!searchQuery.value || searchQuery.value.length < 2) return [];
  
  const query = searchQuery.value.toLowerCase().trim();
  const results: Suggestion[] = [];
  
  // Поиск по товарам
  const productMatches = products.value
    .filter(p => p.name.toLowerCase().includes(query))
    .slice(0, 5)
    .map(p => ({
      text: p.name,
      type: 'product' as const,
      category: p.category
    }));
  
  // Поиск по категориям
  const categoryMatches = categories.value
    .filter(c => c.toLowerCase().includes(query))
    .slice(0, 3)
    .map(c => ({
      text: c,
      type: 'category' as const,
      count: products.value.filter(p => p.category === c).length
    }));
  
  results.push(...productMatches, ...categoryMatches);
  
  return results.slice(0, 8);
});

// Активные фильтры
const activeFilters = computed((): Filter[] => {
  const filters: Filter[] = [];
  
  if (searchQuery.value) {
    filters.push({
      key: 'search',
      label: 'Поиск',
      value: searchQuery.value
    });
  }
  
  if (selectedCategory.value) {
    filters.push({
      key: 'category',
      label: 'Категория',
      value: selectedCategory.value
    });
  }
  
  if (sortBy.value) {
    const sortLabels = {
      'price-asc': 'Цена: по возрастанию',
      'price-desc': 'Цена: по убыванию',
      'name-asc': 'Название: А-Я',
      'name-desc': 'Название: Я-А',
      'rating-desc': 'По рейтингу',
      'newest': 'Сначала новые'
    };
    
    filters.push({
      key: 'sort',
      label: 'Сортировка',
      value: sortLabels[sortBy.value] || sortBy.value
    });
  }
  
  return filters;
});

// Debounced поиск
const debouncedSearch = debounce((query: string) => {
  emit('search', query);
  isSearching.value = false;
}, 300);

// Обработчики событий
const handleInput = () => {
  selectedIndex.value = -1;
  isSearching.value = true;
  debouncedSearch(searchQuery.value);
};

const handleFocus = () => {
  isFocused.value = true;
  showDropdown.value = true;
};

const handleBlur = () => {
  isFocused.value = false;
  // Задержка для обработки кликов по выпадающему списку
  setTimeout(() => {
    showDropdown.value = false;
    selectedIndex.value = -1;
  }, 200);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!showDropdown.value) return;
  
  const totalItems = suggestions.value.length + 
    (searchQuery.value ? 0 : recentSearches.value.length + popularSearches.value.length);
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, totalItems - 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
      break;
    case 'Enter':
      e.preventDefault();
      if (selectedIndex.value >= 0) {
        // Логика выбора элемента по индексу
        handleEnterSelection();
      } else {
        performSearch();
      }
      break;
    case 'Escape':
      showDropdown.value = false;
      searchInput.value?.blur();
      break;
  }
};

const handleEnterSelection = () => {
  if (searchQuery.value && suggestions.value.length > 0) {
    const suggestion = suggestions.value[selectedIndex.value];
    if (suggestion) {
      selectSuggestion(suggestion);
    }
  } else {
    const allItems = [...recentSearches.value, ...popularSearches.value];
    const item = allItems[selectedIndex.value];
    if (item) {
      selectSuggestion({ text: item, type: 'product' });
    }
  }
};

const selectSuggestion = (suggestion: Suggestion | { text: string; type: string }) => {
  searchQuery.value = suggestion.text;
  addToRecentSearches(suggestion.text);
  performSearch();
  showDropdown.value = false;
  searchInput.value?.blur();
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    addToRecentSearches(searchQuery.value.trim());
  }
  emit('search', searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
  searchInput.value?.focus();
};

const handleCategoryChange = () => {
  emit('category-change', selectedCategory.value);
};

const handleSortChange = () => {
  emit('sort-change', sortBy.value);
};

// Управление историей поиска
const addToRecentSearches = (query: string) => {
  if (!query.trim()) return;
  
  const searches = recentSearches.value.filter(s => s !== query);
  searches.unshift(query);
  recentSearches.value = searches.slice(0, 8);
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value));
};

const removeRecentSearch = (query: string) => {
  recentSearches.value = recentSearches.value.filter(s => s !== query);
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value));
};

const clearRecentSearches = () => {
  recentSearches.value = [];
  localStorage.removeItem('recentSearches');
};

// Управление фильтрами
const removeFilter = (key: string) => {
  switch (key) {
    case 'search':
      clearSearch();
      break;
    case 'category':
      selectedCategory.value = '';
      handleCategoryChange();
      break;
    case 'sort':
      sortBy.value = '';
      handleSortChange();
      break;
  }
};

const clearAllFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  sortBy.value = '';
  emit('search', '');
  emit('category-change', '');
  emit('sort-change', '');
};

// Подсветка совпадений
const highlightMatch = (text: string) => {
  if (!searchQuery.value) return text;
  const regex = new RegExp(`(${searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Инициализация
onMounted(() => {
  // Восстанавливаем состояние из store если есть
  if (store.state.searchQuery) {
    searchQuery.value = store.state.searchQuery;
  }
  if (store.state.selectedCategory) {
    selectedCategory.value = store.state.selectedCategory;
  }
});

// Наблюдатели
watch(searchQuery, (newValue) => {
  if (newValue.length === 0) {
    isSearching.value = false;
  }
});
</script>

<style scoped>
/* Основной контейнер */
.search-filter {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.search-filter:hover {
  box-shadow: var(--shadow-md);
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Поисковая строка */
.search-input-group {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  z-index: 2;
  color: var(--text-tertiary);
  transition: var(--transition);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 56px;
  padding: 0 var(--space-16) 0 var(--space-12);
  border: 2px solid var(--border);
  border-radius: var(--radius-xl);
  background: var(--surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: var(--transition);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
  font-weight: var(--font-weight-normal);
}

.search-input:focus,
.search-input.is-focused {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgb(99 102 241 / 0.1);
}

.search-input.has-value {
  padding-right: var(--space-20);
}

.search-input:focus + .search-icon,
.search-input.is-focused + .search-icon {
  color: var(--primary);
}

/* Кнопки в поле поиска */
.clear-btn {
  position: absolute;
  right: var(--space-4);
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  z-index: 2;
}

.clear-btn:hover {
  background: var(--danger);
  color: var(--text-inverse);
  transform: scale(1.05);
}

.search-loading {
  position: absolute;
  right: var(--space-16);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Выпадающий список */
.search-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  backdrop-filter: blur(10px);
}

.dropdown-section {
  padding: var(--space-2) 0;
}

.dropdown-section:not(:last-child) {
  border-bottom: 1px solid var(--border-light);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.clear-btn-small {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  transition: var(--transition);
}

.clear-btn-small:hover {
  background: var(--primary-50);
}

/* Элементы выпадающего списка */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--space-2);
  margin: 0 var(--space-2);
}

.dropdown-item:hover,
.dropdown-item.active {
  background: var(--bg-hover);
}

.dropdown-item.recent-item:hover,
.dropdown-item.popular-item:hover {
  background: var(--primary-50);
}

.item-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-category {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  display: block;
  margin-top: var(--space-1);
}

.item-count {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  opacity: 0;
  flex-shrink: 0;
}

.dropdown-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: var(--danger);
  color: var(--text-inverse);
}

/* Подсветка совпадений */
.item-text :deep(mark) {
  background: var(--primary);
  color: var(--text-inverse);
  padding: 1px 3px;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
}

/* Быстрые фильтры */
.quick-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.select-wrapper {
  position: relative;
}

.filter-select {
  width: 100%;
  height: 48px;
  padding: 0 var(--space-10) 0 var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  appearance: none;
  transition: var(--transition);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgb(99 102 241 / 0.1);
}

.select-icon {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
  transition: var(--transition);
}

.filter-select:focus + .select-icon {
  color: var(--primary);
}

/* Активные фильтры */
.active-filters {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
}

.active-filters-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--primary-50);
  color: var(--primary-700);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--primary-100);
}

.filter-tag-text {
  white-space: nowrap;
}

.filter-tag-remove {
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  color: var(--primary-600);
  cursor: pointer;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.filter-tag-remove:hover {
  background: var(--primary-600);
  color: var(--text-inverse);
}

.clear-all-filters {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
}

.clear-all-filters:hover {
  background: var(--danger);
  color: var(--text-inverse);
  border-color: var(--danger);
}

/* Анимации */
.dropdown-enter-active {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dropdown-leave-active {
  transition: all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

/* Адаптивность */
@media (max-width: 768px) {
  .search-filter {
    padding: var(--space-4);
    margin-bottom: var(--space-6);
  }
  
  .search-container {
    gap: var(--space-4);
  }
  
  .search-input {
    height: 52px;
    font-size: var(--font-size-base);
  }
  
  .quick-filters {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .filter-select {
    height: 44px;
  }
  
  .search-dropdown {
    max-height: 300px;
  }
  
  .filter-tags {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .search-filter {
    padding: var(--space-3);
    border-radius: var(--radius-lg);
  }
  
  .search-input {
    height: 48px;
    padding: 0 var(--space-12) 0 var(--space-10);
  }
  
  .search-icon {
    left: var(--space-3);
  }
  
  .clear-btn {
    right: var(--space-3);
    width: 28px;
    height: 28px;
  }
  
  .dropdown-item {
    padding: var(--space-3);
  }
  
  .active-filters {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
  }
}

/* Скроллбар для выпадающего списка */
.search-dropdown::-webkit-scrollbar {
  width: 6px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--radius);
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: var(--radius);
}

.search-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}
</style>