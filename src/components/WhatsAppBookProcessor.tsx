import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, BookOpen, ShoppingCart, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { backendBookService } from '@/lib/backendBookApi';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface BookCustomization {
  title: string;
  dedication: string;
  preface: string;
  sweetMessage: string;
  coverColor: string;
  bubbleColors: {
    sent: string;
    received: string;
  };
  coverImage?: File;
}

const WhatsAppBookProcessor: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'upload' | 'customize' | 'preview' | 'complete'>('upload');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookCustomization, setBookCustomization] = useState<BookCustomization>({
    title: 'Mon Livre Souvenir',
    dedication: '',
    preface: '',
    sweetMessage: '',
    coverColor: '#6366f1',
    bubbleColors: {
      sent: '#3b82f6',
      received: '#e5e7eb'
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setZipFile(acceptedFiles[0]);
        setStep('customize');
      }
    }
  });

  const handleCustomizationChange = (field: keyof BookCustomization, value: any) => {
    setBookCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBubbleColorChange = (type: 'sent' | 'received', color: string) => {
    setBookCustomization(prev => ({
      ...prev,
      bubbleColors: {
        ...prev.bubbleColors,
        [type]: color
      }
    }));
  };

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBookCustomization(prev => ({
        ...prev,
        coverImage: file
      }));
    }
  };

  const handleCreateBook = async () => {
    if (!zipFile) return;

    setIsProcessing(true);
    try {
      const result = await backendBookService.createBookFromZip(zipFile, bookCustomization);
      setBookId(result.bookId);
      setStep('complete');
      
      toast({
        title: "Livre créé !",
        description: "Votre livre a été créé avec succès",
      });
    } catch (error) {
      console.error('Error creating book:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCart = async () => {
    if (!bookId) return;

    try {
      await backendBookService.addToCart(bookId);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!bookId) return;

    try {
      const result = await backendBookService.generatePDF(bookId);
      window.open(result.pdfUrl, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (step === 'upload') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Créer votre livre souvenir</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive
                  ? 'Déposez votre fichier ZIP ici'
                  : 'Glissez votre fichier ZIP WhatsApp ici'}
              </p>
              <p className="text-sm text-gray-500">
                ou cliquez pour sélectionner un fichier
              </p>
              {zipFile && (
                <div className="mt-4 p-2 bg-green-50 rounded border">
                  <p className="text-sm text-green-700">
                    Fichier sélectionné: {zipFile.name}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'customize') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Personnalisez votre livre</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="cover">Couverture</TabsTrigger>
                <TabsTrigger value="bubbles">Bulles</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du livre</Label>
                  <Input
                    id="title"
                    value={bookCustomization.title}
                    onChange={(e) => handleCustomizationChange('title', e.target.value)}
                    placeholder="Mon Livre Souvenir"
                  />
                </div>
              </TabsContent>

              <TabsContent value="cover" className="space-y-4">
                <div>
                  <Label htmlFor="coverColor">Couleur de couverture</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="coverColor"
                      type="color"
                      value={bookCustomization.coverColor}
                      onChange={(e) => handleCustomizationChange('coverColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={bookCustomization.coverColor}
                      onChange={(e) => handleCustomizationChange('coverColor', e.target.value)}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="coverImage">Image de couverture (optionnel)</Label>
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                  />
                </div>
              </TabsContent>

              <TabsContent value="bubbles" className="space-y-4">
                <div>
                  <Label>Couleur des messages envoyés</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={bookCustomization.bubbleColors.sent}
                      onChange={(e) => handleBubbleColorChange('sent', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={bookCustomization.bubbleColors.sent}
                      onChange={(e) => handleBubbleColorChange('sent', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label>Couleur des messages reçus</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={bookCustomization.bubbleColors.received}
                      onChange={(e) => handleBubbleColorChange('received', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={bookCustomization.bubbleColors.received}
                      onChange={(e) => handleBubbleColorChange('received', e.target.value)}
                      placeholder="#e5e7eb"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pages" className="space-y-4">
                <div>
                  <Label htmlFor="dedication">Dédicace</Label>
                  <Textarea
                    id="dedication"
                    value={bookCustomization.dedication}
                    onChange={(e) => handleCustomizationChange('dedication', e.target.value)}
                    placeholder="À mes amis précieux..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="preface">Avant-propos</Label>
                  <Textarea
                    id="preface"
                    value={bookCustomization.preface}
                    onChange={(e) => handleCustomizationChange('preface', e.target.value)}
                    placeholder="Ces conversations représentent..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="sweetMessage">Mot doux</Label>
                  <Textarea
                    id="sweetMessage"
                    value={bookCustomization.sweetMessage}
                    onChange={(e) => handleCustomizationChange('sweetMessage', e.target.value)}
                    placeholder="Un petit mot pour la fin..."
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Retour
              </Button>
              <Button onClick={handleCreateBook} disabled={isProcessing}>
                {isProcessing ? 'Création en cours...' : 'Créer le livre'}
                <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600">Livre créé avec succès !</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-lg text-gray-600">
              Votre livre "{bookCustomization.title}" a été créé et est maintenant disponible.
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleDownloadPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>
              <Button onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>
            </div>

            <div className="pt-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Voir mes livres
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default WhatsAppBookProcessor;