"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TopicSelector from "@/components/topic-selection";
import { sendTopicWebhook, type Topic } from "@/lib/topicWebhook";

// CSS Styles for informal chat UI
const chatStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .chat-gradient-bg {
    background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%);
    min-height: 100%;
  }

  .chat-message-animate {
    animation: fadeInUp 0.3s ease-out forwards;
  }

  .chat-bubble-ai {
    background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,250,0.95) 100%);
    border-radius: 4px 18px 18px 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border: 1px solid rgba(20, 184, 166, 0.1);
  }

  .chat-bubble-user {
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    border-radius: 18px 18px 4px 18px;
    box-shadow: 0 2px 8px rgba(20, 184, 166, 0.25);
  }

  .typing-dot {
    animation: pulse 1.4s infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  .chat-header-glass {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(20, 184, 166, 0.1);
  }

  .chat-input-glass {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }
`;

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  created_at: string;
}

interface ChatUsage {
  chat_count: number;
  chat_limit: number;
  is_premium: boolean;
}

export default function AIChat() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatUsage, setChatUsage] = useState<ChatUsage | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    fetchChatUsage();

    const channel = supabase
      .channel("chat_messages_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => {
          fetchMessages();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChatUsage = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_usage")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching chat usage:", error);
        throw error;
      }

      if (!data) {
        const { data: newUsage, error: insertError } = await supabase
          .from("chat_usage")
          .upsert(
            {
              user_id: user.id,
              chat_count: 0,
              chat_limit: 10,
              is_premium: false,
            },
            { onConflict: "user_id" }
          )
          .select()
          .single();

        if (insertError) throw insertError;
        setChatUsage(newUsage);
      } else {
        setChatUsage(data);
      }
    } catch (error: any) {
      console.error("Error fetching chat usage:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        const welcomeMessage = {
          id: "welcome",
          content:
            "Halo! 👋 Aku Jiwo, teman virtual kamu. Aku di sini untuk mendengarkan dan mendukung perjalanan kesehatan mental kamu. Gimana perasaanmu hari ini?",
          sender: "ai" as const,
          created_at: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTopicSelect = async (topic: string) => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      await sendTopicWebhook(topic, user.id);

      setSelectedTopic(topic as Topic);

      toast({
        title: "Topic Selected",
        description: `You're now chatting about ${topic}`,
      });
    } catch (error: any) {
      console.error("Error selecting topic:", error);
      toast({
        title: "Warning",
        description: "Topic selected, but notification failed. You can still chat.",
        variant: "default",
      });
      setSelectedTopic(topic as Topic);
    }
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
  };

  const handleSendMessage = async () => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      if (chatUsage && !chatUsage.is_premium && chatUsage.chat_count >= chatUsage.chat_limit) {
        toast({
          title: "Chat Limit Reached",
          description: `You've reached your daily limit of ${chatUsage.chat_limit} messages. Upgrade to premium for unlimited chats!`,
          variant: "destructive",
        });
        return;
      }

      const userMessage = inputValue;

      const { error: userError } = await supabase.from("chat_messages").insert([
        {
          user_id: user.id,
          content: userMessage,
          sender: "user",
        },
      ]);

      if (userError) throw userError;

      setInputValue("");
      setIsTyping(true);

      try {
        const { data, error: functionError } = await supabase.functions.invoke(
          'supabase-functions-n8n-webhook-proxy',
          {
            body: {
              message: userMessage,
              user_id: user.id,
              topic: selectedTopic?.id,
              timestamp: new Date().toISOString(),
            },
          }
        );

        if (functionError) {
          throw functionError;
        }

        let aiResponse = data?.message || data?.output || data?.response || data?.advice;

        if (!aiResponse) {
          aiResponse = "Makasih udah berbagi. Aku di sini untuk mendukung perjalanan kesehatan mental kamu 💚";
        }

        const { error: aiError } = await supabase.from("chat_messages").insert([
          {
            user_id: user.id,
            content: aiResponse,
            sender: "ai",
          },
        ]);

        if (aiError) throw aiError;

        const { error: updateError } = await supabase.rpc('increment_chat_count', {
          p_user_id: user.id
        });

        if (updateError) {
          const { data: currentUsage } = await supabase
            .from("chat_usage")
            .select("chat_count")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();

          await supabase
            .from("chat_usage")
            .update({
              chat_count: (currentUsage?.chat_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }

        await fetchChatUsage();

      } catch (webhookError: any) {
        const fallbackResponse =
          "Aku di sini untuk mendengarkan dan mendukung kamu. Ceritakan lebih banyak tentang apa yang kamu pikirkan ya~";

        const { error: aiError } = await supabase.from("chat_messages").insert([
          {
            user_id: user.id,
            content: fallbackResponse,
            sender: "ai",
          },
        ]);

        if (aiError) throw aiError;

        const { error: updateError } = await supabase.rpc('increment_chat_count', {
          p_user_id: user.id
        });

        if (updateError) {
          const { data: currentUsage } = await supabase
            .from("chat_usage")
            .select("chat_count")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();

          await supabase
            .from("chat_usage")
            .update({
              chat_count: (currentUsage?.chat_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }

        await fetchChatUsage();

        toast({
          title: "Server Error",
          description: "Server sedang sibuk, coba lagi.",
          variant: "destructive",
        });
      }

      setIsTyping(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    return <TopicSelector onSelectTopic={handleTopicSelect} />;
  }

  const isLimitReached = chatUsage && !chatUsage.is_premium && chatUsage.chat_count >= chatUsage.chat_limit;
  const remainingChats = chatUsage ? Math.max(0, chatUsage.chat_limit - chatUsage.chat_count) : 0;

  return (
    <>
      <style>{chatStyles}</style>
      <div className="flex flex-col h-full chat-gradient-bg rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="chat-header-glass rounded-t-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  Jiwo AI
                  <Badge className="bg-teal-100 text-teal-700 text-xs border-0">
                    {selectedTopic.title}
                  </Badge>
                </h3>
                <p className="text-xs text-teal-600">
                  Online • Siap membantu 💚
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToTopics}
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Ganti Topik
            </Button>
          </div>

          {/* Usage Progress */}
          {chatUsage && !chatUsage.is_premium && (
            <div className="mt-3 bg-white/50 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-600">
                  Pesan tersisa: {remainingChats} / {chatUsage.chat_limit}
                </span>
                {isLimitReached && (
                  <span className="text-rose-500 font-semibold">Limit tercapai</span>
                )}
              </div>
              <div className="w-full bg-teal-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${isLimitReached ? "bg-rose-400" : "bg-gradient-to-r from-teal-400 to-teal-500"
                    }`}
                  style={{
                    width: `${(chatUsage.chat_count / chatUsage.chat_limit) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Limit Warning Banner */}
        {isLimitReached && (
          <div className="mx-4 mt-2 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700">
              Kamu sudah menggunakan {chatUsage?.chat_limit} pesan gratis. Upgrade untuk chat tanpa batas!
            </p>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`chat-message-animate flex items-end gap-2 ${message.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === "ai"
                  ? "bg-gradient-to-br from-teal-400 to-teal-600 shadow-md"
                  : "bg-gradient-to-br from-gray-300 to-gray-400"
                  }`}>
                  {message.sender === "ai" ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[75%] ${message.sender === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block px-4 py-3 ${message.sender === "user"
                      ? "chat-bubble-user text-white"
                      : "chat-bubble-ai text-gray-800"
                      }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-message-animate flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="chat-bubble-ai px-4 py-3">
                  <div className="flex space-x-1.5">
                    <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
                    <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
                    <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="chat-input-glass border-t border-teal-100 p-4 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLimitReached ? "Upgrade untuk lanjut chat..." : "Ceritakan apa yang kamu rasakan..."}
              className="flex-1 bg-white/80 border-teal-200 focus:border-teal-400 focus:ring-teal-400 rounded-xl"
              disabled={isTyping || isLimitReached}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping || isLimitReached}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl px-4 h-10 shadow-lg shadow-teal-200"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 text-center">
            {isLimitReached
              ? "Upgrade ke premium untuk chat tanpa batas 💫"
              : "Ini ruang aman untuk berbagi. Ceritakan apa saja yang kamu rasakan 💚"
            }
          </p>
        </div>
      </div>
    </>
  );
}