export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'paused' | 'error';

export interface ProcessingJob {
  id: string;
  documents: string[]; // Document IDs
  promptId: string;
  status: ProcessingStatus;
  progress: ProcessingProgress;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface ProcessingProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string; // Current document ID being processed
}

export interface BatchProcessingOptions {
  promptId: string;
  documentIds: string[];
  continueOnError?: boolean;
}
