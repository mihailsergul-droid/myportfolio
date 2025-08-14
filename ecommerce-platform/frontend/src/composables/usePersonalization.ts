import { ref, computed } from 'vue';
import { useStore } from 'vuex';

interface UserPreferences {
  favoriteCategories: string[];
  priceRange: { min: number; max: number };
  viewMode: 'grid' | 'list';
  theme: 'light' | 'dark';
  language: string;
}

const preferences = ref<UserPreferences>({
  favoriteCategories: [],
  priceRange: { min: 0, max: 1000 },
  viewMode: 'grid',
  theme: 'light',
  language: 'ru'
});

export const usePersonalization = () => {
  const store = useStore();

  const loadPreferences = () => {
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      preferences.value = { ...preferences.value, ...JSON.parse(stored) };
    }
  };

  const savePreferences = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences.value));
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    preferences.value[key] = value;
    savePreferences();
  };

  const getRecommendations = () => {
    const products = store.state.products;
    const cart = store.state.cart;
    const wishlist = store.state.wishlist;
    
    // Simple recommendation algorithm
    const viewedCategories = [...cart, ...wishlist].map(item => item.category);
    const categoryFreq = viewedCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categoryFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);
    
    return products.filter(product => 
      topCategories.includes(product.category) &&
      product.price >= preferences.value.priceRange.min &&
      product.price <= preferences.value.priceRange.max
    ).slice(0, 6);
  };

  const personalizedProducts = computed(() => getRecommendations());

  return {
    preferences: computed(() => preferences.value),
    loadPreferences,
    savePreferences,
    updatePreference,
    personalizedProducts
  };
};