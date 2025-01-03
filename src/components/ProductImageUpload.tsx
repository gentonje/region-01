import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ImagePreview } from "./ImagePreview";

interface ProductImageUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  required?: boolean;
  isLoading?: boolean;
  existingImageUrl?: string;
}

export const ProductImageUpload = ({
  label,
  onChange,
  required = false,
  isLoading = false,
  existingImageUrl,
}: ProductImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);

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
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        required={required && !previewUrl}
      />
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