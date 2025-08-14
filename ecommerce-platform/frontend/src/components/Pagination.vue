<template>
  <div v-if="totalPages > 1" class="pagination">
    <button 
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="pagination-btn pagination-prev"
    >
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
      </svg>
      <span>Назад</span>
    </button>
    
    <div class="pagination-numbers">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-number', { active: page === currentPage, ellipsis: page === '...' }]"
        :disabled="page === '...'"
      >
        {{ page }}
      </button>
    </div>
    
    <button 
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="pagination-btn pagination-next"
    >
      <span>Далее</span>
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  maxVisible?: number;
}>();

const emit = defineEmits<{
  'page-change': [page: number];
}>();

const maxVisible = props.maxVisible || 7;

const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const current = props.currentPage;
  
  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < total) {
      if (end < total - 1) pages.push('...');
      pages.push(total);
    }
  }
  
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page);
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 32px 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.875rem;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-number {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-number:hover:not(:disabled):not(.ellipsis) {
  background: var(--bg-secondary);
  border-color: var(--primary);
}

.pagination-number.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination-number.ellipsis {
  border: none;
  background: none;
  cursor: default;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .pagination {
    gap: 4px;
  }
  
  .pagination-btn span {
    display: none;
  }
  
  .pagination-btn {
    padding: 8px;
  }
  
  .pagination-number {
    width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
}
</style>