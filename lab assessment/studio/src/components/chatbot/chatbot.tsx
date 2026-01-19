'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Loader2, Send, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chat } from '@/ai/flows/chatbot';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '@/contexts/auth-context';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const faq = [
    'How do I create a new course?',
    'How do students join my course?',
    'How is the final grade calculated?',
    'Where can I see my progress as a student?'
];

export function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hello! How can I help you with LabTracker Pro today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        setTimeout(() => {
            if(scrollAreaRef.current) {
                scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
            }
        }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent | string) => {
    let currentInput = '';
    if (typeof e === 'string') {
        currentInput = e;
    } else {
        e.preventDefault();
        currentInput = input;
    }

    if (!currentInput.trim()) return;

    const userMessage: Message = { sender: 'user', text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    if(typeof e !== 'string') {
        setInput('');
    }
    setIsLoading(true);

    try {
      const result = await chat({ message: currentInput });
      const botMessage: Message = { sender: 'bot', text: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chatbot error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const userInitial = user?.fullName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="icon" className="rounded-full w-14 h-14 shadow-lg" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <MessageCircle />}
          <span className="sr-only">Toggle Chat</span>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm">
          <Card className="shadow-2xl flex flex-col h-[60vh]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>LabTracker Assistant</CardTitle>
               <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-full pr-4" viewportRef={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn('flex items-end gap-2', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      {msg.sender === 'bot' && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn('p-3 rounded-lg max-w-[85%] whitespace-pre-wrap', 
                            msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        )}
                      >
                        {msg.text}
                      </div>
                       {msg.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {messages.length === 1 && !isLoading && (
                    <div className="space-y-2 pt-4">
                        <p className="text-sm font-medium text-center text-muted-foreground">Or try one of these common questions:</p>
                        <div className="grid grid-cols-1 gap-2">
                            {faq.map((q) => (
                                <Button 
                                    key={q}
                                    variant="outline"
                                    className="text-left justify-start h-auto whitespace-normal"
                                    onClick={() => handleSend(q)}
                                    disabled={isLoading}
                                >
                                    {q}
                                </Button>
                            ))}
                        </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      <div className="p-3 rounded-lg bg-secondary">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSend} className="flex w-full space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something..."
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}