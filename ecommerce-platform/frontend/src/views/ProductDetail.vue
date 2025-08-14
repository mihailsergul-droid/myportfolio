<template>
  <div v-if="product" class="product-detail">
    <div class="product-main">
      <div class="product-image">
        <img :src="product.image || '/placeholder.jpg'" :alt="product.name">
      </div>
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="price">${{ product.price }}</p>
        <p class="category">Категория: {{ product.category }}</p>
        <p class="stock">В наличии: {{ product.stock }}</p>
        <p class="description">{{ product.description }}</p>
        
        <div class="actions">
          <div class="quantity-selector">
            <button @click="quantity > 1 && quantity--" class="btn btn-sm">-</button>
            <span class="quantity">{{ quantity }}</span>
            <button @click="quantity < product.stock && quantity++" class="btn btn-sm">+</button>
          </div>
          <button 
            @click="addToCart" 
            class="btn btn-primary"
            :disabled="product.stock === 0 || !isAuthenticated"
          >
            {{ product.stock === 0 ? 'Нет в наличии' : 'В корзину' }}
          </button>
        </div>
      </div>
    </div>

    <div class="reviews-section">
      <h3>Отзывы</h3>
      
      <div v-if="isAuthenticated" class="add-review">
        <h4>Добавить отзыв</h4>
        <form @submit.prevent="submitReview" class="review-form">
          <div class="rating-input">
            <span>Оценка:</span>
            <div class="stars">
              <button 
                v-for="star in 5" 
                :key="star"
                type="button"
                @click="newReview.rating = star"
                :class="['star', { active: star <= newReview.rating }]"
              >
                ★
              </button>
            </div>
          </div>
          <textarea 
            v-model="newReview.comment" 
            placeholder="Ваш отзыв..."
            required
          ></textarea>
          <button type="submit" class="btn btn-primary">Отправить</button>
        </form>
      </div>

      <div class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review">
          <div class="review-header">
            <span class="author">{{ review.author }}</span>
            <div class="rating">
              <span v-for="star in 5" :key="star" :class="['star', { filled: star <= review.rating }]">★</span>
            </div>
          </div>
          <p class="comment">{{ review.comment }}</p>
          <span class="date">{{ formatDate(review.date) }}</span>
        </div>
      </div>
    </div>
    
    <RecommendedProducts 
      type="similar" 
      :product-id="product.id"
      title="Похожие товары"
      @add-to-cart="addToCart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import RecommendedProducts from '../components/RecommendedProducts.vue';

const store = useStore();
const route = useRoute();

const product = ref(null);
const quantity = ref(1);
const reviews = ref([]);

const newReview = reactive({
  rating: 5,
  comment: ''
});

const isAuthenticated = computed(() => store.getters.isAuthenticated);

const addToCart = () => {
  if (!isAuthenticated.value) {
    store.dispatch('addNotification', { type: 'error', message: 'Войдите для добавления в корзину' });
    return;
  }
  
  for (let i = 0; i < quantity.value; i++) {
    store.commit('ADD_TO_CART', product.value);
  }
  
  store.dispatch('addNotification', { 
    type: 'success', 
    message: `${product.value.name} добавлен в корзину` 
  });
};

const submitReview = () => {
  const review = {
    id: Date.now(),
    productId: product.value.id,
    author: store.getters.currentUser?.email || 'Аноним',
    rating: newReview.rating,
    comment: newReview.comment,
    date: new Date().toISOString()
  };
  
  reviews.value.unshift(review);
  newReview.rating = 5;
  newReview.comment = '';
  
  store.dispatch('addNotification', { type: 'success', message: 'Отзыв добавлен' });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

onMounted(async () => {
  const productId = route.params.id;
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`);
    product.value = await response.json();
    
    // Mock reviews
    reviews.value = [
      { id: 1, productId: productId, author: 'user@test.com', rating: 5, comment: 'Отличный товар!', date: '2024-01-15' },
      { id: 2, productId: productId, author: 'admin@test.com', rating: 4, comment: 'Хорошее качество', date: '2024-01-10' }
    ];
  } catch (error) {
    console.error('Error fetching product:', error);
  }
});
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.product-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.product-image {
  background: #f8f9fa;
  border-radius: 8px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.product-info h1 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.price {
  font-size: 1.5rem;
  color: #007bff;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  margin: 15px 0;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.reviews-section {
  border-top: 1px solid #ddd;
  padding-top: 30px;
}

.add-review {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  background: none;
  border: none;
  font-size: 20px;
  color: #ddd;
  cursor: pointer;
}

.star.active, .star.filled {
  color: #ffc107;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.author {
  font-weight: bold;
}

.rating .star {
  font-size: 16px;
}

.date {
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .product-main {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>