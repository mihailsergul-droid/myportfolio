<template>
  <div class="chat-support">
    <div v-if="!isOpen" @click="toggleChat" class="chat-button">
      💬
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
    </div>
    
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <span>Поддержка</span>
        <button @click="toggleChat" class="close-btn">×</button>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" 
             :class="['message', message.sender]">
          <div class="message-content">
            <p>{{ message.text }}</p>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <input v-model="newMessage" @keyup.enter="sendMessage" 
               placeholder="Введите сообщение...">
        <button @click="sendMessage" class="send-btn">➤</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';

const isOpen = ref(false);
const newMessage = ref('');
const unreadCount = ref(0);
const messagesContainer = ref(null);

const messages = ref([
  { id: 1, text: 'Здравствуйте! Как дела?', sender: 'support', timestamp: new Date() }
]);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unreadCount.value = 0;
    nextTick(() => scrollToBottom());
  }
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  
  messages.value.push({
    id: Date.now(),
    text: newMessage.value,
    sender: 'user',
    timestamp: new Date()
  });
  
  newMessage.value = '';
  nextTick(() => scrollToBottom());
  
  // Simulate support response
  setTimeout(() => {
    messages.value.push({
      id: Date.now(),
      text: 'Спасибо за ваше сообщение! Мы поможем вам в ближайшее время.',
      sender: 'support',
      timestamp: new Date()
    });
    if (!isOpen.value) unreadCount.value++;
    nextTick(() => scrollToBottom());
  }, 2000);
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.chat-support {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-button {
  width: 60px;
  height: 60px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
  position: relative;
  transition: transform 0.3s;
}

.chat-button:hover {
  transform: scale(1.1);
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.chat-window {
  width: 350px;
  height: 450px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #007bff;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.support {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background: #007bff;
  color: white;
}

.message.support .message-content {
  background: #f1f1f1;
  color: #333;
}

.message-content p {
  margin: 0 0 5px 0;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.send-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .chat-window {
    width: 300px;
    height: 400px;
  }
}
</style>