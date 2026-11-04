import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const registerUser = (userData) => api.post('accounts/register/', userData);
export const loginUser = (credentials) => api.post('accounts/login/', credentials);
export const getRestaurants = () => api.get('restaurants/');
export const createRestaurant = (restaurantData) => api.post('restaurants/', restaurantData);
export const updateRestaurant = (restaurantId, restaurantData) => api.put(`restaurants/${restaurantId}/`, restaurantData);

// Alterado para enviar o ID do restaurante dentro do objeto do prato para a rota padrão 'menu-items/'
export const createMenuItem = (restaurantId, itemData) => api.post('menu-items/', { ...itemData, restaurant: restaurantId });

export const updateMenuItem = (itemId, itemData) => api.put(`menu-items/${itemId}/`, itemData);
export const deleteMenuItem = (itemId) => api.delete(`menu-items/${itemId}/`);
export const getOrders = () => api.get('orders/');
export const createOrder = (orderData) => api.post('orders/', orderData);
export const updateOrderStatus = (orderId, status) => api.patch(`orders/${orderId}/update_status/`, { status });

export default api;