import { createStore } from 'vuex';
import axios from 'axios';
import { State, Product, Order, User, CartItem, AuthState, Notification } from '../types';
import { cache, withCache } from '../utils/cache';

const API_URL = 'http://localhost:3000/api';

// Setup axios interceptor for auth
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default createStore<State>({
  state: {
    products: [],
    orders: [],
    cart: JSON.parse(localStorage.getItem('cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
    compareItems: JSON.parse(localStorage.getItem('compareItems') || '[]'),
    categories: [],
    searchQuery: '',
    selectedCategory: '',
    notifications: [],
    auth: {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || 'null'),
      isAuthenticated: !!localStorage.getItem('token')
    }
  },
  
  mutations: {
    SET_PRODUCTS(state, products: Product[]) {
      state.products = products;
    },
    SET_ORDERS(state, orders: Order[]) {
      state.orders = orders;
    },
    SET_CATEGORIES(state, categories: string[]) {
      state.categories = categories;
    },
    SET_SEARCH_QUERY(state, query: string) {
      state.searchQuery = query;
    },
    SET_SELECTED_CATEGORY(state, category: string) {
      state.selectedCategory = category;
    },
    ADD_TO_CART(state, product: Product) {
      const existingItem = state.cart.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    REMOVE_FROM_CART(state, productId: number) {
      state.cart = state.cart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    UPDATE_CART_QUANTITY(state, { productId, quantity }: { productId: number, quantity: number }) {
      const item = state.cart.find(item => item.id === productId);
      if (item) {
        item.quantity = quantity;
      }
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    CLEAR_CART(state) {
      state.cart = [];
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    SET_AUTH(state, { token, user }: { token: string, user: User }) {
      state.auth.token = token;
      state.auth.user = user;
      state.auth.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    LOGOUT(state) {
      state.auth.token = null;
      state.auth.user = null;
      state.auth.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    ADD_PRODUCT(state, product: Product) {
      state.products.push(product);
    },
    UPDATE_PRODUCT(state, updatedProduct: Product) {
      const index = state.products.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
    },
    DELETE_PRODUCT(state, productId: number) {
      state.products = state.products.filter(p => p.id !== productId);
    },
    ADD_TO_WISHLIST(state, product: Product) {
      if (!state.wishlist.find(item => item.id === product.id)) {
        state.wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
      }
    },
    REMOVE_FROM_WISHLIST(state, productId: number) {
      state.wishlist = state.wishlist.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    },
    ADD_NOTIFICATION(state, notification: Omit<Notification, 'id'>) {
      const id = Date.now().toString();
      state.notifications.push({ ...notification, id });
      setTimeout(() => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }, 5000);
    },
    REMOVE_NOTIFICATION(state, id: string) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    },
    ADD_TO_COMPARE(state, product: Product) {
      if (!state.compareItems.find(item => item.id === product.id) && state.compareItems.length < 4) {
        state.compareItems.push(product);
        localStorage.setItem('compareItems', JSON.stringify(state.compareItems));
      }
    },
    REMOVE_FROM_COMPARE(state, productId: number) {
      state.compareItems = state.compareItems.filter(item => item.id !== productId);
      localStorage.setItem('compareItems', JSON.stringify(state.compareItems));
    },
    CLEAR_COMPARE(state) {
      state.compareItems = [];
      localStorage.removeItem('compareItems');
    }
  },
  
  actions: {
    async login({ commit }, { email, password }) {
      try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        commit('SET_AUTH', response.data);
        return response.data;
      } catch (error) {
        // Mock login for demo
        if (email === 'admin@example.com' && password === 'admin') {
          const mockUser = {
            token: 'mock-admin-token',
            user: { id: 1, email: 'admin@example.com', role: 'admin' }
          };
          commit('SET_AUTH', mockUser);
          return mockUser;
        }
        if (email === 'user@example.com' && password === 'user') {
          const mockUser = {
            token: 'mock-user-token',
            user: { id: 2, email: 'user@example.com', role: 'user' }
          };
          commit('SET_AUTH', mockUser);
          return mockUser;
        }
        throw new Error('Неверные учетные данные');
      }
    },
    
    logout({ commit }) {
      commit('LOGOUT');
    },
    
    async fetchProducts({ commit, state }) {
      try {
        // Mock products data
        const mockProducts = [
          { id: 1, name: 'Laptop Pro', price: 1299, category: 'Electronics', stock: 10, description: 'High-performance laptop' },
          { id: 2, name: 'Smartphone X', price: 699, category: 'Electronics', stock: 25, description: 'Latest smartphone' },
          { id: 3, name: 'Wireless Headphones', price: 199, category: 'Electronics', stock: 50, description: 'Premium audio quality' },
          { id: 4, name: 'Programming Book', price: 49, category: 'Books', stock: 100, description: 'Learn modern development' }
        ];
        
        let products = mockProducts;
        
        if (state.selectedCategory) {
          products = products.filter(p => p.category.toLowerCase() === state.selectedCategory.toLowerCase());
        }
        
        if (state.searchQuery) {
          products = products.filter(p => 
            p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(state.searchQuery.toLowerCase())
          );
        }
        
        commit('SET_PRODUCTS', products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
    
    async fetchCategories({ commit }) {
      // Mock categories data
      const mockCategories = ['Electronics', 'Books', 'Clothing', 'Home'];
      commit('SET_CATEGORIES', mockCategories);
    },
    
    async fetchOrders({ commit }) {
      // Mock orders data
      const mockOrders = [
        { id: 1, user_id: 1, total: 1299, status: 'pending', created_at: new Date().toISOString() },
        { id: 2, user_id: 2, total: 699, status: 'completed', created_at: new Date().toISOString() }
      ];
      commit('SET_ORDERS', mockOrders);
    },
    
    async createOrder({ commit, state }, orderData = null) {
      // Mock order creation
      const order = orderData || {
        id: Date.now(),
        items: state.cart,
        total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Add to orders list
      commit('SET_ORDERS', [...state.orders, order]);
      commit('CLEAR_CART');
      
      return order;
    },
    
    async addProduct({ commit }, product: Omit<Product, 'id'>) {
      // Mock product creation
      const newProduct = {
        ...product,
        id: Date.now()
      };
      commit('ADD_PRODUCT', newProduct);
      return newProduct;
    },
    
    async updateProduct({ commit }, product: Product) {
      // Mock product update
      commit('UPDATE_PRODUCT', product);
      return product;
    },
    
    async deleteProduct({ commit }, productId: number) {
      // Mock product deletion
      commit('DELETE_PRODUCT', productId);
    },
    
    addNotification({ commit }, notification: Omit<Notification, 'id'>) {
      commit('ADD_NOTIFICATION', notification);
    }
  },
  
  getters: {
    cartTotal: (state) => state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    cartItemsCount: (state) => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    isAuthenticated: (state) => state.auth.isAuthenticated,
    isAdmin: (state) => {
      const user = state.auth.user;
      return user && (user.role === 'admin' || user.email === 'admin@example.com');
    },
    currentUser: (state) => state.auth.user,
    filteredProducts: (state) => {
      let products = state.products;
      if (state.selectedCategory) {
        products = products.filter(p => p.category === state.selectedCategory);
      }
      if (state.searchQuery) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
      }
      return products;
    },
    wishlistCount: (state) => state.wishlist.length,
    isInWishlist: (state) => (productId: number) => {
      return state.wishlist.some(item => item.id === productId);
    },
    compareCount: (state) => state.compareItems.length,
    isInCompare: (state) => (productId: number) => {
      return state.compareItems.some(item => item.id === productId);
    }
  }
});