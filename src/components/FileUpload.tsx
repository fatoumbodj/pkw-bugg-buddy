import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export const FileUpload = ({ onFileSelect, className }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
    },
    multiple: false,
  });

  return (
    <Card className={cn("border-2 border-dashed transition-colors", className)}>
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer text-center space-y-4",
            isDragActive && "opacity-60"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex justify-center">
            {isDragActive ? (
              <FileText className="h-12 w-12 text-primary" />
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {isDragActive
                ? "Déposez le fichier ZIP ici"
                : "Glissez votre export WhatsApp ici"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Ou cliquez pour sélectionner un fichier ZIP
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};