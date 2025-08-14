<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
        <router-link 
          v-if="item.to && index < items.length - 1" 
          :to="item.to" 
          class="breadcrumb-link"
        >
          <svg v-if="index === 0" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span>{{ item.label }}</span>
        </router-link>
        
        <span v-else class="breadcrumb-current">
          {{ item.label }}
        </span>
        
        <svg 
          v-if="index < items.length - 1" 
          class="breadcrumb-separator" 
          width="16" 
          height="16" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string;
  to?: string;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>

<style scoped>
.breadcrumbs {
  margin-bottom: 24px;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  transition: var(--transition);
}

.breadcrumb-link:hover {
  color: var(--primary);
  background: var(--bg-secondary);
  text-decoration: none;
}

.breadcrumb-current {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 4px 8px;
}

.breadcrumb-separator {
  color: var(--text-secondary);
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .breadcrumb-link span,
  .breadcrumb-current {
    font-size: 0.8rem;
  }
  
  .breadcrumb-separator {
    width: 14px;
    height: 14px;
  }
}
</style>