<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Вход в систему</h2>
      <div class="form">
        <input v-model="email" type="email" placeholder="Email" required>
        <input v-model="password" type="password" placeholder="Пароль" required>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="demo-accounts">
        <p><strong>Тестовые аккаунты:</strong></p>
        <div class="account-info">
          <div class="account-details">
            <strong>Администратор:</strong><br>
            Email: admin@example.com<br>
            Пароль: admin
          </div>
          <button @click="quickLogin('admin@example.com', 'admin')" class="quick-login-btn">
            Войти как админ
          </button>
        </div>
        <div class="account-info">
          <div class="account-details">
            <strong>Пользователь:</strong><br>
            Email: user@example.com<br>
            Пароль: user
          </div>
          <button @click="quickLogin('user@example.com', 'user')" class="quick-login-btn">
            Войти как пользователь
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await store.dispatch('login', { email: email.value, password: password.value });
    
    // Проверяем роль пользователя
    const isAdmin = store.getters.isAdmin;
    
    store.dispatch('addNotification', {
      type: 'success',
      message: `Добро пожаловать${isAdmin ? ', администратор' : ''}!`
    });
    
    // Перенаправляем админа в админ-панель
    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  } catch (err: any) {
    error.value = err.message || 'Неверные учетные данные';
  } finally {
    loading.value = false;
  }
};

const quickLogin = async (userEmail: string, userPassword: string) => {
  email.value = userEmail;
  password.value = userPassword;
  await handleLogin();
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.error {
  color: red;
  margin-top: 10px;
  text-align: center;
}

.demo-accounts {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  font-size: 0.9rem;
}

.account-info {
  margin: 10px 0;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #007bff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.account-details {
  flex: 1;
}

.quick-login-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.quick-login-btn:hover {
  background: #0056b3;
}

.quick-login-btn:active {
  transform: translateY(1px);
}

@media (max-width: 480px) {
  .account-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quick-login-btn {
    margin-top: 8px;
  }
}
</style>