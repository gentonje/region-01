
import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Message } from '@/hooks/useShoppingAssistant';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 py-8">
          <MessageCircle className="h-10 w-10 mb-3 text-sky-500" />
          <p className="font-medium">Shopping Assistant</p>
          <p className="text-sm mt-2">Ask me about products, prices, or how to shop!</p>
        </div>
      ) : (
        messages.map((message: Message) => (
          <ChatMessage key={message.id} message={message} />
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
  );
};

// Import the Avatar and Bot components
import { Avatar } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';
