export * from './document';
export * from './prompt';
export * from './processing';
export * from './schema';

export interface AppSettings {
  openaiApiKey: string | null;
  rateLimit: number; // requests per minute
  autoSaveResults: boolean;
}

export interface UIState {
  currentIndex: number;
  currentDocumentId: string | null;
  isSettingsOpen: boolean;
  isPromptManagerOpen: boolean;
  splitViewRatio: number; // 0-100, percentage for left panel
}
