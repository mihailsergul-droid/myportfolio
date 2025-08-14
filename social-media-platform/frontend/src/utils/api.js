import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify'),
};

// Posts API
export const postsAPI = {
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  createPost: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  getComments: (postId, page = 1) => api.get(`/posts/${postId}/comments?page=${page}`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
};

// Users API
export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  getUserPosts: (username, page = 1) => api.get(`/users/${username}/posts?page=${page}`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  searchUsers: (query) => api.get(`/users/search/${query}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Chat API
export const chatAPI = {
  getChats: () => api.get('/chat'),
  createDirectChat: (userId) => api.post('/chat/direct', { userId }),
  getMessages: (chatId, page = 1) => api.get(`/chat/${chatId}/messages?page=${page}`),
  markAsRead: (chatId) => api.put(`/chat/${chatId}/read`),
};

export default api;