// Service de gestion des livres Backend Spring Boot
import { apiClient } from '../config/api-config';
import { toast } from '@/hooks/use-toast';

export interface BookData {
  title: string;
  coverStyle: string;
  coverColor: string;
  messages?: any[];
  fileUrl?: string;
  userId?: string;
}

export interface Book {
  id: string;
  title: string;
  coverStyle: string;
  coverColor: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  fileUrl?: string;
  pdfUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

class BookService {
  // Créer un livre
  async createBook(bookData: BookData): Promise<Book> {
    try {
      const response = await apiClient.post<Book>('/books', bookData);
      
      toast({
        title: "Livre créé",
        description: "Votre livre est en cours de création",
      });
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le livre",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Upload fichier WhatsApp
  async uploadWhatsAppFile(file: File): Promise<{ fileUrl: string; messages: any[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/api/books/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      return response.json();
    } catch (error: any) {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader le fichier",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Obtenir un livre
  async getBook(bookId: string): Promise<Book> {
    try {
      return await apiClient.get<Book>(`/books/${bookId}`);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le livre",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Obtenir tous les livres de l'utilisateur
  async getUserBooks(): Promise<Book[]> {
    try {
      return await apiClient.get<Book[]>('/books/my-books');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos livres",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Mettre à jour un livre
  async updateBook(bookId: string, updates: Partial<BookData>): Promise<Book> {
    try {
      const response = await apiClient.put<Book>(`/books/${bookId}`, updates);
      
      toast({
        title: "Livre mis à jour",
        description: "Les modifications ont été enregistrées",
      });
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le livre",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Générer le PDF
  async generatePDF(bookId: string): Promise<{ pdfUrl: string }> {
    try {
      const response = await apiClient.post<{ pdfUrl: string }>(`/books/${bookId}/generate-pdf`);
      
      toast({
        title: "PDF généré",
        description: "Votre livre est prêt",
      });
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le PDF",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const bookService = new BookService();
