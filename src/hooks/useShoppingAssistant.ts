
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  // Log any errors that occur
  useEffect(() => {
    if (error) {
      console.error("Shopping Assistant Error:", error);
    }
  }, [error]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    console.log("Adding message:", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending message to assistant:", content);
      
      // Add user message
      addMessage({ content, role: 'user' });
      
      // Convert message history for context
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })).slice(-5); // Only include last 5 messages for context
      
      console.log("Message history for context:", messageHistory);
      
      // Call our edge function with better error handling
      console.log("Invoking chat-assistant edge function...");
      const { data, error: fnError } = await supabase.functions.invoke('chat-assistant', {
        body: { 
          query: content, 
          messageHistory 
        }
      });
      
      console.log("Edge function response:", data);
      
      if (fnError) {
        console.error("Edge function error:", fnError);
        setError(`Failed to get a response: ${fnError.message || 'Unknown error'}`);
        toast({
          title: "Error",
          description: "Failed to get a response from the assistant. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Add assistant response
      if (data?.response) {
        console.log("Assistant response:", data.response);
        addMessage({ content: data.response, role: 'assistant' });
      } else if (data?.error) {
        console.error("Data error:", data.error);
        setError(data.error);
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        console.error("No response or error in data:", data);
        setError("Received an empty response from the assistant.");
        toast({
          title: "Error",
          description: "Received an empty response from the assistant.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error in assistant hook:", err);
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
