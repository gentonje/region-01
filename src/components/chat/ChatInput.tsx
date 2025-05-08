
import React, { ForwardedRef, forwardRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  isLoading: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const ChatInput = forwardRef(({ 
  value, 
  onChange, 
  onKeyDown, 
  onSend, 
  isLoading,
  autoFocus = false,
  onFocus,
  onBlur
}: ChatInputProps, ref: ForwardedRef<HTMLInputElement>) => {
  const [isFocused, setIsFocused] = useState(false);

  // Handle focus and blur with custom handlers
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus();
    
    // On mobile, ensure the view scrolls to the input
    setTimeout(() => {
      if (e.target) {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  // Prevent default behavior to better handle mobile keyboards
  const handleKeyDownWithPrevent = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
    onKeyDown(e);
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Input
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDownWithPrevent}
          placeholder="Ask about products, prices, locations..."
          className="flex-1 rounded-full"
          disabled={isLoading}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputMode="text"
          type="text"
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          size="icon"
          className="rounded-full bg-sky-500 hover:bg-sky-600"
          type="button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
