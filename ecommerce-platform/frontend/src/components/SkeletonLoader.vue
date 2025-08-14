<template>
  <div class="skeleton-container">
    <div v-if="type === 'product-card'" class="skeleton-product-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-price"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'product-list'" class="skeleton-product-list">
      <div v-for="n in count" :key="n" class="skeleton-product-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-price"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'text'" class="skeleton-text-block">
      <div v-for="n in (count || 3)" :key="n" class="skeleton-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: 'product-card' | 'product-list' | 'text';
  count?: number;
}>();
</script>

<style scoped>
.skeleton-container {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.skeleton-product-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-image {
  height: 200px;
  background: var(--gray-200);
}

.skeleton-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-line {
  height: 16px;
  background: var(--gray-200);
  border-radius: 4px;
}

.skeleton-title {
  height: 20px;
  width: 80%;
}

.skeleton-text {
  width: 60%;
}

.skeleton-price {
  width: 40%;
  height: 18px;
}

.skeleton-button {
  height: 40px;
  background: var(--gray-200);
  border-radius: 8px;
  margin-top: 8px;
}

.skeleton-text-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

[data-theme="dark"] .skeleton-line,
[data-theme="dark"] .skeleton-image,
[data-theme="dark"] .skeleton-button {
  background: var(--gray-700);
}
</style>