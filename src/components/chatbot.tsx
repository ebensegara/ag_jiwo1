'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Halo! Saya AI Terapis Jiwo. Bagaimana perasaan Anda hari ini?', sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    
    // Add user message to chat
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
    setInputValue("");
    setIsTyping(true);

    // Call n8n webhook via Supabase Edge Function
    try {
      console.log('Calling edge function with:', { message: userMessage, userId: user.id });
      
      const { data, error: functionError } = await supabase.functions.invoke(
        'supabase-functions-n8n-webhook-proxy',
        {
          body: {
            message: userMessage,
            userId: user.id,
            timestamp: new Date().toISOString(),
          },
        }
      );

      console.log('Edge function response:', data);
      console.log('Edge function error:', functionError);

      if (functionError) {
        throw functionError;
      }

      // Extract AI response from webhook
      const aiResponse =
        data?.output ||
        data?.response ||
        data?.message ||
        data?.advice ||
        "Thank you for sharing. I'm here to support you on your mental health journey.";

      console.log('AI response extracted:', aiResponse);

      // Save AI response to database
      const { error: aiError } = await supabase.from("ai_chats").insert([
        {
          user_id: user.id,
          message: aiResponse,
          sender: "ai",
        },
      ]);

      if (aiError) throw aiError;
    } catch (webhookError: any) {
      console.error('Webhook error details:', webhookError);
      // Fallback response
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: 'Maaf, saya mengalami kesulitan merespons. Silakan coba lagi.', 
        sender: 'ai' 
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#756657] text-white rounded-full shadow-lg hover:bg-[#756657]/90 transition-all duration-300 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="bg-[#756657] text-white p-4 rounded-t-2xl">
            <h3 className="font-semibold">Chat dengan AI Terapis</h3>
            <p className="text-xs opacity-90">Online 24/7</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : ''}`}
              >
                <div
                  className={`inline-block rounded-lg p-3 max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-[#756657] text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4 inline-block">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan..."
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#756657] dark:bg-gray-800"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-[#756657] text-white p-3 rounded-lg hover:bg-[#756657]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}