export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at?: string;
  items?: CartItem[];
}

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface State {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  wishlist: Product[];
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
  notifications: Notification[];
  auth: AuthState;
}