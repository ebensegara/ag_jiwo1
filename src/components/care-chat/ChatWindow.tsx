'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from '@/components/ui/use-toast';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface ChatWindowProps {
  professionalId: string;
  professionalName: string;
  onClose: () => void;
}

export default function ChatWindow({ professionalId, professionalName, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeChat();
  }, [professionalId]);

  useEffect(() => {
    if (!channelId) return;

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'care_chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const initializeChat = async () => {
    try {
      const user = await getSafeUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to chat with professionals',
          variant: 'destructive',
        });
        onClose();
        return;
      }

      setCurrentUserId(user.id);

      // Use upsert to handle duplicate key constraint
      const { data: channel, error: channelError } = await supabase
        .from('chat_channels')
        .upsert(
          {
            user_id: user.id,
            professional_id: professionalId,
          },
          {
            onConflict: 'user_id,professional_id',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (channelError) throw channelError;

      setChannelId(channel.id);

      // Fetch existing messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('care_chat_messages')
        .select('*')
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initialize chat',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!channelId || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('care_chat_messages')
        .insert([{
          channel_id: channelId,
          sender_id: currentUserId,
          message,
        }]);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col bg-white shadow-2xl">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Chat with {professionalName}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD]" />
            </div>
          ) : (
            <>
              <ChatMessageList
                messages={messages}
                currentUserId={currentUserId}
                professionalName={professionalName}
              />
              <ChatInput onSendMessage={handleSendMessage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}