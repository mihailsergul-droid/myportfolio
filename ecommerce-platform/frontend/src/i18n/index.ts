export const translations = {
  ru: {
    nav: { shop: 'Магазин', cart: 'Корзина', login: 'Войти' },
    product: { addToCart: 'В корзину', price: 'Цена' },
    cart: { empty: 'Корзина пуста', total: 'Итого' }
  },
  en: {
    nav: { shop: 'Shop', cart: 'Cart', login: 'Login' },
    product: { addToCart: 'Add to Cart', price: 'Price' },
    cart: { empty: 'Cart is empty', total: 'Total' }
  }
};

export const useI18n = () => {
  const currentLang = localStorage.getItem('language') || 'ru';
  
  const t = (key: string) => {
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) value = value?.[k];
    return value || key;
  };
  
  const setLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };
  
  return { t, currentLang, setLanguage };
};