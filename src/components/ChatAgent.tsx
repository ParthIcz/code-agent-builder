import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ChatMessage } from '@/types';

interface ChatAgentProps {
  messages: ChatMessage[];
  onSubmit: (message: string) => void;
  isGenerating: boolean;
}

export function ChatAgent({ messages, onSubmit, isGenerating }: ChatAgentProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const getMessageIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getMessageStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user':
        return 'bg-chat-user text-chat-user-foreground';
      case 'assistant':
        return 'bg-chat-assistant text-chat-assistant-foreground';
      case 'system':
        return 'bg-chat-system text-chat-system-foreground';
      case 'error':
        return 'bg-chat-error text-chat-error-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              {isGenerating ? 'Generating...' : 'Ready to help'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <Bot className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Welcome to AI Code Builder</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    I will help you build and modify your project. Try commands like:
                  </p>
                  <div className="space-y-2 text-sm">
                    <Badge variant="outline" className="block w-full py-1">
                      Add a contact form to the homepage
                    </Badge>
                    <Badge variant="outline" className="block w-full py-1">
                      Make the header sticky
                    </Badge>
                    <Badge variant="outline" className="block w-full py-1">
                      Change the color scheme to blue
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 animate-slide-up ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type !== 'user' && (
                <div className={`p-1.5 rounded-lg ${getMessageStyle(message.type)}`}>
                  {getMessageIcon(message.type)}
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <Card className={`${getMessageStyle(message.type)} shadow-md`}>
                  <CardContent className="p-3">
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {message.type === 'user' && (
                <div className={`p-1.5 rounded-lg ${getMessageStyle(message.type)}`}>
                  {getMessageIcon(message.type)}
                </div>
              )}
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="p-1.5 rounded-lg bg-chat-assistant">
                <Bot className="h-4 w-4 text-chat-assistant-foreground" />
              </div>
              <Card className="bg-chat-assistant text-chat-assistant-foreground max-w-[80%]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    </div>
                    Thinking...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            disabled={isGenerating}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isGenerating}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Powered by AI
        </div>
      </div>
    </div>
  );
}