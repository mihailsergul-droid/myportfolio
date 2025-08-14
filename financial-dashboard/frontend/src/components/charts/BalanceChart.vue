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
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  period: string
}

const props = defineProps<Props>()
const store = useStore()

const chartCanvas = ref<HTMLCanvasElement>()
const chart = ref<ChartJS>()
const isLoading = ref(false)

const createChart = async () => {
  if (!chartCanvas.value) return

  isLoading.value = true
  
  try {
    const data = await store.dispatch('dashboard/fetchBalanceHistory', props.period)
    
    if (chart.value) {
      chart.value.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    chart.value = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Баланс',
            data: data.values,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                return `Баланс: ${new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB'
                }).format(context.parsed.y)}`
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280'
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: '#6B7280',
              callback: (value) => {
                return new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  notation: 'compact'
                }).format(value as number)
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        elements: {
          point: {
            hoverBackgroundColor: 'rgb(59, 130, 246)'
          }
        }
      }
    })
  } catch (error) {
    console.error('Error creating balance chart:', error)
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