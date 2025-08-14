import { ref } from 'vue';

const isDark = ref(localStorage.getItem('theme') === 'dark');

export const useTheme = () => {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
  };
  
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
  
  return { isDark, toggleTheme };
};