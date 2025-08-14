<template>
  <div class="user-management">
    <div class="page-header">
      <h2>Управление пользователями</h2>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
        </svg>
        Добавить пользователя
      </button>
    </div>

    <div class="filters-section">
      <input v-model="searchQuery" placeholder="Поиск пользователей..." class="input">
      <select v-model="roleFilter" class="input">
        <option value="">Все роли</option>
        <option value="admin">Администратор</option>
        <option value="user">Пользователь</option>
      </select>
    </div>

    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Дата регистрации</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-badge', user.role]">{{ user.role }}</span>
            </td>
            <td>
              <span :class="['status-badge', user.status]">{{ user.status }}</span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="actions">
                <button @click="editUser(user)" class="btn btn-sm">Изменить</button>
                <button @click="toggleUserStatus(user)" class="btn btn-sm" 
                        :class="user.status === 'active' ? 'btn-danger' : 'btn-success'">
                  {{ user.status === 'active' ? 'Заблокировать' : 'Разблокировать' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :is-open="showCreateModal" title="Создать пользователя" @close="showCreateModal = false">
      <form @submit.prevent="createUser" class="user-form">
        <input v-model="newUser.email" type="email" placeholder="Email" class="input" required>
        <input v-model="newUser.password" type="password" placeholder="Пароль" class="input" required>
        <select v-model="newUser.role" class="input" required>
          <option value="user">Пользователь</option>
          <option value="admin">Администратор</option>
        </select>
      </form>
      <template #footer>
        <button @click="showCreateModal = false" class="btn btn-secondary">Отмена</button>
        <button @click="createUser" class="btn btn-primary">Создать</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import Modal from '../components/Modal.vue';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  createdAt: string;
}

const store = useStore();
const users = ref<User[]>([]);
const searchQuery = ref('');
const roleFilter = ref('');
const showCreateModal = ref(false);

const newUser = reactive({
  email: '',
  password: '',
  role: 'user' as 'admin' | 'user'
});

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = !roleFilter.value || user.role === roleFilter.value;
    return matchesSearch && matchesRole;
  });
});

const createUser = () => {
  const user: User = {
    id: Date.now(),
    email: newUser.email,
    role: newUser.role,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  users.value.push(user);
  showCreateModal.value = false;
  Object.assign(newUser, { email: '', password: '', role: 'user' });
  
  store.dispatch('addNotification', {
    type: 'success',
    message: 'Пользователь создан успешно'
  });
};

const editUser = (user: User) => {
  // Implement edit functionality
  console.log('Edit user:', user);
};

const toggleUserStatus = (user: User) => {
  user.status = user.status === 'active' ? 'blocked' : 'active';
  store.dispatch('addNotification', {
    type: 'info',
    message: `Пользователь ${user.status === 'active' ? 'разблокирован' : 'заблокирован'}`
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

onMounted(() => {
  // Mock data
  users.value = [
    { id: 1, email: 'admin@example.com', role: 'admin', status: 'active', createdAt: '2024-01-01' },
    { id: 2, email: 'user@example.com', role: 'user', status: 'active', createdAt: '2024-01-02' }
  ];
});
</script>

<style scoped>
.user-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.filters-section .input {
  max-width: 200px;
}

.users-table {
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.role-badge, .status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.admin {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger);
}

.role-badge.user {
  background: rgb(59 130 246 / 0.1);
  color: var(--primary);
}

.status-badge.active {
  background: rgb(16 185 129 / 0.1);
  color: var(--success);
}

.status-badge.blocked {
  background: rgb(156 163 175 / 0.1);
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 8px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .filters-section .input {
    max-width: none;
  }
  
  .users-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 600px;
  }
}
</style>