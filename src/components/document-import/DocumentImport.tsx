import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { useStore } from '@/store';
import { saveDocument } from '@/services/storage/documents';
import { validateDocumentFile, getDocumentType } from '@/services/pdf/loader';
import toast from 'react-hot-toast';
import { formatFileSize } from '@/utils/format';

export const DocumentImport = () => {
  const documents = useStore((state) => state.documents);
  const addDocument = useStore((state) => state.addDocument);
  const removeDocument = useStore((state) => state.removeDocument);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (!validateDocumentFile(file)) {
          toast.error(`${file.name}: Unsupported file type`);
          continue;
        }

        const type = getDocumentType(file);
        if (type === 'unsupported') {
          toast.error(`${file.name}: Unsupported file type`);
          continue;
        }

        const document = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type,
          file,
          uploadedAt: new Date(),
          status: 'pending' as const,
        };

        await saveDocument(document);
        addDocument(document);
        toast.success(`Added: ${file.name}`);
      }
    },
    [addDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  });

  const handleRemove = async (id: string) => {
    removeDocument(id);
    toast.success('Document removed');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop documents here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF and images (JPG, PNG, WebP)
            </p>
          </div>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">
              Documents ({documents.length})
            </h3>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type.toUpperCase()} • {formatFileSize(doc.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(doc.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
