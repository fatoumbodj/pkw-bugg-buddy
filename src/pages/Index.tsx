import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { EnhancedChatPreview } from '@/components/EnhancedChatPreview';
import { PDFGenerator } from '@/components/PDFGenerator';
import { CoverDesigner, CoverDesign } from '@/components/CoverDesigner';
import { BubbleCustomization, BubbleSettings } from '@/components/BubbleCustomization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { WhatsAppParser, ParsedConversation } from '@/utils/whatsappParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, BookOpen, Upload, Palette, Settings } from 'lucide-react';

const Index = () => {
  const [conversation, setConversation] = useState<ParsedConversation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [coverDesign, setCoverDesign] = useState<CoverDesign>({
    title: 'Nos Souvenirs WhatsApp',
    subtitle: 'Livre de conversations',
    backgroundColor: '#1E40AF',
    textColor: '#FFFFFF'
  });
  
  const [bubbleSettings, setBubbleSettings] = useState<BubbleSettings>({
    myBubbleColor: '#3B82F6',
    otherBubbleColor: '#F3F4F6',
    myTextColor: '#FFFFFF',
    otherTextColor: '#000000',
    showTimestamps: true,
    showSenderNames: true,
    bubbleOpacity: 1,
    borderRadius: 12
  });

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    toast.info('Traitement du fichier en cours...');

    try {
      const parser = new WhatsAppParser();
      const parsed = await parser.parseZipFile(file);
      
      setConversation(parsed);
      
      // Update cover design with participants
      setCoverDesign(prev => ({
        ...prev,
        subtitle: `${parsed.participants.join(' & ')} - Livre de conversations`
      }));
      
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
          <div className="space-y-6">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="cover" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Couverture
                </TabsTrigger>
                <TabsTrigger value="bubbles" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Bulles
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Génération
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-6">
                <EnhancedChatPreview 
                  messages={conversation.messages}
                  participants={conversation.participants}
                  bubbleSettings={bubbleSettings}
                />
              </TabsContent>

              <TabsContent value="cover" className="mt-6">
                <CoverDesigner
                  design={coverDesign}
                  onChange={setCoverDesign}
                  participants={conversation.participants}
                />
              </TabsContent>

              <TabsContent value="bubbles" className="mt-6">
                <BubbleCustomization
                  settings={bubbleSettings}
                  onChange={setBubbleSettings}
                  participants={conversation.participants}
                />
              </TabsContent>

              <TabsContent value="generate" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PDFGenerator 
                    messages={conversation.messages}
                    participants={conversation.participants}
                    coverDesign={coverDesign}
                    bubbleSettings={bubbleSettings}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <button
                        onClick={() => setConversation(null)}
                        className="w-full text-sm text-muted-foreground hover:text-foreground underline p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        📁 Charger une autre conversation
                      </button>
                      
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded">
                        <p>💡 <strong>Conseils:</strong></p>
                        <p>• Personnalisez la couverture dans l'onglet "Couverture"</p>
                        <p>• Ajustez les couleurs des bulles dans "Bulles"</p>
                        <p>• Prévisualisez le résultat dans "Aperçu"</p>
                        <p>• Générez votre livre dans cet onglet</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
