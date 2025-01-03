import { useState } from "react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ImagePreview } from "./ImagePreview";
import { Loader2, Upload } from "lucide-react";

interface ProductImageUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  required?: boolean;
  isLoading?: boolean;
  existingImageUrl?: string;
  onDeleteExisting?: () => void;
}

export const ProductImageUpload = ({
  label,
  onChange,
  required = false,
  isLoading = false,
  existingImageUrl,
  onDeleteExisting,
}: ProductImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);
  const [inputKey, setInputKey] = useState<string>(Date.now().toString());

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange(file);
    }
  };

  const handleDelete = () => {
    setPreviewUrl(null);
    onChange(null);
    setInputKey(Date.now().toString()); // Reset input
    if (existingImageUrl && onDeleteExisting) {
      onDeleteExisting();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          key={inputKey}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required={required && !previewUrl}
          className="hidden"
          id={`file-${label}`}
        />
        <Button
          type="button"
          variant="outline"
          className="bg-slate-100 hover:bg-slate-200"
          onClick={() => document.getElementById(`file-${label}`)?.click()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </>
          )}
        </Button>
      </div>
      {previewUrl && (
        <div className="mt-2">
          <ImagePreview
            imageUrl={previewUrl}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};