<template>
  <div class="metric-card group hover:shadow-md transition-shadow duration-200">
    <div class="flex items-center">
      <div :class="iconClasses" class="p-3 rounded-lg">
        <component :is="iconComponent" class="w-6 h-6" />
      </div>
      <div class="ml-4 flex-1">
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
        <div v-if="change !== undefined" class="flex items-center mt-1">
          <component
            :is="changeIcon"
            :class="changeClasses"
            class="w-4 h-4 mr-1"
          />
          <span :class="changeClasses" class="text-sm font-medium">
            {{ formatChange(change) }}
          </span>
          <span class="text-xs text-gray-500 ml-1">vs прошлый период</span>
        </div>
      </div>
    </div>
    
    <!-- Mini sparkline chart -->
    <div v-if="sparklineData" class="mt-4">
      <canvas ref="sparklineCanvas" class="w-full h-8"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrophyIcon,
  ChartBarIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement)

interface Props {
  title: string
  value: string
  change?: number
  icon: string
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'indigo'
  sparklineData?: number[]
}

const props = defineProps<Props>()

const sparklineCanvas = ref<HTMLCanvasElement>()

const iconComponents = {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrophyIcon,
  ChartBarIcon,
  BanknotesIcon
}

const iconComponent = computed(() => {
  return iconComponents[props.icon as keyof typeof iconComponents] || CurrencyDollarIcon
})

const iconClasses = computed(() => {
  const baseClasses = 'text-white'
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500'
  }
  
  return `${baseClasses} ${colorClasses[props.color]}`
})

const changeIcon = computed(() => {
  if (props.change === undefined) return null
  return props.change >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
})

const changeClasses = computed(() => {
  if (props.change === undefined) return ''
  return props.change >= 0 ? 'text-green-600' : 'text-red-600'
})

const formatChange = (change: number) => {
  const abs = Math.abs(change)
  const sign = change >= 0 ? '+' : '-'
  
  if (abs >= 1000000) {
    return `${sign}${(abs / 1000000).toFixed(1)}M`
  } else if (abs >= 1000) {
    return `${sign}${(abs / 1000).toFixed(1)}K`
  } else {
    return `${sign}${abs.toFixed(0)}`
  }
}

const createSparkline = () => {
  if (!sparklineCanvas.value || !props.sparklineData) return

  const ctx = sparklineCanvas.value.getContext('2d')
  if (!ctx) return

  const canvas = sparklineCanvas.value
  const width = canvas.offsetWidth
  const height = 32
  
  canvas.width = width
  canvas.height = height

  const data = props.sparklineData
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = props.change && props.change >= 0 ? '#10B981' : '#EF4444'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  data.forEach((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()
}

onMounted(() => {
  if (props.sparklineData) {
    nextTick(() => {
      createSparkline()
    })
  }
})
</script>