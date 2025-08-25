import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from './ColorPicker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { MessageSquare } from 'lucide-react';
import { ChatBubble, Message } from './ChatBubble';

export interface BubbleSettings {
  myBubbleColor: string;
  otherBubbleColor: string;
  myTextColor: string;
  otherTextColor: string;
  showTimestamps: boolean;
  showSenderNames: boolean;
  bubbleOpacity: number;
  borderRadius: number;
}

interface BubbleCustomizationProps {
  settings: BubbleSettings;
  onChange: (settings: BubbleSettings) => void;
  participants: string[];
}

export const BubbleCustomization = ({ settings, onChange, participants }: BubbleCustomizationProps) => {
  // Sample messages for preview
  const sampleMessages: Message[] = [
    {
      id: '1',
      timestamp: new Date(),
      sender: participants[0] || 'Moi',
      text: 'Salut ! Comment ça va ?',
      isMe: true
    },
    {
      id: '2',
      timestamp: new Date(Date.now() + 60000),
      sender: participants[1] || 'Autre',
      text: 'Ça va bien ! Et toi ? 😊',
      isMe: false
    },
    {
      id: '3',
      timestamp: new Date(Date.now() + 120000),
      sender: participants[0] || 'Moi',
      text: 'Super ! On se voit ce soir ?',
      isMe: true
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Personnalisation des bulles
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorPicker
            color={settings.myBubbleColor}
            onChange={(color) => onChange({ ...settings, myBubbleColor: color })}
            label="Mes bulles - Fond"
            presets={['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444']}
          />
          
          <ColorPicker
            color={settings.myTextColor}
            onChange={(color) => onChange({ ...settings, myTextColor: color })}
            label="Mes bulles - Texte"
            presets={['#FFFFFF', '#000000', '#374151', '#F3F4F6']}
          />
          
          <ColorPicker
            color={settings.otherBubbleColor}
            onChange={(color) => onChange({ ...settings, otherBubbleColor: color })}
            label="Autres bulles - Fond"
            presets={['#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#374151']}
          />
          
          <ColorPicker
            color={settings.otherTextColor}
            onChange={(color) => onChange({ ...settings, otherTextColor: color })}
            label="Autres bulles - Texte"
            presets={['#000000', '#374151', '#6B7280', '#FFFFFF']}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="timestamps">Afficher les horodatages</Label>
            <Switch
              id="timestamps"
              checked={settings.showTimestamps}
              onCheckedChange={(checked) => onChange({ ...settings, showTimestamps: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="senderNames">Afficher les noms d'expéditeur</Label>
            <Switch
              id="senderNames"
              checked={settings.showSenderNames}
              onCheckedChange={(checked) => onChange({ ...settings, showSenderNames: checked })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Opacité des bulles: {Math.round(settings.bubbleOpacity * 100)}%</Label>
            <Slider
              value={[settings.bubbleOpacity]}
              onValueChange={(value) => onChange({ ...settings, bubbleOpacity: value[0] })}
              max={1}
              min={0.3}
              step={0.1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Arrondi des bulles: {settings.borderRadius}px</Label>
            <Slider
              value={[settings.borderRadius]}
              onValueChange={(value) => onChange({ ...settings, borderRadius: value[0] })}
              max={24}
              min={4}
              step={2}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="text-base font-medium mb-4 block">Aperçu</Label>
          <div 
            className="border rounded-lg p-4 bg-background min-h-[200px]"
            style={{
              '--my-bubble-color': settings.myBubbleColor,
              '--my-text-color': settings.myTextColor,
              '--other-bubble-color': settings.otherBubbleColor,
              '--other-text-color': settings.otherTextColor,
              '--bubble-opacity': settings.bubbleOpacity,
              '--border-radius': `${settings.borderRadius}px`
            } as React.CSSProperties}
          >
            {sampleMessages.map((message) => (
              <div key={message.id} className="mb-3">
                <div
                  className={`flex w-full ${message.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] space-y-1 ${message.isMe ? 'items-end' : 'items-start'}`}>
                    {settings.showSenderNames && !message.isMe && (
                      <div className="text-xs font-medium text-primary px-1">
                        {message.sender}
                      </div>
                    )}
                    
                    <div
                      className="p-3 shadow-sm rounded-lg"
                      style={{
                        backgroundColor: message.isMe ? settings.myBubbleColor : settings.otherBubbleColor,
                        color: message.isMe ? settings.myTextColor : settings.otherTextColor,
                        opacity: settings.bubbleOpacity,
                        borderRadius: settings.borderRadius
                      }}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.text}
                      </div>
                      
                      {settings.showTimestamps && (
                        <div className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};