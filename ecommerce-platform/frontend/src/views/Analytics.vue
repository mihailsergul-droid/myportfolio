<template>
  <div class="analytics">
    <h2>Аналитика</h2>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>{{ totalRevenue.toFixed(2) }}$</h3>
        <p>Общая выручка</p>
      </div>
      
      <div class="metric-card">
        <h3>{{ totalOrders }}</h3>
        <p>Всего заказов</p>
      </div>
      
      <div class="metric-card">
        <h3>{{ totalProducts }}</h3>
        <p>Товаров в каталоге</p>
      </div>
      
      <div class="metric-card">
        <h3>{{ averageOrderValue.toFixed(2) }}$</h3>
        <p>Средний чек</p>
      </div>
    </div>
    
    <div class="charts-section">
      <div class="chart-card">
        <h3>Продажи по категориям</h3>
        <ChartComponent 
          type="pie" 
          :data="categoryChartData"
          :width="300"
          :height="300"
        />
      </div>
      
      <div class="chart-card">
        <h3>Динамика продаж</h3>
        <ChartComponent 
          type="line" 
          :data="salesChartData"
          :width="400"
          :height="200"
        />
      </div>
      
      <div class="chart-card full-width">
        <h3>Последние заказы</h3>
        <div class="recent-orders">
          <div v-for="order in recentOrders" :key="order.id" class="order-item">
            <span>Заказ #{{ order.id }}</span>
            <span>${{ order.total }}</span>
            <span>{{ formatDate(order.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import ChartComponent from '../components/ChartComponent.vue';

const store = useStore();

const orders = computed(() => store.state.orders);
const products = computed(() => store.state.products);

const totalRevenue = computed(() => 
  orders.value.reduce((sum, order) => sum + order.total, 0)
);

const totalOrders = computed(() => orders.value.length);
const totalProducts = computed(() => products.value.length);

const averageOrderValue = computed(() => 
  totalOrders.value > 0 ? totalRevenue.value / totalOrders.value : 0
);

const categoryStats = computed(() => {
  const stats = {};
  let total = 0;
  
  products.value.forEach(product => {
    stats[product.category] = (stats[product.category] || 0) + 1;
    total++;
  });
  
  return Object.entries(stats).map(([name, count]) => ({
    name,
    count,
    percentage: (count / total) * 100
  }));
});

const recentOrders = computed(() => 
  orders.value.slice(-5).reverse()
);

const categoryChartData = computed(() => ({
  labels: categoryStats.value.map(c => c.name),
  datasets: [{
    label: 'Категории',
    data: categoryStats.value.map(c => c.count)
  }]
}));

const salesChartData = computed(() => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  }).reverse();
  
  const salesData = last7Days.map(() => Math.floor(Math.random() * 1000) + 500);
  
  return {
    labels: last7Days,
    datasets: [{
      label: 'Продажи',
      data: salesData,
      borderColor: '#6366f1'
    }]
  };
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

onMounted(() => {
  store.dispatch('fetchOrders');
  store.dispatch('fetchProducts');
});
</script>

<style scoped>
.analytics {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.metric-card h3 {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 5px;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.category-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-name {
  min-width: 100px;
  font-size: 0.9rem;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar {
  height: 20px;
  background: #007bff;
  border-radius: 10px;
  min-width: 2px;
}

.percentage {
  font-size: 0.8rem;
  color: #666;
}

.recent-orders {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-card.full-width {
    grid-column: 1;
  }
}
</style>