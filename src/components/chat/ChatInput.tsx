
import React, { ForwardedRef, forwardRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput = forwardRef(({ 
  value, 
  onChange, 
  onKeyDown, 
  onSend, 
  isLoading 
}: ChatInputProps, ref: ForwardedRef<HTMLInputElement>) => {
  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Input
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Ask about products, prices, locations..."
          className="flex-1 rounded-full"
          disabled={isLoading}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          size="icon"
          className="rounded-full bg-sky-500 hover:bg-sky-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
