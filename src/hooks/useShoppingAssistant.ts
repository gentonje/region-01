
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export const useShoppingAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add user message
      addMessage({ content, role: 'user' });
      
      // Convert message history for context
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })).slice(-5); // Only include last 5 messages for context
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: { query: content, messageHistory }
      });
      
      if (error) {
        console.error("Assistant error:", error);
        setError('Failed to get a response. Please try again.');
        return;
      }
      
      // Add assistant response
      if (data?.response) {
        addMessage({ content: data.response, role: 'assistant' });
      } else if (data?.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error in assistant hook:", err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};
