import axios from 'axios';

const API_BASE_URL = 'http://localhost:5045/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) =>
    api.post('/auth/register', data).then(res => res.data),
  
  login: (data) =>
    api.post('/auth/login', data).then(res => res.data),
  
  logout: (userId) =>
    api.post('/auth/logout', { userId }).then(res => res.data),
};

export const categoriesAPI = {
  getAll: () =>
    api.get('/categories').then(res => res.data),
  
  getExperts: (categoryId) =>
    api.get(`/categories/${categoryId}/experts`).then(res => res.data),
};

export const chatAPI = {
  startSession: (expertId) =>
    api.post('/chat/start', { expertId }).then(res => res.data),
  
  getSessions: () =>
    api.get('/chat/sessions').then(res => res.data),
  
  getSessionInfo: (sessionId) =>
    api.get(`/chat/sessions/${sessionId}/info`).then(res => res.data),
  
  getMessages: (sessionId) =>
    api.get(`/chat/sessions/${sessionId}/messages`).then(res => res.data),
  
  endSession: (sessionId) =>
    api.post(`/chat/sessions/${sessionId}/end`).then(res => res.data),
  
  getExpertEarnings: () =>
    api.get('/chat/expert-earnings').then(res => res.data),
};

export const paymentAPI = {
  createOrder: (amount) =>
    api.post('/payment/create-order', { amount }).then(res => res.data),
  
  verifyPayment: (orderId, paymentId, signature) =>
    api.post('/payment/verify', { orderId, paymentId, signature }).then(res => res.data),
  
  getHistory: () =>
    api.get('/payment/history').then(res => res.data),
  
  demoPayment: (amount) =>
    api.post('/payment/demo-payment', { amount }).then(res => res.data),
};

export const adminAPI = {
  getStats: () =>
    api.get('/admin/stats').then(res => res.data),
  
  // User Management
  getUsers: () =>
    api.get('/admin/users').then(res => res.data),
  
  createUser: (data) =>
    api.post('/admin/users', data).then(res => res.data),
  
  updateUser: (id, data) =>
    api.put(`/admin/users/${id}`, data).then(res => res.data),
  
  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`).then(res => res.data),
  
  // Category Management
  getCategories: () =>
    api.get('/admin/categories').then(res => res.data),
  
  createCategory: (data) =>
    api.post('/admin/categories', data).then(res => res.data),
  
  updateCategory: (id, data) =>
    api.put(`/admin/categories/${id}`, data).then(res => res.data),
  
  deleteCategory: (id) =>
    api.delete(`/admin/categories/${id}`).then(res => res.data),
  
  // Session Monitoring
  getSessions: () =>
    api.get('/admin/sessions').then(res => res.data),
  
  // Expert Management
  getPendingExperts: () =>
    api.get('/admin/pending-experts').then(res => res.data),
  
  approveExpert: (expertId, notes) =>
    api.post(`/admin/approve-expert/${expertId}`, notes || '').then(res => res.data),
  
  rejectExpert: (expertId, notes) =>
    api.post(`/admin/reject-expert/${expertId}`, notes || '').then(res => res.data),
  
  // Inquiries
  getInquiries: () =>
    api.get('/admin/inquiries').then(res => res.data),
  
  markInquiryRead: (id) =>
    api.put(`/admin/inquiry/mark-read/${id}`).then(res => res.data),
  
  // Chat Messages
  getChatMessages: (sessionId) =>
    api.get(`/chat/sessions/${sessionId}/messages`).then(res => res.data),
};

export const inquiryAPI = {
  submit: (data) =>
    api.post('/inquiry/submit', data).then(res => res.data),
  
  getAll: () =>
    api.get('/inquiry/all').then(res => res.data),
  
  markAsRead: (id) =>
    api.put(`/inquiry/mark-read/${id}`).then(res => res.data),
};