import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ChatPreview } from '@/components/ChatPreview';
import { PDFGenerator } from '@/components/PDFGenerator';
import { toast } from 'sonner';
import { WhatsAppParser, ParsedConversation } from '@/utils/whatsappParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, BookOpen, Upload } from 'lucide-react';

const Index = () => {
  const [conversation, setConversation] = useState<ParsedConversation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    toast.info('Traitement du fichier en cours...');

    try {
      const parser = new WhatsAppParser();
      const parsed = await parser.parseZipFile(file);
      
      setConversation(parsed);
      toast.success(`${parsed.messages.length} messages chargés avec succès !`);
      
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      toast.error('Erreur lors du traitement du fichier WhatsApp');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">WhatsApp to PDF</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transformez vos conversations WhatsApp en magnifique livre PDF souvenir 
            avec des bulles de messages et des images
          </p>
        </div>

        {!conversation ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Étape 1: Importez votre export WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload onFileSelect={handleFileSelect} />
                {isProcessing && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Analyse du fichier ZIP en cours...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comment exporter vos conversations WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Sur Android:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Ouvrez la conversation WhatsApp</li>
                  <li>Appuyez sur les 3 points → Plus → Exporter la discussion</li>
                  <li>Choisissez "Inclure les médias"</li>
                  <li>Sélectionnez "Enregistrer dans les fichiers"</li>
                </ol>
                
                <p className="mt-4"><strong>Sur iPhone:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Ouvrez la conversation WhatsApp</li>
                  <li>Appuyez sur le nom du contact → Exporter la discussion</li>
                  <li>Choisissez "Joindre les médias"</li>
                  <li>Sélectionnez "Enregistrer dans Fichiers"</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatPreview 
                messages={conversation.messages}
                participants={conversation.participants}
              />
            </div>
            
            <div className="space-y-4">
              <PDFGenerator 
                messages={conversation.messages}
                participants={conversation.participants}
              />
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <button
                      onClick={() => setConversation(null)}
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      Charger une autre conversation
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
