<template>
  <div class="checkout">
    <h2>Оформление заказа</h2>
    
    <div class="checkout-content">
      <div class="checkout-form">
        <div class="step" :class="{ active: currentStep >= 1 }">
          <h3>1. Информация о доставке</h3>
          <form v-if="currentStep === 1" @submit.prevent="nextStep" class="form">
            <input v-model="shippingInfo.name" placeholder="Полное имя" required>
            <input v-model="shippingInfo.phone" placeholder="Телефон" required>
            <input v-model="shippingInfo.email" type="email" placeholder="Email" required>
            <textarea v-model="shippingInfo.address" placeholder="Адрес доставки" required></textarea>
            <div class="shipping-options">
              <h4>Способ доставки:</h4>
              <label v-for="option in shippingOptions" :key="option.id" class="radio-label">
                <input v-model="selectedShipping" :value="option" type="radio" name="shipping">
                <span>{{ option.name }} - ${{ option.price }}</span>
              </label>
            </div>
            <button type="submit" class="btn btn-primary">Далее</button>
          </form>
        </div>

        <div class="step" :class="{ active: currentStep >= 2 }">
          <h3>2. Способ оплаты</h3>
          <div v-if="currentStep === 2" class="payment-methods">
            <label v-for="method in paymentMethods" :key="method.id" class="radio-label">
              <input v-model="selectedPayment" :value="method" type="radio" name="payment">
              <span>{{ method.name }}</span>
            </label>
            
            <div v-if="selectedPayment?.id === 'card'" class="card-form">
              <input v-model="cardInfo.number" placeholder="Номер карты" maxlength="19">
              <div class="card-row">
                <input v-model="cardInfo.expiry" placeholder="MM/YY" maxlength="5">
                <input v-model="cardInfo.cvv" placeholder="CVV" maxlength="3">
              </div>
              <input v-model="cardInfo.name" placeholder="Имя на карте">
            </div>
            
            <div class="step-buttons">
              <button @click="currentStep = 1" class="btn">Назад</button>
              <button @click="nextStep" class="btn btn-primary">Далее</button>
            </div>
          </div>
        </div>

        <div class="step" :class="{ active: currentStep >= 3 }">
          <h3>3. Подтверждение заказа</h3>
          <div v-if="currentStep === 3">
            <div class="order-summary">
              <h4>Ваш заказ:</h4>
              <div v-for="item in cart" :key="item.id" class="order-item">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
              
              <div class="coupon-section">
                <div class="coupon-input">
                  <input v-model="couponCode" placeholder="Код купона">
                  <button @click="applyCoupon" class="btn btn-sm">Применить</button>
                </div>
                <div v-if="appliedCoupon" class="coupon-applied">
                  Купон применен: -${{ discount.toFixed(2) }}
                </div>
              </div>
              
              <div class="totals">
                <div class="total-row">
                  <span>Подытог:</span>
                  <span>${{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="total-row">
                  <span>Доставка:</span>
                  <span>${{ selectedShipping?.price || 0 }}</span>
                </div>
                <div v-if="discount > 0" class="total-row">
                  <span>Скидка:</span>
                  <span>-${{ discount.toFixed(2) }}</span>
                </div>
                <div class="total-row final">
                  <span>Итого:</span>
                  <span>${{ finalTotal.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <div class="step-buttons">
              <button @click="currentStep = 2" class="btn">Назад</button>
              <button @click="placeOrder" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Оформление...' : 'Оформить заказ' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import axios from 'axios';

const store = useStore();
const router = useRouter();

const currentStep = ref(1);
const loading = ref(false);
const couponCode = ref('');
const appliedCoupon = ref(null);
const discount = ref(0);

const cart = computed(() => store.state.cart);
const subtotal = computed(() => store.getters.cartTotal);
const finalTotal = computed(() => subtotal.value + (selectedShipping.value?.price || 0) - discount.value);

const shippingInfo = reactive({
  name: '',
  phone: '',
  email: '',
  address: ''
});

const cardInfo = reactive({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
});

const shippingOptions = [
  { id: 'standard', name: 'Стандартная доставка (5-7 дней)', price: 10 },
  { id: 'express', name: 'Экспресс доставка (1-2 дня)', price: 25 },
  { id: 'pickup', name: 'Самовывоз', price: 0 }
];

const paymentMethods = [
  { id: 'card', name: 'Банковская карта' },
  { id: 'cash', name: 'Наличными при получении' },
  { id: 'paypal', name: 'PayPal' }
];

const selectedShipping = ref(shippingOptions[0]);
const selectedPayment = ref(paymentMethods[0]);

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const applyCoupon = async () => {
  if (!couponCode.value) return;
  
  try {
    const response = await axios.post('http://localhost:3000/api/validate-coupon', {
      code: couponCode.value,
      total: subtotal.value
    });
    
    if (response.data.valid) {
      appliedCoupon.value = response.data.coupon;
      discount.value = response.data.discount;
      store.dispatch('addNotification', { type: 'success', message: 'Купон применен!' });
    } else {
      store.dispatch('addNotification', { type: 'error', message: response.data.error });
    }
  } catch (error) {
    store.dispatch('addNotification', { type: 'error', message: 'Ошибка применения купона' });
  }
};

const placeOrder = async () => {
  loading.value = true;
  
  try {
    const orderData = {
      items: cart.value,
      total: finalTotal.value,
      shipping: selectedShipping.value,
      payment: selectedPayment.value,
      shippingInfo: shippingInfo,
      coupon: appliedCoupon.value
    };
    
    await store.dispatch('createOrder', orderData);
    store.dispatch('addNotification', { type: 'success', message: 'Заказ успешно оформлен!' });
    router.push('/profile');
  } catch (error) {
    store.dispatch('addNotification', { type: 'error', message: 'Ошибка оформления заказа' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (cart.value.length === 0) {
    router.push('/cart');
  }
  
  const user = store.getters.currentUser;
  if (user) {
    shippingInfo.email = user.email;
  }
});
</script>

<style scoped>
.checkout {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-content {
  margin-top: 20px;
}

.step {
  background: white;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  opacity: 0.6;
}

.step.active {
  opacity: 1;
  border-left: 4px solid #007bff;
}

.step h3 {
  margin-bottom: 15px;
  color: #333;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form input, .form textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.shipping-options, .payment-methods {
  margin: 15px 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.card-form {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.step-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.order-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.coupon-section {
  margin: 15px 0;
  padding: 15px 0;
  border-top: 1px solid #ddd;
}

.coupon-input {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.coupon-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.coupon-applied {
  color: #28a745;
  font-weight: bold;
}

.totals {
  border-top: 1px solid #ddd;
  padding-top: 15px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.total-row.final {
  font-weight: bold;
  font-size: 1.1rem;
  border-top: 1px solid #ddd;
  padding-top: 8px;
}

@media (max-width: 768px) {
  .step-buttons {
    flex-direction: column;
  }
  
  .card-row {
    grid-template-columns: 1fr;
  }
}
</style>