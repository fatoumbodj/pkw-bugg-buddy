import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDown, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Message } from './ChatBubble';
import { CoverDesign } from './CoverDesigner';
import { BubbleSettings } from './BubbleCustomization';

interface PDFGeneratorProps {
  messages: Message[];
  participants: string[];
  coverDesign: CoverDesign;
  bubbleSettings: BubbleSettings;
  onGenerate?: (pdf: jsPDF) => void;
}

export const PDFGenerator = ({ messages, participants, coverDesign, bubbleSettings, onGenerate }: PDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

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

      // Add cover page with custom design
      if (coverDesign.coverImage) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = coverDesign.coverImage!;
          });
          
          // Add cover image as background
          const imgAspect = img.width / img.height;
          const pageAspect = pageWidth / pageHeight;
          
          let imgWidth, imgHeight, x, y;
          
          if (imgAspect > pageAspect) {
            imgHeight = pageHeight;
            imgWidth = imgHeight * imgAspect;
            x = (pageWidth - imgWidth) / 2;
            y = 0;
          } else {
            imgWidth = pageWidth;
            imgHeight = imgWidth / imgAspect;
            x = 0;
            y = (pageHeight - imgHeight) / 2;
          }
          
          pdf.addImage(coverDesign.coverImage, 'JPEG', x, y, imgWidth, imgHeight);
        } catch (error) {
          console.warn('Erreur lors du chargement de l\'image de couverture:', error);
          // Fallback: couleur de fond uniquement
          pdf.setFillColor(coverDesign.backgroundColor);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        }
      } else {
        // Background color only
        pdf.setFillColor(coverDesign.backgroundColor);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      }
      
      // Add cover text
      pdf.setTextColor(coverDesign.textColor);
      pdf.setFontSize(28);
      pdf.text(coverDesign.title, pageWidth / 2, pageHeight * 0.4, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(coverDesign.subtitle, pageWidth / 2, pageHeight * 0.5, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text(`${messages.length} messages`, pageWidth / 2, pageHeight * 0.6, { align: 'center' });
      
      const startDate = messages[0]?.timestamp;
      const endDate = messages[messages.length - 1]?.timestamp;
      
      if (startDate && endDate) {
        pdf.text(
          `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`,
          pageWidth / 2,
          pageHeight * 0.65,
          { align: 'center' }
        );
      }

      // Add dedication page if provided
      if (coverDesign.dedication?.trim()) {
        pdf.addPage();
        pdf.setFillColor('#FFFFFF');
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.setTextColor('#000000');
        
        pdf.setFontSize(20);
        pdf.text('Dédicace', pageWidth / 2, 40, { align: 'center' });
        
        pdf.setFontSize(14);
        const dedicationLines = pdf.splitTextToSize(coverDesign.dedication, pageWidth - 40);
        pdf.text(dedicationLines, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
      }

      // Add foreword page if provided
      if (coverDesign.foreword?.trim()) {
        pdf.addPage();
        pdf.setFillColor('#FFFFFF');
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.setTextColor('#000000');
        
        pdf.setFontSize(20);
        pdf.text('Avant-propos', pageWidth / 2, 40, { align: 'center' });
        
        pdf.setFontSize(12);
        const forewordLines = pdf.splitTextToSize(coverDesign.foreword, pageWidth - 40);
        pdf.text(forewordLines, margin, 70);
      }

      // Add sweet message page if provided
      if (coverDesign.sweetMessage?.trim()) {
        pdf.addPage();
        pdf.setFillColor('#FFFFFF');
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.setTextColor('#000000');
        
        pdf.setFontSize(16);
        const messageLines = pdf.splitTextToSize(coverDesign.sweetMessage, pageWidth - 60);
        pdf.text(messageLines, pageWidth / 2, pageHeight / 2, { align: 'center' });
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
      pdf.save(`${coverDesign.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      
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
          <BookOpen className="h-5 w-5" />
          Générer le livre PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium">Aperçu du livre</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>📖 Titre: {coverDesign.title}</p>
            <p>👥 Participants: {participants.join(', ')}</p>
            <p>💬 {messages.length} messages</p>
            {messages.length > 0 && (
              <p>📅 {messages[0].timestamp.toLocaleDateString('fr-FR')} - {messages[messages.length - 1].timestamp.toLocaleDateString('fr-FR')}</p>
            )}
            {coverDesign.dedication && <p>💝 Avec dédicace</p>}
            {coverDesign.foreword && <p>📝 Avec avant-propos</p>}
            {coverDesign.sweetMessage && <p>💕 Avec message doux</p>}
            {coverDesign.coverImage && <p>🖼️ Avec image de couverture</p>}
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
              Création du livre en cours...
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Créer le livre PDF
            </>
          )}
        </Button>
        
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Veuillez d'abord importer une conversation WhatsApp
          </p>
        )}
      </CardContent>
    </Card>
  );
};