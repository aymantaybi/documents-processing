export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'error';

export type DocumentType = 'pdf' | 'image';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  file: File;
  imageData?: string[]; // Base64 images (for PDFs converted to images)
  uploadedAt: Date;
  processedAt?: Date;
  status: DocumentStatus;
  error?: string;
}

export interface ProcessedDocument extends Document {
  result: ExtractedData;
  rawResponse: unknown;
}

export interface ExtractedData {
  documentId: string;
  data: Record<string, unknown>; // Structured JSON from OpenAI
  editedData?: Record<string, unknown>; // User edits
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}
