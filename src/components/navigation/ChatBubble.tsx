
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection, ScrollDirection } from '@/hooks/useScrollDirection';
import { useShoppingAssistant } from '@/hooks/useShoppingAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ChatHeader } from '../chat/ChatHeader';
import { ChatMessages } from '../chat/ChatMessages';
import { ChatInput } from '../chat/ChatInput';

export const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollDirection } = useScrollDirection();
  const { messages, isLoading, sendMessage, error, clearMessages } = useShoppingAssistant();
  const [messageInput, setMessageInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const location = useLocation();

  // Only show on main products page
  const shouldShowBubble = location.pathname === '/products';

  // Auto-minimize during scroll down
  useEffect(() => {
    if (scrollDirection === ScrollDirection.DOWN && isOpen) {
      setIsOpen(false);
    }
  }, [scrollDirection, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

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
    
    // Reset any potential stuck state
    if (!isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };
  
  const handleClearChat = () => {
    clearMessages();
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared.",
    });
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
          "bg-sky-500 hover:bg-sky-600 text-white",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Shopping Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Full Screen Chat Window */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out",
          isOpen 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <ChatHeader onClose={toggleChat} onClear={handleClearChat} />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput
          ref={inputRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};
