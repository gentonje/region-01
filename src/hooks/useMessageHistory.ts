
import { useState, useCallback } from 'react';

export type MessageBase = {
  content: string;
  role: 'user' | 'assistant';
};

export type Message = MessageBase & {
  id: string;
  timestamp: Date;
  images?: string[];
  productDetails?: {
    id: string;
    title: string;
    price: number;
    currency: string;
    location: string;
    inStock: boolean;
  }[];
};

export const useMessageHistory = () => {
  const [messages, setMessages] = useState<Message[]>([]);

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

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages
  };
};
