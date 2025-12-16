"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface Channel {
  id: string;
  user_id: string;
  professional_id: string;
  professionals: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initChat();
  }, [params.id]);

  const initChat = async () => {
    try {
      const user = await getSafeUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setCurrentUserId(user.id);

      // Fetch channel
      const { data: channelData, error: channelError } = await supabase
        .from("chat_channels")
        .select(`
          *,
          professionals (
            full_name,
            avatar_url
          )
        `)
        .eq("id", params.id)
        .single();

      if (channelError) throw channelError;
      setChannel(channelData);

      // Fetch messages
      fetchMessages();

      // Subscribe to new messages
      const subscription = supabase
        .channel(`chat:${params.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "care_chat_messages",
            filter: `channel_id=eq.${params.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("care_chat_messages")
        .select("*")
        .eq("channel_id", params.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("care_chat_messages")
        .insert({
          channel_id: params.id,
          sender_id: currentUserId,
          message: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!channel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/user")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={channel.professionals.avatar_url} />
                <AvatarFallback className="bg-[#756657] text-white">
                  {channel.professionals.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{channel.professionals.full_name}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender_id === currentUserId
                        ? "bg-[#756657] text-white"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="bg-[#756657] hover:bg-[#756657]/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}