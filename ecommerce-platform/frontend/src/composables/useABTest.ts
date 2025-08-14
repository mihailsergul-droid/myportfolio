import { ref, computed } from 'vue';

interface ABTest {
  id: string;
  variants: string[];
  weights?: number[];
}

const activeTests = ref<Record<string, string>>({});

export const useABTest = () => {
  const getVariant = (test: ABTest): string => {
    const stored = localStorage.getItem(`ab_test_${test.id}`);
    if (stored && test.variants.includes(stored)) {
      activeTests.value[test.id] = stored;
      return stored;
    }

    const weights = test.weights || test.variants.map(() => 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (let i = 0; i < test.variants.length; i++) {
      currentWeight += weights[i];
      if (random <= currentWeight) {
        const variant = test.variants[i];
        localStorage.setItem(`ab_test_${test.id}`, variant);
        activeTests.value[test.id] = variant;
        return variant;
      }
    }
    
    return test.variants[0];
  };

  const isVariant = (testId: string, variant: string): boolean => {
    return activeTests.value[testId] === variant;
  };

  return { getVariant, isVariant, activeTests: computed(() => activeTests.value) };
};