
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection, ScrollDirection } from '@/hooks/useScrollDirection';
import { useShoppingAssistant } from '@/hooks/useShoppingAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ChatHeader } from '../chat/ChatHeader';
import { ChatMessages } from '../chat/ChatMessages';
import { ChatInput } from '../chat/ChatInput';
import { supabase } from '@/integrations/supabase/client';

export const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollDirection } = useScrollDirection();
  const { messages, isLoading, sendMessage, error, clearMessages } = useShoppingAssistant();
  const [messageInput, setMessageInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Only show on main products page
  const shouldShowBubble = location.pathname === '/products';

  // Focus the input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current && !isFocused) {
      // Delay focus to ensure the animation is complete
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setIsFocused(true);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isFocused]);

  // Reset focused state when chat is closed
  useEffect(() => {
    if (!isOpen) {
      setIsFocused(false);
    }
  }, [isOpen]);

  // Only minimize during scroll down if not focused on input
  useEffect(() => {
    if (scrollDirection === ScrollDirection.DOWN && isOpen && !isFocused) {
      setIsOpen(false);
    }
  }, [scrollDirection, isOpen, isFocused]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Chat Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  // Handle viewport height changes for mobile (iOS issue)
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && chatContainerRef.current) {
        // Force layout recalculation
        document.documentElement.style.height = `${window.innerHeight}px`;
        chatContainerRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleSend = () => {
    if (messageInput.trim() && !isLoading) {
      console.log("Sending message:", messageInput);
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    console.log("Chat toggled, new state:", !isOpen);
    setIsOpen(prev => !prev);
    // Reset focus state
    if (!isOpen && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 400);
    }
  };
  
  const handleClearChat = () => {
    clearMessages();
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared.",
    });
  };

  const handleProductClick = async (productId: string) => {
    try {
      // Navigate to product detail based on the product ID
      console.log("Opening product:", productId);
      navigate(`/products/${productId}`);
      
      // Close chat
      setIsOpen(false);
      
      toast({
        title: "Opening product",
        description: `Loading product details...`,
      });
    } catch (err) {
      console.error('Error opening product:', err);
      toast({
        title: "Error",
        description: "Could not open the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!shouldShowBubble) {
    return null;
  }

  return (
    <>
      {/* Bubble Button - only visible when chat is closed */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed z-50 bottom-10 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          "bg-sky-500 hover:bg-sky-600 text-white button-glow-blue",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Shopping Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Full Screen Chat Window */}
      <div
        ref={chatContainerRef}
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out",
          isOpen 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full opacity-0 pointer-events-none"
        )}
        style={{ height: isOpen ? '100%' : 'auto' }}
      >
        <ChatHeader onClose={toggleChat} onClear={handleClearChat} />
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <ChatMessages 
            messages={messages} 
            isLoading={isLoading} 
            onProductClick={handleProductClick}
          />
        </div>
        <ChatInput
          ref={inputRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          isLoading={isLoading}
          autoFocus={isOpen}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </>
  );
};
