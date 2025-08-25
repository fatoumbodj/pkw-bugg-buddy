import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from './ColorPicker';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

export interface CoverDesign {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  coverImage?: string;
  dedication?: string;
  foreword?: string;
  sweetMessage?: string;
}

interface CoverDesignerProps {
  design: CoverDesign;
  onChange: (design: CoverDesign) => void;
  participants: string[];
}

export const CoverDesigner = ({ design, onChange, participants }: CoverDesignerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'cover' | 'pages'>('cover');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image doit faire moins de 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange({ ...design, coverImage: result });
        toast.success('Image ajoutée à la couverture');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    onChange({ ...design, coverImage: undefined });
  };

  const tabs = [
    { id: 'cover', label: 'Couverture', icon: ImageIcon },
    { id: 'pages', label: 'Pages spéciales', icon: Upload }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personnalisation du livre</CardTitle>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id as 'cover' | 'pages')}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {activeTab === 'cover' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre principal</Label>
              <Input
                id="title"
                value={design.title}
                onChange={(e) => onChange({ ...design, title: e.target.value })}
                placeholder="Nos souvenirs WhatsApp"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input
                id="subtitle"
                value={design.subtitle}
                onChange={(e) => onChange({ ...design, subtitle: e.target.value })}
                placeholder={`${participants.join(' & ')} - Livre de conversations`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                color={design.backgroundColor}
                onChange={(color) => onChange({ ...design, backgroundColor: color })}
                label="Couleur de fond"
                presets={['#1E40AF', '#7C3AED', '#DC2626', '#059669', '#D97706', '#BE185D']}
              />
              
              <ColorPicker
                color={design.textColor}
                onChange={(color) => onChange({ ...design, textColor: color })}
                label="Couleur du texte"
                presets={['#FFFFFF', '#F3F4F6', '#E5E7EB', '#000000', '#374151', '#6B7280']}
              />
            </div>

            <div>
              <Label>Image de couverture</Label>
              <div className="mt-2">
                {design.coverImage ? (
                  <div className="relative">
                    <img
                      src={design.coverImage}
                      alt="Couverture"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeCoverImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter une image de couverture
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
              <Label>Aperçu de la couverture</Label>
              <div 
                className="w-full h-48 rounded-lg border shadow-lg flex flex-col justify-center items-center p-6 text-center relative overflow-hidden"
                style={{ 
                  backgroundColor: design.backgroundColor,
                  color: design.textColor
                }}
              >
                {design.coverImage && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${design.coverImage})` }}
                  />
                )}
                <div className="relative z-10">
                  <h2 className="text-xl font-bold mb-2">{design.title}</h2>
                  <p className="text-sm opacity-80">{design.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dedication">Dédicace</Label>
              <Textarea
                id="dedication"
                value={design.dedication || ''}
                onChange={(e) => onChange({ ...design, dedication: e.target.value })}
                placeholder="À tous nos moments partagés, nos rires et nos larmes..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="foreword">Avant-propos</Label>
              <Textarea
                id="foreword"
                value={design.foreword || ''}
                onChange={(e) => onChange({ ...design, foreword: e.target.value })}
                placeholder="Ce livre rassemble nos conversations les plus précieuses..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="sweetMessage">Message doux</Label>
              <Textarea
                id="sweetMessage"
                value={design.sweetMessage || ''}
                onChange={(e) => onChange({ ...design, sweetMessage: e.target.value })}
                placeholder="Chaque message dans ce livre raconte notre histoire..."
                rows={3}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};