import React, { useState } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { bookService } from '@/api/services/book.service';
import { useToast } from '@/hooks/use-toast';

export default function WhatsAppBookCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bookId, setBookId] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(20);

      // Upload file au backend Spring Boot
      const uploadResult = await bookService.uploadWhatsAppFile(file);
      
      setProgress(50);

      // Créer le livre avec les données extraites
      const bookData = {
        title: 'Mon livre WhatsApp',
        coverStyle: 'modern',
        coverColor: '#8B5CF6',
        messages: uploadResult.messages,
        fileUrl: uploadResult.fileUrl,
        userId: user.id
      };

      const book = await bookService.createBook(bookData);
      setBookId(book.id);
      
      setProgress(100);

      toast({
        title: "Livre créé avec succès!",
        description: "Votre livre WhatsApp est prêt",
      });
    } catch (error: any) {
      console.error('Error processing file:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de traiter le fichier",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Créer votre livre WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isProcessing && !bookId && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-6 bg-primary/10 rounded-full">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Téléchargez votre fichier ZIP WhatsApp</h3>
                <p className="text-muted-foreground mb-4">
                  Sélectionnez le fichier ZIP contenant vos conversations WhatsApp exportées
                </p>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="zip-upload"
                />
                <label htmlFor="zip-upload">
                  <Button className="cursor-pointer" asChild>
                    <span>Choisir un fichier ZIP</span>
                  </Button>
                </label>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4">
              <div className="text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Traitement en cours...</h3>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                Création de votre livre personnalisé
              </p>
            </div>
          )}

          {bookId && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-6 bg-green-100 rounded-full">
                  <Download className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Livre créé avec succès!</h3>
                <p className="text-muted-foreground mb-4">
                  Votre livre WhatsApp est prêt. Vous pouvez maintenant le télécharger.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Télécharger le PDF
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}