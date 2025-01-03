import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ImagePreviewProps {
  imageUrl: string;
  onDelete: () => void;
  isLoading?: boolean;
}

export const ImagePreview = ({ imageUrl, onDelete, isLoading }: ImagePreviewProps) => {
  return (
    <div className="relative w-32 h-32 border rounded-md overflow-hidden group">
      <img
        src={imageUrl}
        alt="Preview"
        className="w-full h-full object-cover"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onDelete}
        disabled={isLoading}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};