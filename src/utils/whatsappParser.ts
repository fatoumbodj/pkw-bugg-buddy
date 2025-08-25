import JSZip from 'jszip';
import { Message } from '@/components/ChatBubble';

export interface ParsedConversation {
  messages: Message[];
  participants: string[];
  images: Map<string, string>; // filename -> blob URL
}

export class WhatsAppParser {
  private zip: JSZip | null = null;
  private imageBlobs: Map<string, string> = new Map();

  async parseZipFile(file: File): Promise<ParsedConversation> {
    this.zip = await JSZip.loadAsync(file);
    
    // Extract images first
    await this.extractImages();
    
    // Find and parse the chat file
    const chatFile = await this.findChatFile();
    if (!chatFile) {
      throw new Error('Aucun fichier de conversation trouvé dans le ZIP');
    }
    
    const chatContent = await chatFile.async('text');
    const messages = this.parseMessages(chatContent);
    const participants = this.extractParticipants(messages);
    
    return {
      messages,
      participants,
      images: this.imageBlobs
    };
  }

  private async extractImages(): Promise<void> {
    if (!this.zip) return;

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    for (const [filename, file] of Object.entries(this.zip.files)) {
      if (!file.dir && imageExtensions.some(ext => 
        filename.toLowerCase().endsWith(ext)
      )) {
        try {
          const blob = await file.async('blob');
          const url = URL.createObjectURL(blob);
          this.imageBlobs.set(filename, url);
        } catch (error) {
          console.warn(`Erreur lors de l'extraction de l'image ${filename}:`, error);
        }
      }
    }
  }

  private async findChatFile(): Promise<JSZip.JSZipObject | null> {
    if (!this.zip) return null;

    // Look for common WhatsApp export file patterns
    const patterns = [
      /.*\.txt$/,
      /.*chat.*\.txt$/i,
      /.*conversation.*\.txt$/i
    ];

    for (const [filename, file] of Object.entries(this.zip.files)) {
      if (!file.dir && patterns.some(pattern => pattern.test(filename))) {
        return file;
      }
    }

    return null;
  }

  private parseMessages(content: string): Message[] {
    const lines = content.split('\n');
    const messages: Message[] = [];
    let currentMessage: Partial<Message> | null = null;

    // Regex patterns for different WhatsApp export formats
    const messagePatterns = [
      // Format: [DD/MM/YYYY, HH:MM:SS] Name: Message
      /^\[(\d{1,2}\/\d{1,2}\/\d{4}),?\s+(\d{1,2}:\d{2}:\d{2})\]\s+([^:]+):\s*(.*)/,
      // Format: DD/MM/YYYY, HH:MM - Name: Message
      /^(\d{1,2}\/\d{1,2}\/\d{4}),?\s+(\d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.*)/,
      // Format: DD/MM/YYYY HH:MM - Name: Message
      /^(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.*)/
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let matched = false;
      
      for (const pattern of messagePatterns) {
        const match = line.match(pattern);
        if (match) {
          // Save previous message if exists
          if (currentMessage && currentMessage.timestamp) {
            messages.push(this.finalizeMessage(currentMessage));
          }

          const [, dateStr, timeStr, sender, text] = match;
          
          // Parse date and time
          const [day, month, year] = dateStr.split('/').map(Number);
          const [hour, minute, second = 0] = timeStr.split(':').map(Number);
          
          const timestamp = new Date(year, month - 1, day, hour, minute, second);
          
          currentMessage = {
            id: `${timestamp.getTime()}-${i}`,
            timestamp,
            sender: sender.trim(),
            text: text.trim(),
            isMe: false // Will be determined later
          };
          
          // Check for media attachments
          this.checkForMedia(currentMessage, text);
          
          matched = true;
          break;
        }
      }

      // If no pattern matched, this might be a continuation of the previous message
      if (!matched && currentMessage) {
        currentMessage.text = (currentMessage.text || '') + '\n' + line;
      }
    }

    // Add the last message
    if (currentMessage && currentMessage.timestamp) {
      messages.push(this.finalizeMessage(currentMessage));
    }

    return this.identifyMyMessages(messages);
  }

  private checkForMedia(message: Partial<Message>, text: string): void {
    // Check for media indicators in WhatsApp messages
    const mediaPatterns = [
      { pattern: /<Media omitted>/i, type: 'image' as const },
      { pattern: /<image omitted>/i, type: 'image' as const },
      { pattern: /<photo omitted>/i, type: 'image' as const },
      { pattern: /<video omitted>/i, type: 'video' as const },
      { pattern: /<audio omitted>/i, type: 'audio' as const },
      { pattern: /<document omitted>/i, type: 'document' as const }
    ];

    for (const { pattern, type } of mediaPatterns) {
      if (pattern.test(text)) {
        // Try to find corresponding image file
        const imageUrl = this.findCorrespondingImage(message.timestamp);
        
        message.media = {
          type,
          url: imageUrl || '',
          filename: ''
        };
        
        // Remove the media omitted text
        message.text = text.replace(pattern, '').trim();
        break;
      }
    }
  }

  private findCorrespondingImage(timestamp?: Date): string | null {
    if (!timestamp) return null;
    
    // This is a simplified approach - in reality, we'd need more sophisticated
    // matching between timestamps and image files
    const images = Array.from(this.imageBlobs.values());
    return images.length > 0 ? images[0] : null;
  }

  private finalizeMessage(message: Partial<Message>): Message {
    return {
      id: message.id || '',
      timestamp: message.timestamp || new Date(),
      sender: message.sender || '',
      text: message.text || '',
      isMe: message.isMe || false,
      media: message.media
    };
  }

  private extractParticipants(messages: Message[]): string[] {
    const participants = new Set<string>();
    messages.forEach(msg => participants.add(msg.sender));
    return Array.from(participants);
  }

  private identifyMyMessages(messages: Message[]): Message[] {
    // Simple heuristic: assume the most frequent sender is "me"
    const senderCounts = new Map<string, number>();
    
    messages.forEach(msg => {
      const count = senderCounts.get(msg.sender) || 0;
      senderCounts.set(msg.sender, count + 1);
    });
    
    let mostFrequentSender = '';
    let maxCount = 0;
    
    for (const [sender, count] of senderCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentSender = sender;
      }
    }
    
    return messages.map(msg => ({
      ...msg,
      isMe: msg.sender === mostFrequentSender
    }));
  }

  cleanup(): void {
    // Clean up blob URLs to prevent memory leaks
    for (const url of this.imageBlobs.values()) {
      URL.revokeObjectURL(url);
    }
    this.imageBlobs.clear();
  }
}