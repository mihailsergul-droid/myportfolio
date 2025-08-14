<template>
  <div class="relative h-80">
    <canvas ref="chartCanvas"></canvas>
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
      <div class="loading-spinner w-6 h-6"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  period: string
}

const props = defineProps<Props>()
const store = useStore()

const chartCanvas = ref<HTMLCanvasElement>()
const chart = ref<ChartJS>()
const isLoading = ref(false)

const colors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
]

const createChart = async () => {
  if (!chartCanvas.value) return

  isLoading.value = true
  
  try {
    const data = await store.dispatch('dashboard/fetchExpensesByCategory', props.period)
    
    if (chart.value) {
      chart.value.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    chart.value = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: data.categories,
        datasets: [
          {
            data: data.amounts,
            backgroundColor: colors.slice(0, data.categories.length),
            borderColor: '#fff',
            borderWidth: 2,
            hoverBorderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              },
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0]
                    const value = dataset.data[i] as number
                    const total = (dataset.data as number[]).reduce((a, b) => a + b, 0)
                    const percentage = ((value / total) * 100).toFixed(1)
                    
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: dataset.backgroundColor?.[i] as string,
                      strokeStyle: dataset.backgroundColor?.[i] as string,
                      lineWidth: 0,
                      pointStyle: 'circle',
                      index: i
                    }
                  })
                }
                return []
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const value = context.parsed
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                const formatted = new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB'
                }).format(value)
                
                return `${context.label}: ${formatted} (${percentage}%)`
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true
        },
        hover: {
          mode: 'nearest',
          intersect: true
        }
      }
    })
  } catch (error) {
    console.error('Error creating expense category chart:', error)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.period, () => {
  nextTick(() => {
    createChart()
  })
})

onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>