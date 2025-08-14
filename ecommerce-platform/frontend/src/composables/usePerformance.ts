import { ref, onMounted } from 'vue';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
}

const metrics = ref<PerformanceMetrics>({
  loadTime: 0,
  renderTime: 0,
  memoryUsage: 0,
  networkRequests: 0
});

export const usePerformance = () => {
  const measureLoadTime = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.value.loadTime = navigation.loadEventEnd - navigation.fetchStart;
    }
  };

  const measureRenderTime = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          metrics.value.renderTime = entry.duration;
        }
      });
    });
    observer.observe({ entryTypes: ['measure'] });
  };

  const measureMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.value.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  };

  const measureNetworkRequests = () => {
    const resources = performance.getEntriesByType('resource');
    metrics.value.networkRequests = resources.length;
  };

  const startMeasure = (name: string) => {
    performance.mark(`${name}-start`);
  };

  const endMeasure = (name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  };

  const getMetrics = () => metrics.value;

  const logMetrics = () => {
    console.group('Performance Metrics');
    console.log('Load Time:', metrics.value.loadTime.toFixed(2), 'ms');
    console.log('Render Time:', metrics.value.renderTime.toFixed(2), 'ms');
    console.log('Memory Usage:', metrics.value.memoryUsage.toFixed(2), 'MB');
    console.log('Network Requests:', metrics.value.networkRequests);
    console.groupEnd();
  };

  return {
    metrics,
    measureLoadTime,
    measureRenderTime,
    measureMemoryUsage,
    measureNetworkRequests,
    startMeasure,
    endMeasure,
    getMetrics,
    logMetrics
  };
};