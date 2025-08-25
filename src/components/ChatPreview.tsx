import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatBubble, Message } from './ChatBubble';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatPreviewProps {
  messages: Message[];
  participants: string[];
  title?: string;
}

export const ChatPreview = ({ messages, participants, title }: ChatPreviewProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {title || `Conversation - ${participants.join(', ')}`}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {messages.length} messages • {participants.length} participants
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full pr-4">
          <div className="space-y-2" id="chat-content">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};