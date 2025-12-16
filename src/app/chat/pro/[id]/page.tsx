"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, getSafeUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Circle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface Professional {
  id: string;
  full_name: string;
  avatar_url: string;
  specialization: string;
  online_status: boolean;
}

interface InstantChatChannel {
  id: string;
  user_id: string;
  professional_id: string;
}

export default function InstantChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [channel, setChannel] = useState<InstantChatChannel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initChat();
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initChat = async () => {
    try {
      const user = await getSafeUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setCurrentUserId(user.id);

      // Fetch professional
      const { data: proData, error: proError } = await supabase
        .from("professionals")
        .select("id, full_name, avatar_url, specialization, online_status")
        .eq("id", params.id)
        .single();

      if (proError) throw proError;
      setProfessional(proData);

      // Check or create instant chat channel
      let { data: existingChannel, error: channelFetchError } = await supabase
        .from("chat_channels")
        .select("*")
        .eq("user_id", user.id)
        .eq("professional_id", params.id)
        .is("booking_id", null)
        .single();

      if (channelFetchError && channelFetchError.code !== "PGRST116") {
        throw channelFetchError;
      }

      if (!existingChannel) {
        // Create new instant chat channel
        const { data: newChannel, error: createError } = await supabase
          .from("chat_channels")
          .insert({
            user_id: user.id,
            professional_id: params.id,
            booking_id: null,
          })
          .select()
          .single();

        if (createError) throw createError;
        existingChannel = newChannel;
      }

      setChannel(existingChannel);

      // Fetch messages
      await fetchMessages(existingChannel.id);

      // Subscribe to new messages
      const subscription = supabase
        .channel(`instant-chat:${existingChannel.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "care_chat_messages",
            filter: `channel_id=eq.${existingChannel.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      // Subscribe to professional status changes
      const proStatusSub = supabase
        .channel(`pro-status:${params.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "professionals",
            filter: `id=eq.${params.id}`,
          },
          (payload) => {
            setProfessional((prev) => prev ? { ...prev, online_status: payload.new.online_status } : null);
          }
        )
        .subscribe();

      setIsInitializing(false);

      return () => {
        subscription.unsubscribe();
        proStatusSub.unsubscribe();
      };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize chat",
        variant: "destructive",
      });
      setIsInitializing(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from("care_chat_messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading || !channel) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("care_chat_messages")
        .insert({
          channel_id: channel.id,
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

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Connecting...</p>
      </div>
    );
  }

  if (!professional || !channel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Chat not available</p>
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
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={professional.avatar_url} />
                  <AvatarFallback className="bg-[#756657] text-white">
                    {professional.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {professional.online_status && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{professional.full_name}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {professional.specialization}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Circle className={`h-2 w-2 ${professional.online_status ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                    {professional.online_status ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p>Start your conversation with {professional.full_name}</p>
                <p className="text-sm mt-2">This is an instant chat session</p>
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
            <div ref={messagesEndRef} />
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