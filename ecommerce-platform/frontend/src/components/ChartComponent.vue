<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

const props = defineProps<{
  type: 'line' | 'bar' | 'pie';
  data: ChartData;
  width?: number;
  height?: number;
}>();

const chartCanvas = ref<HTMLCanvasElement>();
const width = props.width || 400;
const height = props.height || 200;

const drawChart = () => {
  if (!chartCanvas.value) return;
  
  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  if (props.type === 'bar') {
    drawBarChart(ctx);
  } else if (props.type === 'line') {
    drawLineChart(ctx);
  } else if (props.type === 'pie') {
    drawPieChart(ctx);
  }
};

const drawBarChart = (ctx: CanvasRenderingContext2D) => {
  const data = props.data.datasets[0].data;
  const max = Math.max(...data);
  const barWidth = width / data.length * 0.8;
  const barSpacing = width / data.length * 0.2;
  
  data.forEach((value, index) => {
    const barHeight = (value / max) * (height - 40);
    const x = index * (barWidth + barSpacing) + barSpacing / 2;
    const y = height - barHeight - 20;
    
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(props.data.labels[index], x + barWidth / 2, height - 5);
    ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
  });
};

const drawLineChart = (ctx: CanvasRenderingContext2D) => {
  const data = props.data.datasets[0].data;
  const max = Math.max(...data);
  const stepX = width / (data.length - 1);
  
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  data.forEach((value, index) => {
    const x = index * stepX;
    const y = height - (value / max) * (height - 40) - 20;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    // Points
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  ctx.stroke();
};

const drawPieChart = (ctx: CanvasRenderingContext2D) => {
  const data = props.data.datasets[0].data;
  const total = data.reduce((sum, value) => sum + value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  
  let currentAngle = 0;
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    
    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    
    currentAngle += sliceAngle;
  });
};

onMounted(() => {
  drawChart();
});

watch(() => props.data, () => {
  drawChart();
}, { deep: true });
</script>

<style scoped>
.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border);
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>