'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, User, Loader2 } from 'lucide-react';
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from '@/components/ui/use-toast';
import ChatMessageList from './care-chat/ChatMessageList';
import ChatInput from './care-chat/ChatInput';

interface Channel {
  id: string;
  user_id: string;
  professional_id: string;
  status: string;
  created_at: string;
  user_name?: string;
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export default function ProfessionalInbox() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [professionalDbId, setProfessionalDbId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    initializeInbox();

    // Subscribe to new channels
    const channelsSubscription = supabase
      .channel('professional-channels')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_channels',
        },
        () => {
          // Reload channels when there's any change
          initializeInbox();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelsSubscription);
    };
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;

    loadMessages(selectedChannel.id);

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`chat:${selectedChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'care_chat_messages',
          filter: `channel_id=eq.${selectedChannel.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannel]);

  const initializeInbox = async () => {
    try {
      const user = await getSafeUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to access your inbox',
          variant: 'destructive',
        });
        return;
      }

      setCurrentUserId(user.id);

      // CRITICAL: Get professional's database ID first
      const { data: profData, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profError || !profData) {
        console.error('Professional not found:', profError);
        toast({
          title: 'Error',
          description: 'Professional profile not found',
          variant: 'destructive',
        });
        return;
      }

      console.log('Professional DB ID:', profData.id);
      setProfessionalDbId(profData.id);

      // Fetch all channels using professional's database ID
      const { data: channelsData, error: channelsError } = await supabase
        .from('chat_channels')
        .select(`
          *,
          users!chat_channels_user_id_fkey(id, email, full_name)
        `)
        .eq('professional_id', profData.id)
        .order('updated_at', { ascending: false });

      if (channelsError) {
        console.error('Channels error:', channelsError);
        throw channelsError;
      }

      console.log('Channels loaded:', channelsData);

      // Fetch last message for each channel
      const channelsWithMessages = await Promise.all(
        (channelsData || []).map(async (channel) => {
          const { data: lastMessage } = await supabase
            .from('care_chat_messages')
            .select('message, created_at')
            .eq('channel_id', channel.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...channel,
            user_name: channel.users?.full_name || channel.users?.email?.split('@')[0] || 'User',
            last_message: lastMessage?.message || 'No messages yet',
          };
        })
      );

      console.log('Channels with messages:', channelsWithMessages);
      setChannels(channelsWithMessages);
    } catch (error: any) {
      console.error('Initialize inbox error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inbox',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (channelId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('care_chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedChannel || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('care_chat_messages')
        .insert([{
          channel_id: selectedChannel.id,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="lg:col-span-1 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD] mx-auto" />
            </div>
          ) : channels.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                No conversations yet
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left ${
                    selectedChannel?.id === channel.id ? 'bg-slate-100 dark:bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#8B6CFD] flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">{channel.user_name}</h4>
                        <Badge variant={channel.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {channel.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {channel.last_message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(channel.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Chat Window */}
      <div className="lg:col-span-2">
        {selectedChannel ? (
          <Card className="h-[680px] flex flex-col bg-white dark:bg-slate-800">
            <CardHeader className="border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#8B6CFD] flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{selectedChannel.user_name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selectedChannel.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {isLoadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD]" />
                </div>
              ) : (
                <>
                  <ChatMessageList
                    messages={messages}
                    currentUserId={currentUserId}
                    professionalName={selectedChannel.user_name || 'User'}
                  />
                  <ChatInput onSendMessage={handleSendMessage} />
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-[680px] bg-white dark:bg-slate-800">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a conversation to start chatting
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}