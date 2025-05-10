
import React from 'react';
import { User, Bot } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { Message } from '@/hooks/useShoppingAssistant';

interface ChatMessageProps {
  message: Message;
  onProductClick: (productId: string) => void;
}

export const ChatMessage = ({ message, onProductClick }: ChatMessageProps) => {
  const renderProductDetails = (message: Message) => {
    if (!message.images || message.images.length === 0) return null;
    
    return (
      <div className="mt-4 flex flex-col gap-3 w-full">
        {message.images.map((imageUrl, index) => {
          const productDetail = message.productDetails?.[index] || null;
          return (
            <ProductCard
              key={`${message.id}-image-${index}`}
              imageUrl={imageUrl}
              productDetail={productDetail}
              index={index}
              onClick={() => {
                if (productDetail?.id) {
                  onProductClick(productDetail.id);
                }
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex w-full p-1 m-1 space-y-1",
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={cn(
        "flex gap-2 max-w-[95%]", 
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
            "rounded-xl px-3 py-2 text-sm",
            message.role === 'user'
              ? "bg-sky-500 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
            (message.images && message.images.length > 0) ? "max-w-full w-full" : ""
          )}
        >
          {/* Message text content */}
          <div className="whitespace-pre-wrap font-sans">{message.content}</div>
          
          {/* Product details with images */}
          {renderProductDetails(message)}
        </div>
      </div>
    </div>
  );
};
