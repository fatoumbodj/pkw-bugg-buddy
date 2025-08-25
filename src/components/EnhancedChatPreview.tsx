import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Users, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { Message } from './ChatBubble';
import { BubbleSettings } from './BubbleCustomization';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EnhancedChatPreviewProps {
  messages: Message[];
  participants: string[];
  bubbleSettings: BubbleSettings;
  title?: string;
}

export const EnhancedChatPreview = ({ 
  messages, 
  participants, 
  bubbleSettings,
  title 
}: EnhancedChatPreviewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState(messages);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(msg => 
        msg.text.toLowerCase().includes(term.toLowerCase()) ||
        msg.sender.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  };

  const messageStats = {
    total: messages.length,
    withImages: messages.filter(m => m.media?.type === 'image').length,
    myMessages: messages.filter(m => m.isMe).length,
    otherMessages: messages.filter(m => !m.isMe).length
  };

  const dateRange = messages.length > 0 ? {
    start: messages[0].timestamp,
    end: messages[messages.length - 1].timestamp
  } : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {title || `Conversation - ${participants.join(', ')}`}
          </CardTitle>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans la conversation..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {filteredMessages.length} messages
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {messageStats.withImages} images
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {participants.length} participants
          </Badge>
          {dateRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(dateRange.start, 'dd/MM/yy', { locale: fr })} - {format(dateRange.end, 'dd/MM/yy', { locale: fr })}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[600px] w-full pr-4">
          <div className="space-y-2" id="chat-content">
            {filteredMessages.map((message) => (
              <div key={message.id} className="mb-4">
                <div
                  className={`flex w-full ${message.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] space-y-1 ${message.isMe ? 'items-end' : 'items-start'}`}>
                    {bubbleSettings.showSenderNames && !message.isMe && (
                      <div className="text-xs font-medium text-primary px-1">
                        {message.sender}
                      </div>
                    )}
                    
                    <div
                      className="p-3 shadow-sm"
                      style={{
                        backgroundColor: message.isMe ? bubbleSettings.myBubbleColor : bubbleSettings.otherBubbleColor,
                        color: message.isMe ? bubbleSettings.myTextColor : bubbleSettings.otherTextColor,
                        opacity: bubbleSettings.bubbleOpacity,
                        borderRadius: bubbleSettings.borderRadius
                      }}
                    >
                      {message.media && message.media.type === 'image' && message.media.url && (
                        <div className="mb-2">
                          <img
                            src={message.media.url}
                            alt="Image de conversation"
                            className="max-w-full h-auto rounded"
                            style={{ 
                              maxHeight: '300px',
                              borderRadius: Math.max(0, bubbleSettings.borderRadius - 4)
                            }}
                          />
                        </div>
                      )}
                      
                      {message.text && (
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {searchTerm && message.text.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: message.text.replace(
                                  new RegExp(searchTerm, 'gi'),
                                  (match) => `<mark style="background-color: yellow; color: black;">${match}</mark>`
                                )
                              }}
                            />
                          ) : (
                            message.text
                          )}
                        </div>
                      )}
                      
                      {bubbleSettings.showTimestamps && (
                        <div
                          className="text-xs mt-2 opacity-70"
                          style={{
                            textAlign: message.isMe ? 'right' : 'left'
                          }}
                        >
                          {format(message.timestamp, 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredMessages.length === 0 && searchTerm && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p>Aucun message trouvé pour "{searchTerm}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};