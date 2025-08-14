import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Admin from './views/Admin.vue';
import Cart from './views/Cart.vue';
import Login from './views/Login.vue';
import ProductDetail from './views/ProductDetail.vue';
import Wishlist from './views/Wishlist.vue';
import Profile from './views/Profile.vue';
import store from './store';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/product/:id', component: ProductDetail },
    { path: '/cart', component: Cart, meta: { requiresAuth: true } },
    { path: '/checkout', component: () => import('./views/Checkout.vue'), meta: { requiresAuth: true } },
    { path: '/wishlist', component: Wishlist, meta: { requiresAuth: true } },
    { path: '/compare', component: () => import('./views/Compare.vue') },
    { path: '/track-order', component: () => import('./views/OrderTracking.vue') },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/analytics', component: () => import('./views/Analytics.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/inventory', component: () => import('./views/InventoryManagement.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/coupons', component: () => import('./views/CouponManagement.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/notifications', component: () => import('./views/NotificationCenter.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/bulk', component: () => import('./views/BulkOperations.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/backup', component: () => import('./views/BackupRestore.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin', component: Admin, meta: { requiresAuth: true, requiresAdmin: true } }
  ]
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  const isAdmin = store.getters.isAdmin;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/');
  } else {
    next();
  }
});

export default router;