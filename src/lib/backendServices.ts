// Services Backend remplaçant supabaseServices
import { apiClient } from './backendApi';

// Service pour formater les prix
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Service de commandes
export const orderService = {
  async createOrder(orderData: any) {
    return await apiClient.post('/orders', orderData);
  },
  
  async getOrder(orderId: string) {
    return await apiClient.get(`/orders/${orderId}`);
  },
  
  async getOrderById(orderId: string) {
    return await apiClient.get(`/orders/${orderId}`);
  },
  
  async getAllOrders(filters?: any) {
    return await apiClient.get('/orders', false);
  },
  
  async getUserOrders() {
    return await apiClient.get('/orders/my-orders');
  },
  
  async updateOrderStatus(orderId: string, status: string) {
    return await apiClient.put(`/orders/${orderId}/status`, { status });
  },
  
  async getDashboardStats() {
    return await apiClient.get('/orders/stats');
  }
};

// Service de paiements
export const paymentService = {
  async createPayment(paymentData: any) {
    return await apiClient.post('/payments', paymentData);
  },
  
  async processPayment(paymentData: any) {
    return await apiClient.post('/payments/process', paymentData);
  },
  
  async verifyPayment(paymentId: string) {
    return await apiClient.get(`/payments/${paymentId}/verify`);
  },
  
  async getPaymentStatus(paymentId: string) {
    return await apiClient.get(`/payments/${paymentId}/status`);
  }
};

// Service de produits
export const productService = {
  async getProducts() {
    return await apiClient.get('/products');
  },
  
  async getProduct(productId: string) {
    return await apiClient.get(`/products/${productId}`);
  },
  
  async createProduct(productData: any) {
    return await apiClient.post('/products', productData);
  },
  
  async updateProduct(productId: string, productData: any) {
    return await apiClient.put(`/products/${productId}`, productData);
  },
  
  async deleteProduct(productId: string) {
    return await apiClient.delete(`/products/${productId}`);
  }
};