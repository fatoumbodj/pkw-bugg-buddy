// Service de gestion des commandes Backend Spring Boot
import { apiClient } from '../config/api-config';
import { toast } from '@/hooks/use-toast';

export interface OrderItem {
  bookId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
}

export interface Order {
  id: string;
  orderReference: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

class OrderService {
  // Créer une commande
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post<Order>('/orders', orderData);
      
      toast({
        title: "Commande créée",
        description: `Référence: ${response.orderReference}`,
      });
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la commande",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Obtenir une commande
  async getOrder(orderId: string): Promise<Order> {
    try {
      return await apiClient.get<Order>(`/orders/${orderId}`);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la commande",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Obtenir toutes les commandes de l'utilisateur
  async getUserOrders(): Promise<Order[]> {
    try {
      return await apiClient.get<Order[]>('/orders/my-orders');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos commandes",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Admin: Obtenir toutes les commandes
  async getAllOrders(): Promise<Order[]> {
    try {
      return await apiClient.get<Order[]>('/orders/admin/all');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const response = await apiClient.put<Order>(`/orders/${orderId}/status`, { status });
      
      toast({
        title: "Statut mis à jour",
        description: `Commande ${status}`,
      });
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Annuler une commande
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.post<Order>(`/orders/${orderId}/cancel`);
      
      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée",
      });
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'annuler la commande",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const orderService = new OrderService();
