// Service de paiement Backend Spring Boot
import { apiClient } from '../config/api-config';
import { toast } from '@/hooks/use-toast';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: "mobile_money" | "card" | "paypal";
  provider?: string; // orange, wave, mtn, moov
  phoneNumber?: string;
  cardDetails?: {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  payment_url?: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  provider?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  orderId: string;
  userId: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

class PaymentService {
  // Initier un paiement
  async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post<PaymentResponse>('/payments/initiate', paymentData);
      
      if (response.success) {
        toast({
          title: "Paiement initié",
          description: "Redirection vers le portail de paiement...",
        });
        
        // Redirection si URL fournie
        if (response.payment_url) {
          window.open(response.payment_url, '_blank');
        }
      }
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible d'initier le paiement",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      return await apiClient.get<PaymentResponse>(`/payments/status/${transactionId}`);
    } catch (error: any) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  // Historique des paiements
  async getPaymentHistory(): Promise<Transaction[]> {
    try {
      return await apiClient.get<Transaction[]>('/payments/history');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Orange Money
  async initiateOrangeMoneyPayment(
    phoneNumber: string,
    amount: number,
    orderId: string
  ): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post<PaymentResponse>('/payments/orange-money/initiate', {
        phoneNumber,
        amount,
        orderId
      });
      
      if (response.payment_url) {
        window.open(response.payment_url, '_blank');
      }
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur Orange Money",
        description: error.message || "Impossible d'initier le paiement",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Simuler un callback (pour tests)
  async simulateMobileMoneyCallback(
    transactionId: string,
    status: "SUCCESS" | "FAILED" | "PENDING"
  ): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post<PaymentResponse>(
        '/payments/callback',
        {
          transactionId,
          status,
          externalReference: `EXT-${Date.now()}`
        },
        false
      );
      
      toast({
        title: "Callback simulé",
        description: `Transaction ${transactionId} -> ${status}`,
      });
      
      return response;
    } catch (error: any) {
      console.error('Callback simulation error:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
