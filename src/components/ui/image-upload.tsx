import { useState, useRef } from "react";
import { Button } from "./button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  defaultImage?: string;
  className?: string;
  label?: string;
  accept?: string;
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  defaultImage,
  className,
  label = "Subir imagen",
  accept = "image/*"
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear URL de vista previa
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Ejecutar callback
    onImageUpload(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      {previewUrl ? (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 rounded-full bg-destructive/80 text-white hover:bg-destructive"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          className="w-full aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={handleButtonClick}
        >
          <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      )}
      
      {!previewUrl && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={handleButtonClick}
        >
          <Upload size={14} className="mr-2" /> Seleccionar archivo
        </Button>
      )}
    </div>
  );
} 