
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection, ScrollDirection } from '@/hooks/useScrollDirection';
import { useShoppingAssistant, Message } from '@/hooks/useShoppingAssistant';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollDirection } = useScrollDirection();
  const { messages, isLoading, sendMessage } = useShoppingAssistant();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = () => {
    if (messageInput.trim() && !isLoading) {
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

  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <>
      {/* Bubble Button */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed z-50 bottom-20 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          "bg-sky-500 hover:bg-sky-600 text-white",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Shopping Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 w-80 sm:w-96 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700",
          "flex flex-col transition-all duration-300 ease-in-out",
          "max-h-[500px]",
          isOpen 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        {/* Chat Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-sky-500 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-medium">Shopping Assistant</h3>
          </div>
          <div className="flex gap-1">
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

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[350px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageCircle className="h-10 w-10 mb-3 text-sky-500" />
              <p className="font-medium">Shopping Assistant</p>
              <p className="text-sm mt-2">Ask me about products, categories, or how to shop!</p>
            </div>
          ) : (
            messages.map((message: Message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 max-w-[90%]",
                  message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                <Avatar className={cn(
                  "h-8 w-8",
                  message.role === 'user' 
                    ? "bg-sky-100 text-sky-600" 
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                )}>
                  <span className="text-xs font-semibold">{message.role === 'user' ? 'You' : 'AI'}</span>
                </Avatar>
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm",
                    message.role === 'user'
                      ? "bg-sky-500 text-white"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-2 max-w-[90%] mr-auto">
              <Avatar className="h-8 w-8 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <span className="text-xs font-semibold">AI</span>
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

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about products..."
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
