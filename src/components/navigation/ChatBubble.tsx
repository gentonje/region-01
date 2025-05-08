
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize, User, Bot, ArrowLeft, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection, ScrollDirection } from '@/hooks/useScrollDirection';
import { useShoppingAssistant, Message } from '@/hooks/useShoppingAssistant';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ImageLoader } from '@/components/ImageLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollDirection } = useScrollDirection();
  const { messages, isLoading, sendMessage, error, clearMessages } = useShoppingAssistant();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const location = useLocation();
  const user = session?.user;

  // Only show on main products page
  const shouldShowBubble = location.pathname === '/products';

  // Auto-minimize during scroll down
  useEffect(() => {
    if (scrollDirection === ScrollDirection.DOWN && isOpen) {
      setIsOpen(false);
    }
  }, [scrollDirection, isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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

  // Render function for product details with images - improved styling
  const renderProductDetails = (message: Message) => {
    if (!message.images || message.images.length === 0) return null;
    
    return (
      <div className="mt-4 space-y-4 w-full">
        {message.images.map((imageUrl, index) => {
          const productDetail = message.productDetails?.[index] || null;
          return (
            <div 
              key={`${message.id}-image-${index}`} 
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md w-full"
            >
              <div className="relative w-full overflow-hidden">
                <ImageLoader
                  src={imageUrl}
                  alt={productDetail?.title || `Product image ${index + 1}`}
                  className="w-full h-auto object-cover"
                  width={0}
                  height={0}
                  priority={index < 2} // Prioritize first two images
                />
              </div>
              
              {productDetail && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg mb-1">
                    {productDetail.title}
                  </h4>
                  
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="mb-2 sm:mb-0">
                      <span className="text-green-600 dark:text-green-400 font-medium text-xl">
                        {productDetail.currency} {productDetail.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {productDetail.location}
                      </span>
                      <span className={cn(
                        "py-1 px-2 text-xs rounded-full",
                        productDetail.inStock 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      )}>
                        {productDetail.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
        {/* Chat Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-sky-500 text-white">
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleChat}
              className="p-1 rounded-full hover:bg-sky-600 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="font-medium">Shopping Assistant</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleClearChat}
              className="p-1 rounded-full hover:bg-sky-600 transition-colors"
              aria-label="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button 
              onClick={toggleChat}
              className="p-1 rounded-full hover:bg-sky-600 transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize className="h-4 w-4" />
            </button>
            <button 
              onClick={toggleChat}
              className="p-1 rounded-full hover:bg-sky-600 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Area - takes all available space */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageCircle className="h-10 w-10 mb-3 text-sky-500" />
              <p className="font-medium">Shopping Assistant</p>
              <p className="text-sm mt-2">Ask me about products, prices, or how to shop!</p>
            </div>
          ) : (
            messages.map((message: Message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  "flex gap-2 max-w-[85%]",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <Avatar className={cn(
                    "h-8 w-8 flex items-center justify-center shrink-0 mt-1",
                    message.role === 'user' 
                      ? "bg-sky-100 text-sky-600" 
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm",
                      message.role === 'user'
                        ? "bg-sky-500 text-white"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
                      (message.images && message.images.length > 0) ? "max-w-full" : ""
                    )}
                  >
                    {/* Message text content */}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Product details with images - full width */}
                    {renderProductDetails(message)}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-2 max-w-[90%] mr-auto">
              <Avatar className="h-8 w-8 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </Avatar>
              <div className="rounded-2xl px-3 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - fixed at bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              ref={inputRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about products, prices, locations..."
              className="flex-1 rounded-full"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!messageInput.trim() || isLoading}
              size="icon"
              className="rounded-full bg-sky-500 hover:bg-sky-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
