'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from '@/components/ui/use-toast';
import ChatWindow from './ChatWindow';
import { MessageCircle, User, Loader2, ArrowLeft } from 'lucide-react';

interface Channel {
  id: string;
  user_id: string;
  professional_id: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
  last_message?: string;
  last_message_time?: string;
}

export default function UserInbox() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    initializeInbox();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to new channels
    const channelSubscription = supabase
      .channel('inbox-channels')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_channels',
          filter: `professional_id=eq.${currentUserId}`,
        },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [currentUserId]);

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
      await fetchChannels();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inbox',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChannels = async () => {
    const user = await getSafeUser();
    if (!user) return;

    const { data: channelsData, error: channelsError } = await supabase
      .from('chat_channels')
      .select(`
        *,
        users!chat_channels_user_id_fkey(full_name, email)
      `)
      .eq('professional_id', user.id)
      .order('updated_at', { ascending: false });

    if (channelsError) throw channelsError;

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
          last_message: lastMessage?.message || 'No messages yet',
          last_message_time: lastMessage?.created_at,
        };
      })
    );

    setChannels(channelsWithMessages);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-[#8B6CFD]" />
            Professional Inbox
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage conversations with your clients
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD] mx-auto" />
            </CardContent>
          </Card>
        ) : channels.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground">
                When users reach out to you, their conversations will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full p-4 border-b hover:bg-slate-50 transition-colors text-left ${
                        selectedChannel?.id === channel.id ? 'bg-slate-100' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 bg-[#8B6CFD] flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-white" />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {channel.users?.full_name || 'User'}
                            </h4>
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel.last_message}
                          </p>
                          {channel.last_message_time && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(channel.last_message_time).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedChannel ? (
                <div className="relative">
                  <ChatWindow
                    professionalId={selectedChannel.professional_id}
                    professionalName={selectedChannel.users?.full_name || 'User'}
                    onClose={() => setSelectedChannel(null)}
                  />
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a conversation to view messages
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}