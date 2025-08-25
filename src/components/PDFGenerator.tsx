import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Message } from './ChatBubble';

interface PDFGeneratorProps {
  messages: Message[];
  participants: string[];
  onGenerate?: (pdf: jsPDF) => void;
}

export const PDFGenerator = ({ messages, participants, onGenerate }: PDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState(`Souvenirs WhatsApp - ${participants.join(' & ')}`);
  const [subtitle, setSubTitle] = useState('Livre de conversation');

  const generatePDF = async () => {
    if (messages.length === 0) {
      toast.error('Aucun message à exporter');
      return;
    }

    setIsGenerating(true);
    toast.info('Génération du PDF en cours...');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Add title page
      pdf.setFontSize(24);
      pdf.text(title, pageWidth / 2, 50, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.text(subtitle, pageWidth / 2, 70, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`${messages.length} messages`, pageWidth / 2, 90, { align: 'center' });
      pdf.text(`${participants.join(', ')}`, pageWidth / 2, 110, { align: 'center' });
      
      const startDate = messages[0]?.timestamp;
      const endDate = messages[messages.length - 1]?.timestamp;
      
      if (startDate && endDate) {
        pdf.text(
          `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`,
          pageWidth / 2,
          130,
          { align: 'center' }
        );
      }

      // Capture chat content
      const chatElement = document.getElementById('chat-content');
      if (chatElement) {
        const canvas = await html2canvas(chatElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addPage();
        
        let yPosition = margin;
        const maxHeight = pageHeight - (margin * 2);
        
        if (imgHeight <= maxHeight) {
          // Image fits on one page
          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        } else {
          // Split image across multiple pages
          const pages = Math.ceil(imgHeight / maxHeight);
          
          for (let i = 0; i < pages; i++) {
            if (i > 0) pdf.addPage();
            
            const sourceY = i * maxHeight * (canvas.height / imgHeight);
            const sourceHeight = Math.min(maxHeight * (canvas.height / imgHeight), canvas.height - sourceY);
            
            // Create a temporary canvas for this page
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = sourceHeight;
            
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
              
              const tempImgData = tempCanvas.toDataURL('image/png');
              const tempImgHeight = (sourceHeight * imgWidth) / canvas.width;
              
              pdf.addImage(tempImgData, 'PNG', margin, margin, imgWidth, tempImgHeight);
            }
          }
        }
      }

      // Save the PDF
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      
      toast.success('PDF généré avec succès !');
      
      if (onGenerate) {
        onGenerate(pdf);
      }
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Générer le PDF Souvenir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="title">Titre du livre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre livre souvenir"
            />
          </div>
          
          <div>
            <Label htmlFor="subtitle">Sous-titre</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="Sous-titre (optionnel)"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">
            <p>• {messages.length} messages à inclure</p>
            <p>• Participants: {participants.join(', ')}</p>
            {messages.length > 0 && (
              <p>• Période: {messages[0].timestamp.toLocaleDateString('fr-FR')} - {messages[messages.length - 1].timestamp.toLocaleDateString('fr-FR')}</p>
            )}
          </div>
        </div>

        <Button 
          onClick={generatePDF} 
          disabled={isGenerating || messages.length === 0}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" />
              Générer le PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};