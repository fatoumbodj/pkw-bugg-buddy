import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  timestamp: Date;
  sender: string;
  text: string;
  isMe: boolean;
  media?: {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    filename?: string;
  };
}

interface ChatBubbleProps {
  message: Message;
  className?: string;
}

export const ChatBubble = ({ message, className }: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        message.isMe ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[70%] space-y-2",
          message.isMe ? "items-end" : "items-start"
        )}
      >
        {!message.isMe && (
          <div className="text-xs font-medium text-primary px-1">
            {message.sender}
          </div>
        )}
        
        <Card
          className={cn(
            "p-3 shadow-sm",
            message.isMe
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted"
          )}
        >
          {message.media && message.media.type === 'image' && (
            <div className="mb-2">
              <img
                src={message.media.url}
                alt="Image de conversation"
                className="max-w-full h-auto rounded-md"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}
          
          {message.text && (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </div>
          )}
          
          <div
            className={cn(
              "text-xs mt-2 opacity-70",
              message.isMe ? "text-right" : "text-left"
            )}
          >
            {format(message.timestamp, 'dd/MM/yyyy HH:mm', { locale: fr })}
          </div>
        </Card>
      </div>
    </div>
  );
};