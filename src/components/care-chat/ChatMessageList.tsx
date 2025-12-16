'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { User, Stethoscope } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface ChatMessageListProps {
  messages: Message[];
  currentUserId: string;
  professionalName: string;
}

export default function ChatMessageList({ messages, currentUserId, professionalName }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className={`h-8 w-8 flex items-center justify-center ${isCurrentUser ? 'bg-[#8B6CFD]' : 'bg-slate-200'}`}>
                  {isCurrentUser ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Stethoscope className="h-4 w-4 text-slate-600" />
                  )}
                </Avatar>
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <span className="text-xs text-muted-foreground mb-1">
                    {isCurrentUser ? 'You' : professionalName}
                  </span>
                  <Card className={`p-3 ${isCurrentUser ? 'bg-[#8B6CFD] text-white' : 'bg-slate-100'}`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </Card>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
