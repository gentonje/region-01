
import React from 'react';
import { ArrowLeft, Minimize, Trash2, X } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onClear: () => void;
}

export const ChatHeader = ({ onClose, onClear }: ChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-sky-500 text-white">
      <div className="flex items-center gap-2">
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-sky-600 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="font-medium">Shopping Assistant</h3>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onClear}
          className="p-1 rounded-full hover:bg-sky-600 transition-colors"
          aria-label="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-sky-600 transition-colors"
          aria-label="Minimize chat"
        >
          <Minimize className="h-4 w-4" />
        </button>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-sky-600 transition-colors"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
