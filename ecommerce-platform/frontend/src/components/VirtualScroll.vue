<template>
  <div class="virtual-scroll" ref="container" @scroll="handleScroll">
    <div class="virtual-scroll-spacer" :style="{ height: totalHeight + 'px' }">
      <div class="virtual-scroll-content" :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="item in visibleItems"
          :key="getItemKey(item)"
          class="virtual-scroll-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" :index="item.index"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  items: any[];
  itemHeight: number;
  containerHeight: number;
  keyField?: string;
}>();

const container = ref<HTMLElement>();
const scrollTop = ref(0);

const totalHeight = computed(() => props.items.length * props.itemHeight);
const visibleCount = computed(() => Math.ceil(props.containerHeight / props.itemHeight) + 2);
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight));
const endIndex = computed(() => Math.min(startIndex.value + visibleCount.value, props.items.length));
const offsetY = computed(() => startIndex.value * props.itemHeight);

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value).map((item, index) => ({
    ...item,
    index: startIndex.value + index
  }));
});

const getItemKey = (item: any) => {
  return props.keyField ? item[props.keyField] : item.index;
};

const handleScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLElement).scrollTop;
};

onMounted(() => {
  if (container.value) {
    container.value.style.height = props.containerHeight + 'px';
  }
});
</script>

<style scoped>
.virtual-scroll {
  overflow-y: auto;
  position: relative;
}

.virtual-scroll-spacer {
  position: relative;
}

.virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-scroll-item {
  display: flex;
  align-items: center;
}
</style>