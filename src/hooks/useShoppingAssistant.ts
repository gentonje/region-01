
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageHistory, Message, MessageBase } from './useMessageHistory';

export type { Message } from './useMessageHistory';

export const useShoppingAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const user = session?.user;
  const { messages, addMessage, clearMessages: clearMessageHistory } = useMessageHistory();

  // Get user profile for personalization
  const [userProfile, setUserProfile] = useState<{
    full_name?: string | null;
    username?: string | null;
  } | null>(null);

  // Fetch user profile for personalization
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }
        
        if (data) {
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    
    fetchUserProfile();
  }, [user?.id]);

  // Initialize with a personalized welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      const userName = userProfile?.full_name || userProfile?.username || '';
      const greeting = userName ? `Hello ${userName}! ` : "Hello! ";
      
      addMessage({ 
        content: `${greeting}I'm your shopping assistant. How can I help you today? You can ask me about products, prices, or availability in different locations. For example, try asking about "mobile phones in Kenya between 10,000 and 20,000 KES"`, 
        role: 'assistant' 
      });
    }
  }, [userProfile, addMessage, messages.length]);

  // Log any errors that occur
  useEffect(() => {
    if (error) {
      console.error("Shopping Assistant Error:", error);
    }
  }, [error]);

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
      
      // Add user info for personalization if available
      const userInfo = userProfile ? {
        userName: userProfile.full_name || userProfile.username || undefined,
        userId: user?.id
      } : undefined;
      
      // Call our edge function with better error handling
      console.log("Invoking chat-assistant edge function...");
      const { data, error: fnError } = await supabase.functions.invoke('chat-assistant', {
        body: { 
          query: content, 
          messageHistory,
          userInfo
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
        // Filter out any URLs or file paths from the response text
        let cleanResponse = data.response;
        
        // Check if response includes product details and images
        if (data.images && Array.isArray(data.images) && data.productDetails && Array.isArray(data.productDetails)) {
          console.log("Product details included in response:", data.productDetails);
          console.log("Images included in response:", data.images);
          
          addMessage({ 
            content: cleanResponse, 
            role: 'assistant',
            images: data.images,
            productDetails: data.productDetails
          });
        } else if (data.images && Array.isArray(data.images)) {
          console.log("Images included in response:", data.images);
          addMessage({ 
            content: cleanResponse, 
            role: 'assistant',
            images: data.images 
          });
        } else {
          addMessage({ content: cleanResponse, role: 'assistant' });
        }
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
  }, [messages, addMessage, userProfile, user?.id]);

  const clearMessages = useCallback(() => {
    clearMessageHistory();
    setError(null);
    
    // Add personalized welcome message back
    const userName = userProfile?.full_name || userProfile?.username || '';
    const greeting = userName ? `Hello ${userName}! ` : "Hello! ";
    
    addMessage({ 
      content: `${greeting}I'm your shopping assistant. How can I help you today? You can ask me about products, prices, or availability in different locations. For example, try asking about "mobile phones in Kenya between 10,000 and 20,000 KES"`, 
      role: 'assistant' 
    });
  }, [addMessage, userProfile, clearMessageHistory]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};
