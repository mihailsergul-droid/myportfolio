import { ref } from 'vue';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

const events = ref<AnalyticsEvent[]>([]);

export const useAnalytics = () => {
  const track = (category: string, action: string, label?: string, value?: number) => {
    const event: AnalyticsEvent = {
      event: 'custom_event',
      category,
      action,
      label,
      value,
      timestamp: Date.now()
    };
    
    events.value.push(event);
    
    // Send to analytics service (mock)
    console.log('Analytics Event:', event);
    
    // Store in localStorage for demo
    const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    stored.push(event);
    localStorage.setItem('analytics_events', JSON.stringify(stored.slice(-100)));
  };

  const trackPageView = (page: string) => {
    track('Navigation', 'Page View', page);
  };

  const trackPurchase = (orderId: string, value: number) => {
    track('Ecommerce', 'Purchase', orderId, value);
  };

  const trackAddToCart = (productId: string, productName: string) => {
    track('Ecommerce', 'Add to Cart', `${productId}:${productName}`);
  };

  const getEvents = () => events.value;

  return { track, trackPageView, trackPurchase, trackAddToCart, getEvents };
};