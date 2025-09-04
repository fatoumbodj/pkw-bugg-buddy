// Service de gestion des livres Backend Java
import { apiClient, handleApiError } from './backendApi';
import { toast } from '@/hooks/use-toast';

export interface BookCreationRequest {
  title: string;
  dedication?: string;
  preface?: string;
  sweetMessage?: string;
  coverColor: string;
  bubbleColors: {
    sent: string;
    received: string;
  };
  coverImage?: File;
  chatData: any[];
}

export interface Book {
  id: string;
  title: string;
  userId: string;
  dedication?: string;
  preface?: string;
  sweetMessage?: string;
  coverColor: string;
  bubbleColors: {
    sent: string;
    received: string;
  };
  coverImageUrl?: string;
  chatData: any[];
  status: 'DRAFT' | 'PROCESSING' | 'READY' | 'PRINTED';
  createdAt: string;
  updatedAt: string;
  pdfUrl?: string;
}

class BackendBookService {
  // Créer un livre à partir d'un fichier ZIP WhatsApp
  async createBookFromZip(zipFile: File, bookData: Omit<BookCreationRequest, 'chatData'>): Promise<{ bookId: string }> {
    try {
      const formData = new FormData();
      formData.append('zipFile', zipFile);
      formData.append('title', bookData.title);
      formData.append('dedication', bookData.dedication || '');
      formData.append('preface', bookData.preface || '');
      formData.append('sweetMessage', bookData.sweetMessage || '');
      formData.append('coverColor', bookData.coverColor);
      formData.append('bubbleColors', JSON.stringify(bookData.bubbleColors));
      
      if (bookData.coverImage) {
        formData.append('coverImage', bookData.coverImage);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/books/create-from-zip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du livre');
      }

      const result = await response.json();
      
      toast({
        title: "Livre créé avec succès",
        description: "Votre livre est en cours de traitement...",
      });

      return { bookId: result.id };
    } catch (error: any) {
      console.error('Book creation error:', error);
      toast({
        title: "Erreur de création",
        description: error.message || "Impossible de créer le livre",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Obtenir un livre par ID
  async getBook(bookId: string): Promise<Book> {
    try {
      const response = await apiClient.get(`/books/${bookId}`);
      return response;
    } catch (error: any) {
      console.error('Get book error:', error);
      throw error;
    }
  }

  // Obtenir tous les livres de l'utilisateur
  async getUserBooks(): Promise<Book[]> {
    try {
      const response = await apiClient.get('/books/my-books');
      return response;
    } catch (error: any) {
      console.error('Get user books error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos livres",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Mettre à jour un livre
  async updateBook(bookId: string, updateData: Partial<BookCreationRequest>): Promise<Book> {
    try {
      const response = await apiClient.put(`/books/${bookId}`, updateData);
      
      toast({
        title: "Livre mis à jour",
        description: "Les modifications ont été sauvegardées",
      });

      return response;
    } catch (error: any) {
      console.error('Update book error:', error);
      toast({
        title: "Erreur de mise à jour",
        description: error.message || "Impossible de mettre à jour le livre",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Supprimer un livre
  async deleteBook(bookId: string): Promise<void> {
    try {
      await apiClient.delete(`/books/${bookId}`);
      
      toast({
        title: "Livre supprimé",
        description: "Le livre a été supprimé avec succès",
      });
    } catch (error: any) {
      console.error('Delete book error:', error);
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer le livre",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Générer le PDF du livre
  async generatePDF(bookId: string): Promise<{ pdfUrl: string }> {
    try {
      const response = await apiClient.post(`/books/${bookId}/generate-pdf`, {});
      
      toast({
        title: "PDF généré",
        description: "Votre livre PDF est prêt !",
      });

      return response;
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer le PDF",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Ajouter un livre au panier
  async addToCart(bookId: string, quantity: number = 1): Promise<void> {
    try {
      await apiClient.post('/cart/add', {
        bookId,
        quantity
      });
      
      toast({
        title: "Ajouté au panier",
        description: "Le livre a été ajouté à votre panier",
      });
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter au panier",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Obtenir le statut de traitement d'un livre
  async getBookStatus(bookId: string): Promise<{ status: string; progress: number }> {
    try {
      const response = await apiClient.get(`/books/${bookId}/status`);
      return response;
    } catch (error: any) {
      console.error('Get book status error:', error);
      throw error;
    }
  }
}

export const backendBookService = new BackendBookService();